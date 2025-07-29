package wave

import (
	"sync"
	"time"

	"flooooio/internal/wave/florr/native"

	"github.com/gorilla/websocket"

	"github.com/chewxy/math32"
)

type Player struct {
	Entity

	Poisonable

	PlayerPrivileges

	StaticPlayer[DynamicPetalSlots]

	MagnitudeMultiplier float32

	// commandQueue is command queue of a player.
	commandQueue chan PlayerCommand

	BodyDamage float32

	// Mood is current mood of a player.
	Mood native.Mood

	IsDead bool

	Acceleration Vector2
	Velocity     Vector2

	// Window is current window size of user.
	// This should not calculated within antenna scale, that will proceed by server.
	Window [2]uint16

	// player_dead_camera.go struct field definitions
	DeadCameraTarget PoolNode

	LastDeadCameraUpdate time.Time

	// player_petal_orbit.go struct field definitions
	OrbitRotation         float32
	OrbitHistoryIndex     int
	OrbitHistoryX         []float32
	OrbitHistoryY         []float32
	OrbitPetalRadii       []float32
	OrbitRadiusVelocities []float32
	OrbitPetalSpins       [][]float32
}

type PlayerPrivileges struct {
	IsDev bool

	NoClip bool
}

type DynamicPetalSlots struct {
	Surface []DynamicPetal
	Bottom  []DynamicPetal

	SurfaceSupplies [][]*StaticPetalData

	ReloadCooldownGrid [][]time.Time
	UsageCooldownGrid  [][]time.Time
}

// IsCollidable determine if player is collidable with any collidables.
// Using isDead here could allow users to cross the boundary.
func (p *Player) IsCollidable() bool {
	return !p.NoClip
}

var _ Eliminatable = (*Player)(nil) // *Player must implement Eliminatable

// IsEliminated returns whether if mob is eliminated.
// This method exists because struct pointer mob reference doesnt nil'ed when removed.
func (p *Player) IsEliminated(wp *Pool) bool {
	return wp.FindPlayer(p.Id) == nil
}

const maxHpLevel = 75.

// calculatePlayerHp calculate hp by level.
// 100 * x, x is upgrade.
// TODO: make this player method and get level by db data
func calculatePlayerHp(level float32) float32 {
	return (100 * 100) * math32.Pow(1.02, max(level, maxHpLevel)-1)
}

// MaxHp calculates max hp of player.
func (p *Player) MaxHp() float32 {
	return calculatePlayerHp(100)
}

type PlayerCommand interface {
	Execute(*Pool, *Player)
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

const playerSpeedMultiplier = .5

func (c *MovementCommand) Execute(_ *Pool, p *Player) {
	if p.IsDead {
		return
	}

	p.Angle = float32(c.Angle)
	p.Magnitude = float32(c.Magnitude) * playerSpeedMultiplier

	speed := p.Magnitude / 255.
	rad := angleToRadian(p.Angle)

	accelX := math32.Cos(rad) * speed
	accelY := math32.Sin(rad) * speed

	p.Acceleration[0] = accelX
	p.Acceleration[1] = accelY
}

func (c *MoodCommand) Execute(_ *Pool, p *Player) {
	if p.IsDead {
		return
	}

	p.Mood = c.Mood
}

func (c *SwapPetalCommand) Execute(wp *Pool, p *Player) {
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

		for _, petal := range temp {
			if petal != nil {
				petal.CompletelyRemove(wp)
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

// ChangeMood changes the mood.
func (p *Player) ChangeMood(m native.Mood) {
	p.commandQueue <- &MoodCommand{m}
}

// SwapPetal swaps the petal.
func (p *Player) SwapPetal(
	wp *Pool,

	at int,
) {
	p.commandQueue <- &SwapPetalCommand{at}
}

func (p *Player) OnUpdateTick(wp *Pool, now time.Time) {
	p.Mu.Lock()

	// Execute all commands
	for {
		select {
		case cmd := <-p.commandQueue:
			cmd.Execute(wp, p)

		default:
			// Channel is empty, leave loop
			goto Done
		}
	}
Done:

	p.PlayerCoordinateMovement(wp, now)
	p.PlayerCoordinateBoundary(wp, now)
	p.PlayerCollision(wp, now)

	p.PlayerDeadCamera(wp, now)
	p.PlayerPetalConsume(wp, now)
	p.PlayerPetalReload(wp, now)
	p.PlayerPetalOrbit(wp, now)

	p.PlayerElimination(wp, now)

	{ // Base onUpdateTick
		p.MagnitudeMultiplier = 1

		{ // Take poison damage
			if p.IsPoisoned.Load() {
				dp := p.PoisonDPS * DeltaT

				pMaxHealth := p.MaxHp()

				p.Health -= dp / pMaxHealth
				p.Health = max(0, p.Health)

				p.TotalPoison += dp

				if p.TotalPoison >= p.StopAtPoison {
					p.IsPoisoned.Store(false)

					p.TotalPoison = p.StopAtPoison
				}
			}
		}
	}

	p.Mu.Unlock()
}

func (p *Player) Dispose() {
	// Close and clear command queue
	close(p.commandQueue)

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

	{ // Dispose surface supplies
		for i := range p.Slots.SurfaceSupplies {
			for j := range p.Slots.SurfaceSupplies[i] {
				p.Slots.SurfaceSupplies[i][j] = nil
			}

			p.Slots.SurfaceSupplies[i] = nil
		}

		p.Slots.SurfaceSupplies = nil
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

	{
		for i := range p.OrbitPetalSpins {
			p.OrbitPetalSpins[i] = nil
		}

		p.OrbitPetalSpins = nil
	}
}

const PlayerSize = 15

// NewPlayer return new player instance.
func NewPlayer(
	id EntityId,

	sp *StaticPlayer[StaticPetalSlots],

	x float32,
	y float32,
) *Player {
	return &Player{
		Entity: NewEntity(
			id,

			x,
			y,

			PlayerSize,
		),

		Poisonable: NewPoisonable(),

		PlayerPrivileges: PlayerPrivileges{
			IsDev: false,

			NoClip: false,
		},

		StaticPlayer: StaticPlayer[DynamicPetalSlots]{
			Name: sp.Name,

			Slots: DynamicPetalSlots{
				Surface: nil,
				Bottom:  nil,

				SurfaceSupplies: nil,

				ReloadCooldownGrid: GeneratePetalCooldownGrid(len(sp.Slots.Surface)),
				UsageCooldownGrid:  GeneratePetalCooldownGrid(len(sp.Slots.Surface)),
			},

			Conn: sp.Conn,
		},

		MagnitudeMultiplier: 1,

		commandQueue: make(chan PlayerCommand, 8),

		BodyDamage: 100000,

		Mood: 0,

		IsDead: false,

		Acceleration: Vector2{0, 0},
		Velocity:     Vector2{0, 0},

		Window: [2]uint16{1920, 1080},

		DeadCameraTarget: nil,

		LastDeadCameraUpdate: time.Time{},

		OrbitRotation:         0,
		OrbitHistoryIndex:     0,
		OrbitHistoryX:         make([]float32, OrbitHistorySize),
		OrbitHistoryY:         make([]float32, OrbitHistorySize),
		OrbitPetalRadii:       nil,
		OrbitRadiusVelocities: nil,
		OrbitPetalSpins:       nil,
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
