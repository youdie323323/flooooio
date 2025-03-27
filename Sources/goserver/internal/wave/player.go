package wave

import (
	"flooooio/internal/native"

	"github.com/gorilla/websocket"
)

type PlayerId = uint32

const playerSize = 15

type Player struct {
	Entity

	PlayerPrivileges

	PlayerDynamicPetalSlots

	// Id is identification of petal.
	Id *PlayerId

	BodyDamage float64

	Mood *native.Mood

	IsDead bool

	DeadCameraTarget *Entity

	// Name is name of player.
	Name string

	// Conn a websocket conn of player.
	Conn *websocket.Conn
}

type PlayerPrivileges struct {
	IsDev bool

	NoClip bool
}

type PlayerDynamicPetalSlots struct {
	Surface []*Petal
	Bottom  []*Petal

	ReloadCooldownGrid [][]float64
	UsageCooldownGrid  [][]float64
}

// IsCollidable determine if player is collidable to any collidables.
// Using isDead here could allow users to cross the boundary.
func (p *Player) IsCollidable() bool {
	return !p.NoClip
}

const PlayerSpeedMultiplier = 5

// UpdateMovement update the movement.
func (p *Player) UpdateMovement(angle uint8, magnitude uint8) {
	p.Angle = float64(angle)
	p.Magnitude = float64(magnitude) * PlayerSpeedMultiplier
}

// NewPlayer return new player instance.
func NewPlayer(
	id *PlayerId,

	sp StaticPlayer,

	x float64,
	y float64,
) *Player {
	// Create new default mood instance
	mood := native.MoodNormal

	return &Player{
		Entity: Entity{
			X: x,
			Y: y,

			Magnitude: 0,
			Angle:     RandomAngle(),

			Size: playerSize,

			// Max health
			Health: 1,
		},

		PlayerPrivileges: PlayerPrivileges{
			IsDev: false,

			NoClip: false,
		},

		PlayerDynamicPetalSlots: PlayerDynamicPetalSlots{
			Surface: nil,
			Bottom:  nil,

			ReloadCooldownGrid: generatePetalCooldownGrid(sp.Surface),
			UsageCooldownGrid:  generatePetalCooldownGrid(sp.Surface),
		},

		Id: id,

		BodyDamage: 1000,

		Mood: &mood,

		IsDead: false,

		DeadCameraTarget: nil,

		Name: sp.Name,

		Conn: sp.Conn,
	}
}

func generatePetalCooldownGrid(slots []Slot) [][]float64 {
	cooldownGrid := make([][]float64, len(slots))

	for slotIndex := range cooldownGrid {
		slotCooldowns := make([]float64, MaxClusterAmount)

		for clusterIndex := range slotCooldowns {
			slotCooldowns[clusterIndex] = PetalInitialCooldown
		}

		cooldownGrid[slotIndex] = slotCooldowns
	}

	return cooldownGrid
}

type StaticPlayer struct {
	// Name is name of player.
	Name string

	// StaticPlayerPetalSlots is static slots for generate instance.
	StaticPlayerPetalSlots

	// Conn a websocket conn of player.
	Conn *websocket.Conn
}
