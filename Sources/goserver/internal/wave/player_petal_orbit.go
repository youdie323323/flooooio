package wave

import (
	"math"
	"slices"

	"flooooio/internal/native"
)

const (
	HistorySize = 10

	precalcSize = 360
)

var (
	lazyCosTable = make([]float64, precalcSize)
	lazySinTable = make([]float64, precalcSize)
)

func init() {
	for i := range precalcSize {
		angle := (float64(i) * Tau) / precalcSize
		lazyCosTable[i] = math.Cos(angle)
		lazySinTable[i] = math.Sin(angle)
	}
}

// PlayerPetalOrbit class constants
const (
	defaultRotateSpeed         = 2.5
	radiusSpringStrength       = 0.4
	radiusFriction             = 0.1
	petalVelocityAcceleration  = 0.1
	petalVelocityFriction      = 0.875
	petalClusterRadius         = 8.0
	spingInterpolationSpeed    = 0.6
	spinNearestSizeCoefficient = 1.075
	spinAngleCoefficient       = 10.0
)

func calcTableIndex(i float64) int {
	return int(math.Mod(math.Mod(i, Tau)+Tau, Tau) * float64(precalcSize) / Tau)
}

func calculateRotationDelta(
	ts float64,

	cw float64,
) float64 {
	return (ts * cw) / WaveUpdateFPS
}

func doPetalOrbit(
	p *Petal,

	tx float64,
	ty float64,

	hr float64,

	ang float64,
) {
	angleIdx := calcTableIndex(ang)

	chaseX := tx + lazyCosTable[angleIdx]*hr
	chaseY := ty + lazySinTable[angleIdx]*hr

	diffX := chaseX - p.X
	diffY := chaseY - p.Y

	p.Velocity[0] += petalVelocityAcceleration * diffX
	p.Velocity[1] += petalVelocityAcceleration * diffY
}

// doPetalSpin do petal spin on mob.
func doPetalSpin(
	wp *WavePool,

	pe *Petal,

	pss [][]float64,
	i int,
	j int,
) {
	if slices.Contains(UNCOLLIDABLE_PETAL_TYPES, pe.Type) {
		return
	}

	var spinTargets []Node

	{
		mobs := wp.GetMobsWithCondition(func(m *Mob) bool {
			isNotPet := m.PetMaster == nil

			distance := math.Hypot(
				m.X-pe.X,
				m.Y-pe.Y,
			)

			return isNotPet && distance <= (m.DesiredSize()*spinNearestSizeCoefficient)
		})

		spinTargets = make([]Node, len(mobs))
		for i, mob := range mobs {
			spinTargets[i] = mob
		}
	}

	mobToSpin, ok := FindNearestEntity(
		pe,
		spinTargets,
	).(*Mob)
	if !ok {
		return
	}

	wasSpinning := pe.SpinningOnMob

	pe.SpinningOnMob = mobToSpin != nil

	if pe.SpinningOnMob {
		if !wasSpinning {
			targetAngle := math.Atan2(
				pe.Y-mobToSpin.Y,
				pe.X-mobToSpin.X,
			)

			angleDiff := targetAngle - pss[i][j]

			angleDiff = math.Mod(math.Mod(angleDiff, Tau)+Tau, Tau)
			if angleDiff > math.Pi {
				angleDiff -= Tau
			}

			pss[i][j] = math.Mod(pss[i][j]+angleDiff, Tau)
		}

		spinAngleIdx := calcTableIndex(pss[i][j])

		mobToSpinDesiredSize := mobToSpin.DesiredSize() * 1.1

		targetX := mobToSpin.X + lazyCosTable[spinAngleIdx]*mobToSpinDesiredSize
		targetY := mobToSpin.Y + lazySinTable[spinAngleIdx]*mobToSpinDesiredSize

		pe.X += (targetX - pe.X) * spingInterpolationSpeed
		pe.Y += (targetY - pe.Y) * spingInterpolationSpeed
	}
}

func (p *Player) PlayerPetalOrbit(wp *WavePool) {
	p.OrbitHistoryX[p.OrbitHistoryIndex] = p.X
	p.OrbitHistoryY[p.OrbitHistoryIndex] = p.Y

	historyTargetIdx := (p.OrbitHistoryIndex + 8) % HistorySize

	targetX := p.OrbitHistoryX[historyTargetIdx]
	targetY := p.OrbitHistoryY[historyTargetIdx]

	p.OrbitHistoryIndex = (p.OrbitHistoryIndex + 1) % HistorySize

	surface := p.Slots.Surface
	surfaceLen := len(surface)

	if p.OrbitPetalRadii == nil {
		p.OrbitPetalRadii = make([]float64, surfaceLen)
		for i := range p.OrbitPetalRadii {
			p.OrbitPetalRadii[i] = 40
		}

		p.OrbitRadiusVelocities = make([]float64, surfaceLen)

		p.OrbitPetalSpins = make([][]float64, surfaceLen)
		for i := range p.OrbitPetalSpins {
			p.OrbitPetalSpins[i] = make([]float64, PetalMaxClusterAmount)
		}
	}

	isAngry := p.Mood.IsSet(native.MoodAngry)
	isSad := p.Mood.IsSet(native.MoodSad)

	numYinYang := 0.
	for _, v := range surface {
		if v == nil {
			continue
		}

		if len(v) > 0 && v[0].Type == native.PetalTypeYinYang {
			numYinYang++
		}
	}

	// Basically, every 2 yin yangs adds 1 ring
	// Yin yang changes the number of petals per ring by diving it by floor(num yin yang / 2) + 1

	numRings := math.Floor(numYinYang/2) + 1

	var clockwise float64
	if math.Mod(numYinYang, 2) == 0 {
		clockwise = 1
	} else {
		clockwise = -1
	}

	realLength := float64(len(surface))

	realLength = math.Ceil(realLength / numRings)

	currAngleIdx := 0.

	totalSpeed := defaultRotateSpeed

	spinRotationDelta := calculateRotationDelta(defaultRotateSpeed*spinAngleCoefficient, clockwise)

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
			rad, ok := firstPetalStat.Extra["rad"].(float64)
			if ok {
				totalSpeed += rad
			}
		}

		var targetRadius float64
		if slices.Contains(UsageReloadPetalTypes, firstPetal.Type) {
			targetRadius = 40
		} else {
			if isAngry {
				targetRadius = 90
			} else {
				if isSad {
					targetRadius = 25
				} else {
					targetRadius = 40
				}
			}
		}

		targetRadius += ((p.Size / PlayerSize) - 1) * PlayerCollision.Radius

		springForce := (targetRadius - p.OrbitPetalRadii[i]) * radiusSpringStrength
		p.OrbitRadiusVelocities[i] = p.OrbitRadiusVelocities[i]*radiusFriction + springForce
		p.OrbitPetalRadii[i] += p.OrbitRadiusVelocities[i]

		ringIdx := math.Floor(currAngleIdx / realLength)
		rad := p.OrbitPetalRadii[i] * (1 + (ringIdx * 0.5))

		multipliedRotation := p.OrbitRotation * (1 + ((ringIdx - (numRings - 1)) * 0.1))

		baseAngle := Tau*math.Mod(currAngleIdx, realLength)/realLength + multipliedRotation
		currAngleIdx++

		if IsClusterPetal(petals) {
			angleIdx := calcTableIndex(baseAngle)

			slotBaseX := targetX + lazyCosTable[angleIdx]*rad
			slotBaseY := targetY + lazySinTable[angleIdx]*rad

			for j, petal := range petals {
				if petal == nil {
					continue
				}

				// Bit faster than normal orbit
				petalAngle := Tau*float64(j)/float64(len(petals)) + multipliedRotation*1.3

				doPetalOrbit(
					petal,

					slotBaseX,
					slotBaseY,

					petalClusterRadius,

					petalAngle,
				)

				doPetalSpin(
					wp,

					petal,

					p.OrbitPetalSpins,
					i,
					j,
				)

				if petal.SpinningOnMob {
					p.OrbitPetalSpins[i][j] += spinRotationDelta
				}
			}
		} else {
			petal := petals[0]
			if petal == nil {
				continue
			}

			doPetalOrbit(
				petal,

				targetX,
				targetY,

				rad,

				baseAngle,
			)

			doPetalSpin(
				wp,

				petal,

				p.OrbitPetalSpins,
				i,
				0,
			)

			if petal.SpinningOnMob {
				p.OrbitPetalSpins[i][0] += spinRotationDelta
			}
		}
	}

	rotationDelta := calculateRotationDelta(totalSpeed, clockwise)
	p.OrbitRotation += rotationDelta

	// Limit in the tau
	if math.Abs(p.OrbitRotation) >= math.MaxFloat64 {
		p.OrbitRotation = math.Mod(p.OrbitRotation, Tau)
	}
}
