package game

import (
	"math"
	"sync"
	"time"

	"flooooio/internal/native"

	"github.com/gorilla/websocket"
)

type Player struct {
	Entity

	PlayerPrivileges

	StaticPlayer[PlayerDynamicPetalSlots]

	// commandQueue is command queue of player.
	commandQueue chan PlayerCommand

	BodyDamage float64

	// Mood a current mood of player.
	// If you want to read/write, use Mu.
	Mood native.Mood

	IsDead bool

	// player_dead_camera.go struct field definitions
	DeadCameraTarget Node

	LastDeadCameraUpdate time.Time

	// player_petal_orbit.go struct field definitions
	OrbitRotation         float64
	OrbitHistoryIndex     int
	OrbitHistoryX         []float64
	OrbitHistoryY         []float64
	OrbitPetalRadii       []float64
	OrbitRadiusVelocities []float64
	OrbitPetalSpins       [][]float64

	// player_petal_consume.go struct field definitions
	BubbleVelocity [2]float64
}

type PlayerPrivileges struct {
	IsDev bool

	NoClip bool
}

type PlayerDynamicPetalSlots struct {
	Surface []DynamicPetal
	Bottom  []DynamicPetal

	ReloadCooldownGrid [][]time.Time
	UsageCooldownGrid  [][]time.Time
}

// IsCollidable determine if player is collidable to any collidables.
// Using isDead here could allow users to cross the boundary.
func (p *Player) IsCollidable() bool {
	return !p.NoClip
}

const minHpLevel = 75.

// calculatePlayerHp calculate hp by level.
// 100 * x, x is upgrade.
func calculatePlayerHp(level float64) float64 {
	return (100 * 200) * math.Pow(1.02, math.Max(level, minHpLevel)-1)
}

// MaxHealth calculates max hp of player.
func (p *Player) MaxHealth() float64 {
	return calculatePlayerHp(100)
}

type PlayerCommand interface {
	Execute(*WavePool, *Player)
}

type MovementCommand struct {
	Angle     uint8
	Magnitude uint8
}

type MoodCommand struct {
	Mood native.Mood
}

type SwapPetalCommand struct {
	At int
}

const PlayerSpeedMultiplier = 3

func (c *MovementCommand) Execute(_ *WavePool, p *Player) {
	p.Angle = float64(c.Angle)
	p.Magnitude = float64(c.Magnitude) * PlayerSpeedMultiplier
}

func (c *MoodCommand) Execute(_ *WavePool, p *Player) {
	p.Mood = c.Mood
}

func (c *SwapPetalCommand) Execute(wp *WavePool, p *Player) {
	if p.IsDead {
		return
	}

	at := c.At

	if at < 0 || at >= len(p.Slots.Surface) || at >= len(p.Slots.Bottom) {
		return
	}

	if p.Slots.Bottom[at] == nil {
		return
	}

	{
		p.Slots.ReloadCooldownGrid[at] = GeneratePetalCooldown()
		p.Slots.UsageCooldownGrid[at] = GeneratePetalCooldown()

		temp := p.Slots.Surface[at]

		if temp != nil {
			for _, petal := range temp {
				if petal == nil {
					continue
				}

				// Remove petal itself
				if !petal.WasEliminated(wp) {
					wp.SafeRemovePetal(*petal.Id)
				}

				// Remove summoned mob
				if petal.SummonedPets != nil {
					for _, p := range petal.SummonedPets {
						if !p.WasEliminated(wp) {
							wp.SafeRemovePetal(*p.Id)
						}
					}
				}
			}
		}

		p.Slots.Surface[at] = p.Slots.Bottom[at]
		p.Slots.Bottom[at] = temp
	}
}

// UpdateMovement update the movement.
func (p *Player) UpdateMovement(angle uint8, magnitude uint8) {
	p.commandQueue <- &MovementCommand{angle, magnitude}
}

// ChangeMood change the mood.
func (p *Player) ChangeMood(m native.Mood) {
	p.commandQueue <- &MoodCommand{m}
}

// SwapPetal swap the petal.
func (p *Player) SwapPetal(
	wp *WavePool,

	at int,
) {
	p.commandQueue <- &SwapPetalCommand{at}
}

func (p *Player) OnUpdateTick(wp *WavePool) {
	p.Mu.Lock()

	// Execute all commands
	for {
		select {
		case cmd := <-p.commandQueue:
			cmd.Execute(wp, p)
		default:
			// Channel is empty, leave loop
			goto done
		}
	}
done:

	p.EntityCoordinateMovement(wp)
	p.PlayerCoordinateBoundary(wp)
	p.PlayerElimination(wp)
	p.PlayerCollision(wp)

	p.PlayerDeadCamera(wp)
	p.PlayerPetalConsume(wp)
	p.PlayerPetalReload(wp)
	p.PlayerPetalOrbit(wp)

	{ // Base onUpdateTick
	}

	p.Mu.Unlock()
}

func (p *Player) Dispose() {
	{ // Dispose surface
		for i := range p.Slots.Surface {
			for j := range p.Slots.Surface[i] {
				p.Slots.Surface[i][j] = nil
			}

			p.Slots.Surface[i] = nil
		}

		p.Slots.Surface = nil
	}

	{ // Dispose bottom
		for i := range p.Slots.Bottom {
			for j := range p.Slots.Bottom[i] {
				p.Slots.Bottom[i][j] = nil
			}

			p.Slots.Bottom[i] = nil
		}

		p.Slots.Bottom = nil
	}

	{
		for i := range p.Slots.ReloadCooldownGrid {
			p.Slots.ReloadCooldownGrid[i] = nil
		}

		p.Slots.ReloadCooldownGrid = nil
	}

	{
		for i := range p.Slots.UsageCooldownGrid {
			p.Slots.UsageCooldownGrid[i] = nil
		}

		p.Slots.UsageCooldownGrid = nil
	}

	p.DeadCameraTarget = nil

	p.OrbitHistoryX = nil
	p.OrbitHistoryY = nil
	p.OrbitPetalRadii = nil
	p.OrbitRadiusVelocities = nil

	for i := range p.OrbitPetalSpins {
		p.OrbitPetalSpins[i] = nil
	}
	p.OrbitPetalSpins = nil
}

const PlayerSize = 15

// NewPlayer return new player instance.
func NewPlayer(
	id *EntityId,

	sp *StaticPlayer[StaticPlayerPetalSlots],

	x float64,
	y float64,
) *Player {
	return &Player{
		Entity: NewEntity(
			id,

			x,
			y,

			PlayerSize,
		),

		PlayerPrivileges: PlayerPrivileges{
			IsDev: false,

			NoClip: false,
		},

		StaticPlayer: StaticPlayer[PlayerDynamicPetalSlots]{
			Name: sp.Name,

			Slots: PlayerDynamicPetalSlots{
				Surface: nil,
				Bottom:  nil,

				ReloadCooldownGrid: GeneratePetalCooldownGrid(len(sp.Slots.Surface)),
				UsageCooldownGrid:  GeneratePetalCooldownGrid(len(sp.Slots.Surface)),
			},

			Conn: sp.Conn,
		},

		commandQueue: make(chan PlayerCommand, 8),

		BodyDamage: 100000,

		Mood: native.MoodNormal,

		IsDead: false,

		DeadCameraTarget: nil,

		LastDeadCameraUpdate: time.Time{},

		OrbitRotation:         0,
		OrbitHistoryIndex:     0,
		OrbitHistoryX:         make([]float64, HistorySize),
		OrbitHistoryY:         make([]float64, HistorySize),
		OrbitPetalRadii:       nil,
		OrbitRadiusVelocities: nil,
		OrbitPetalSpins:       nil,

		BubbleVelocity: [2]float64{0, 0},
	}
}

func GeneratePetalCooldown() []time.Time {
	slotCooldowns := make([]time.Time, PetalMaxClusterAmount)

	for clusterIndex := range slotCooldowns {
		slotCooldowns[clusterIndex] = time.Time{}
	}

	return slotCooldowns
}

func GeneratePetalCooldownGrid(size int) [][]time.Time {
	cooldownGrid := make([][]time.Time, size)

	for slotIndex := range cooldownGrid {
		cooldownGrid[slotIndex] = GeneratePetalCooldown()
	}

	return cooldownGrid
}

type StaticPlayer[T any] struct {
	// Name is name of player.
	Name string

	// Slots is slots of player, can choose static or dynamic within generic parameter.
	Slots T

	// Conn a websocket conn of player.
	Conn *websocket.Conn

	writeMu sync.RWMutex
}

// SafeWriteMessage is a thread-safe wrapper for websocket writes.
func (sp *StaticPlayer[T]) SafeWriteMessage(messageType int, data []byte) error {
	sp.writeMu.Lock()
	defer sp.writeMu.Unlock()

	return sp.Conn.WriteMessage(messageType, data)
}
