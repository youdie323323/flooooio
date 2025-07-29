package wave

import (
	"math"
	"slices"
	"time"

	"flooooio/internal/wave/florr/native"

	"github.com/chewxy/math32"

	"github.com/youdie323323/go-spatial-hash"
)

const (
	OrbitHistorySize = 10

	precalcSize = 360
)

var (
	lazyCosTable = make([]float32, precalcSize)
	lazySinTable = make([]float32, precalcSize)
)

func init() {
	for i := range precalcSize {
		angle := (float32(i) * Tau32) / precalcSize

		lazyCosTable[i] = math32.Cos(angle)
		lazySinTable[i] = math32.Sin(angle)
	}
}

var UnmoodablePetalTypes = slices.Concat(UsablePetalTypes, []native.PetalType{
	native.PetalTypeMagnet,
})

// PlayerPetalOrbit class constants
const (
	defaultRotateSpeed        = 2.5
	radiusSpringStrength      = 0.4
	radiusFriction            = 0.1
	petalVelocityAcceleration = 0.1
	petalClusterRadius        = 6.0
	spingInterpolationSpeed   = 0.6
	spinNearestSizeCoef       = 1.075
	spinAngleCoef             = 10.0
)

const (
	DefaultMoodRadius = 40
	SadMoodRadius     = 25
	AngryMoodRadius   = 80
)

func calculateTableIndex(angle float32) int {
	return int(math32.Mod(math32.Mod(angle, Tau32)+Tau32, Tau32) * 180 / math32.Pi)
}

func calculateRotationDelta(
	speed float32,

	clockwise float32,
) float32 {
	return (speed * clockwise) * DeltaT
}

func orbitPetal(
	petal *Petal,

	targetX float32,
	targetY float32,

	radius float32,

	angle float32,
) {
	angleIndex := calculateTableIndex(angle)

	chaseX := targetX + lazyCosTable[angleIndex]*radius
	chaseY := targetY + lazySinTable[angleIndex]*radius

	diffX := chaseX - petal.X
	diffY := chaseY - petal.Y

	petal.Velocity[0] += petalVelocityAcceleration * diffX
	petal.Velocity[1] += petalVelocityAcceleration * diffY
}

// spinPetal do petal spin on mob.
func spinPetal(
	wp *Pool,

	petal *Petal,

	spins [][]float32,
	i int,
	j int,
) {
	mobToSpin, ok := FindNearestEntity(
		petal,
		spatial_hash.ToNodeSlice(wp.FilterMobsWithCondition(func(m *Mob) bool {
			if !m.IsOrganismEnemy() {
				return false
			}

			spinDetectRad := m.Radius() * spinNearestSizeCoef
			spinDetectRadSq := spinDetectRad * spinDetectRad

			dx := m.X - petal.X
			dy := m.Y - petal.Y

			return (dx*dx + dy*dy) <= spinDetectRadSq
		})),
	).(*Mob)
	if !ok {
		return
	}

	wasSpinning := petal.SpinningOnMob

	petal.SpinningOnMob = mobToSpin != nil

	if petal.SpinningOnMob {
		if !wasSpinning {
			targetAngle := math32.Atan2(
				petal.Y-mobToSpin.Y,
				petal.X-mobToSpin.X,
			)

			angleDiff := targetAngle - spins[i][j]

			angleDiff = math32.Mod(math32.Mod(angleDiff, Tau32)+Tau32, Tau32)
			if angleDiff > math32.Pi {
				angleDiff -= Tau32
			}

			spins[i][j] = math32.Mod(spins[i][j]+angleDiff, Tau32)
		}

		spinAngleIndex := calculateTableIndex(spins[i][j])

		mobToSpinDesiredSize := 1.1 * mobToSpin.Radius()

		targetX := mobToSpin.X + lazyCosTable[spinAngleIndex]*mobToSpinDesiredSize
		targetY := mobToSpin.Y + lazySinTable[spinAngleIndex]*mobToSpinDesiredSize

		petal.X += (targetX - petal.X) * spingInterpolationSpeed
		petal.Y += (targetY - petal.Y) * spingInterpolationSpeed
	}
}

func (p *Player) PlayerPetalOrbit(wp *Pool, now time.Time) {
	p.OrbitHistoryX[p.OrbitHistoryIndex] = p.X
	p.OrbitHistoryY[p.OrbitHistoryIndex] = p.Y

	historyTargetIndex := (p.OrbitHistoryIndex + 6) % OrbitHistorySize

	targetX := p.OrbitHistoryX[historyTargetIndex]
	targetY := p.OrbitHistoryY[historyTargetIndex]

	p.OrbitHistoryIndex = (p.OrbitHistoryIndex + 1) % OrbitHistorySize

	surface := p.Slots.Surface
	surfaceLen := len(surface)

	if p.OrbitPetalRadii == nil {
		p.OrbitPetalRadii = make([]float32, surfaceLen)

		for i := range p.OrbitPetalRadii {
			p.OrbitPetalRadii[i] = 40
		}

		p.OrbitRadiusVelocities = make([]float32, surfaceLen)

		p.OrbitPetalSpins = make([][]float32, surfaceLen)

		for i := range p.OrbitPetalSpins {
			p.OrbitPetalSpins[i] = make([]float32, PetalMaxClusterAmount)
		}
	}

	isAngry := p.Mood.IsSet(native.MoodAngry)
	isSad := p.Mood.IsSet(native.MoodSad)

	var numYinYang float32 = 0.

	for _, petals := range surface {
		if petals == nil {
			continue
		}

		for _, petal := range petals {
			if petal != nil && petal.Type == native.PetalTypeYinYang {
				numYinYang++

				break
			}
		}
	}

	// Basically, every 2 yin yangs adds 1 ring
	// Yin yang changes the number of petals per ring by diving it by floor(num yin yang / 2) + 1

	numRings := math32.Floor(numYinYang/2) + 1

	var clockwise float32

	if math32.Mod(numYinYang, 2) == 0 {
		clockwise = 1
	} else {
		clockwise = -1
	}

	realLength := float32(len(surface))

	realLength = math32.Ceil(realLength / numRings)

	var currentAngleIndex float32 = 0.

	var totalSpeed float32 = defaultRotateSpeed

	spinRotationDelta := calculateRotationDelta(defaultRotateSpeed*spinAngleCoef, clockwise)

	var targetRadius float32

	switch true {
	case isAngry:
		targetRadius = AngryMoodRadius

	case isSad:
		targetRadius = SadMoodRadius

	default:
		targetRadius = DefaultMoodRadius
	}

	targetRadius += ((p.Size / PlayerSize) - 1) * PlayerCollision.Radius

	nowMilli := float64(now.UnixMilli())

	for i, petals := range surface {
		if petals == nil {
			continue
		}

		firstPetal := petals[0]
		if firstPetal == nil {
			continue
		}

		firstPetalStat := native.PetalProfiles[firstPetal.Type].StatFromRarity(firstPetal.Rarity)

		if firstPetal.Type == native.PetalTypeFaster {
			rad, ok := firstPetalStat.Extra["rad"]
			if ok {
				totalSpeed += rad
			}
		}

		var springForce float32

		switch true {
		case slices.Contains(UnmoodablePetalTypes, firstPetal.Type):
			springForce = (DefaultMoodRadius - p.OrbitPetalRadii[i]) * radiusSpringStrength

		case isAngry && firstPetal.Type == native.PetalTypeWing:
			wingAddition := float32(130 * (math.Sin(math.Mod((nowMilli+float64(firstPetal.Id))/200, Tau)) + 1))

			springForce = (targetRadius + wingAddition - p.OrbitPetalRadii[i]) * radiusSpringStrength

		default:
			springForce = (targetRadius - p.OrbitPetalRadii[i]) * radiusSpringStrength
		}

		p.OrbitRadiusVelocities[i] = p.OrbitRadiusVelocities[i]*radiusFriction + springForce
		p.OrbitPetalRadii[i] += p.OrbitRadiusVelocities[i]

		ringIndex := math32.Floor(currentAngleIndex / realLength)
		radius := p.OrbitPetalRadii[i] * ((0.5 * ringIndex) + 1)

		multipliedRotation := p.OrbitRotation * (1 + ((ringIndex - (numRings - 1)) * 0.1))

		baseAngle := Tau32*math32.Mod(currentAngleIndex, realLength)/realLength + multipliedRotation
		currentAngleIndex++

		if IsClusterPetal(petals) {
			angleIndex := calculateTableIndex(baseAngle)

			slotBaseX := targetX + lazyCosTable[angleIndex]*radius
			slotBaseY := targetY + lazySinTable[angleIndex]*radius

			for j, petal := range petals {
				if petal == nil {
					continue
				}

				if petal.Detached {
					continue
				}

				// Bit faster than normal orbit
				petalAngle := Tau32*float32(j)/float32(len(petals)) + multipliedRotation*1.3

				orbitPetal(
					petal,

					slotBaseX,
					slotBaseY,

					petalClusterRadius,

					petalAngle,
				)

				// Usable petal type never spins on mob
				if slices.Contains(UsablePetalTypes, petal.Type) {
					continue
				}

				spins := p.OrbitPetalSpins
				if len(spins) > i {
					spin := spins[i]
					if len(spin) > j {
						spinPetal(
							wp,

							petal,

							spins,
							i,
							j,
						)

						if petal.SpinningOnMob {
							spin[j] += spinRotationDelta
						}
					}
				}
			}
		} else {
			petal := petals[0]

			if petal == nil {
				continue
			}

			if petal.Detached {
				continue
			}

			orbitPetal(
				petal,

				targetX,
				targetY,

				radius,

				baseAngle,
			)

			// Usable petal type never spins on mob
			if slices.Contains(UsablePetalTypes, petal.Type) {
				continue
			}

			spins := p.OrbitPetalSpins
			if len(spins) > i {
				spin := spins[i]
				if len(spin) > 0 {
					spinPetal(
						wp,

						petal,

						spins,
						i,
						0,
					)

					if petal.SpinningOnMob {
						spin[0] += spinRotationDelta
					}
				}
			}
		}
	}

	p.OrbitRotation += calculateRotationDelta(totalSpeed, clockwise)

	// Limit in the tau
	if math32.Abs(p.OrbitRotation) >= math32.MaxFloat32 {
		p.OrbitRotation = math32.Mod(p.OrbitRotation, Tau32)
	}
}
