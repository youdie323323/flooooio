package wave

import (
	"math"
	"time"

	"flooooio/internal/native"

	"github.com/gorilla/websocket"
)

type Player struct {
	Entity

	PlayerPrivileges

	BodyDamage float64

	Mood native.Mood

	IsDead bool

	Slots PlayerDynamicPetalSlots

	// Name is name of player.
	Name string

	// Conn a websocket conn of player.
	Conn *websocket.Conn

	// player_dead_camera.go struct field definitions
	DeadCameraTarget Node

	DeadCameraTimer *time.Timer

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
	return (100 * 10) * math.Pow(1.02, math.Max(level, minHpLevel)-1)
}

// CalculateMaxHealth calculates max hp of player.
func (p *Player) CalculateMaxHealth() float64 {
	return calculatePlayerHp(100)
}

const PlayerSpeedMultiplier = 3

// UpdateMovement update the movement.
func (p *Player) UpdateMovement(angle uint8, magnitude uint8) {
	p.Angle = float64(angle)
	p.Magnitude = float64(magnitude) * PlayerSpeedMultiplier
}

// UpdateMovement update the movement.
func (p *Player) ChangeMood(m native.Mood) {
	p.Mood = m
}

// UpdateMovement update the movement.
func (p *Player) SwapPetal(
	wp *WavePool,

	at int,
) {
	if !p.IsDead && len(p.Slots.Surface) >= at && len(p.Slots.Bottom) >= at && p.Slots.Bottom[at] != nil {
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
				if petal.SummonedPet != nil && !petal.SummonedPet.WasEliminated(wp) {
					wp.SafeRemovePetal(*petal.SummonedPet.Id)
				}
			}
		}

		p.Slots.Surface[at] = p.Slots.Bottom[at]
		p.Slots.Bottom[at] = temp
	}
}

func (p *Player) OnUpdateTick(wp *WavePool) {
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

	if p.DeadCameraTimer != nil {
		p.DeadCameraTimer.Stop()
		p.DeadCameraTimer = nil
	}

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

	sp StaticPlayer,

	x float64,
	y float64,
) *Player {
	return &Player{
		Entity: Entity{
			Id: id,

			X: x,
			Y: y,

			Magnitude: 0,
			Angle:     RandomAngle(),

			Size: PlayerSize,

			// Max health
			Health: 1,
		},

		PlayerPrivileges: PlayerPrivileges{
			IsDev: false,

			NoClip: false,
		},

		Slots: PlayerDynamicPetalSlots{
			Surface: nil,
			Bottom:  nil,

			ReloadCooldownGrid: GeneratePetalCooldownGrid(len(sp.Slots.Surface)),
			UsageCooldownGrid:  GeneratePetalCooldownGrid(len(sp.Slots.Surface)),
		},

		BodyDamage: 100000,

		Mood: native.MoodNormal,

		IsDead: false,

		Name: sp.Name,

		Conn: sp.Conn,

		DeadCameraTarget: nil,

		DeadCameraTimer: nil,

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

type StaticPlayer struct {
	// Name is name of player.
	Name string

	// StaticPlayerPetalSlots is static slots for generate instance.
	Slots StaticPlayerPetalSlots

	// Conn a websocket conn of player.
	Conn *websocket.Conn
}
