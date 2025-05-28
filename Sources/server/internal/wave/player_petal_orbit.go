package wave

import (
	"slices"

	"flooooio/internal/collision"
	"flooooio/internal/native"

	"github.com/chewxy/math32"
)

const (
	HistorySize = 10

	precalcSize = 360
)

var (
	lazyCosTable = make([]float32, precalcSize)
	lazySinTable = make([]float32, precalcSize)
)

func init() {
	for i := range precalcSize {
		angle := (float32(i) * Tau) / precalcSize

		lazyCosTable[i] = math32.Cos(angle)
		lazySinTable[i] = math32.Sin(angle)
	}
}

// PlayerPetalOrbit class constants
const (
	defaultRotateSpeed         = 2.5
	radiusSpringStrength       = 0.4
	radiusFriction             = 0.1
	petalVelocityAcceleration  = 0.1
	petalVelocityFriction      = 0.875
	petalClusterRadius         = 6.0
	spingInterpolationSpeed    = 0.6
	spinNearestSizeCoefficient = 1.075
	spinAngleCoefficient       = 10.0
)

func calcTableIndex(i float32) int {
	return int(math32.Mod(math32.Mod(i, Tau)+Tau, Tau) * float32(precalcSize) / Tau)
}

func calculateRotationDelta(
	ts float32,

	cw float32,
) float32 {
	return (ts * cw) / float32(WaveUpdateFPS)
}

func doPetalOrbit(
	p *Petal,

	tx float32,
	ty float32,

	hr float32,

	ang float32,
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

	pss [][]float32,
	i int,
	j int,
) {
	var spinTargets []collision.Node

	{
		mobs := wp.GetMobsWithCondition(func(m *Mob) bool {
			return m.IsTrackableEnemy() && math32.Hypot(
				m.X-pe.X,
				m.Y-pe.Y,
			) <= (m.CalculateRadius()*spinNearestSizeCoefficient)
		})

		spinTargets = make([]collision.Node, len(mobs))
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
			targetAngle := math32.Atan2(
				pe.Y-mobToSpin.Y,
				pe.X-mobToSpin.X,
			)

			angleDiff := targetAngle - pss[i][j]

			angleDiff = math32.Mod(math32.Mod(angleDiff, Tau)+Tau, Tau)
			if angleDiff > math32.Pi {
				angleDiff -= Tau
			}

			pss[i][j] = math32.Mod(pss[i][j]+angleDiff, Tau)
		}

		spinAngleIdx := calcTableIndex(pss[i][j])

		mobToSpinDesiredSize := mobToSpin.CalculateRadius() * 1.1

		targetX := mobToSpin.X + lazyCosTable[spinAngleIdx]*mobToSpinDesiredSize
		targetY := mobToSpin.Y + lazySinTable[spinAngleIdx]*mobToSpinDesiredSize

		pe.X += (targetX - pe.X) * spingInterpolationSpeed
		pe.Y += (targetY - pe.Y) * spingInterpolationSpeed
	}
}

func (p *Player) PlayerPetalOrbit(wp *WavePool) {
	p.OrbitHistoryX[p.OrbitHistoryIndex] = p.X
	p.OrbitHistoryY[p.OrbitHistoryIndex] = p.Y

	historyTargetIdx := (p.OrbitHistoryIndex + 6) % HistorySize

	targetX := p.OrbitHistoryX[historyTargetIdx]
	targetY := p.OrbitHistoryY[historyTargetIdx]

	p.OrbitHistoryIndex = (p.OrbitHistoryIndex + 1) % HistorySize

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

	numRings := math32.Floor(numYinYang/2) + 1

	var clockwise float32

	if math32.Mod(numYinYang, 2) == 0 {
		clockwise = 1
	} else {
		clockwise = -1
	}

	realLength := float32(len(surface))

	realLength = math32.Ceil(realLength / numRings)

	var currAngleIdx float32 = 0.

	var totalSpeed float32 = defaultRotateSpeed

	spinRotationDelta := calculateRotationDelta(defaultRotateSpeed*spinAngleCoefficient, clockwise)

	var targetRadius float32

	if isAngry {
		targetRadius = 80
	} else {
		if isSad {
			targetRadius = 25
		} else {
			targetRadius = 40
		}
	}

	targetRadius += ((p.Size / PlayerSize) - 1) * PlayerCollision.Radius

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

		if slices.Contains(UsablePetalTypes, firstPetal.Type) {
			springForce = (40 - p.OrbitPetalRadii[i]) * radiusSpringStrength
		} else {
			springForce = (targetRadius - p.OrbitPetalRadii[i]) * radiusSpringStrength
		}

		p.OrbitRadiusVelocities[i] = p.OrbitRadiusVelocities[i]*radiusFriction + springForce
		p.OrbitPetalRadii[i] += p.OrbitRadiusVelocities[i]

		ringIdx := math32.Floor(currAngleIdx / realLength)
		rad := p.OrbitPetalRadii[i] * (1 + (ringIdx * 0.5))

		multipliedRotation := p.OrbitRotation * (1 + ((ringIdx - (numRings - 1)) * 0.1))

		baseAngle := Tau*math32.Mod(currAngleIdx, realLength)/realLength + multipliedRotation
		currAngleIdx++

		if IsClusterPetal(petals) {
			angleIdx := calcTableIndex(baseAngle)

			slotBaseX := targetX + lazyCosTable[angleIdx]*rad
			slotBaseY := targetY + lazySinTable[angleIdx]*rad

			for j, petal := range petals {
				if petal == nil {
					continue
				}

				if petal.DetachedFromOrbit {
					continue
				}

				// Bit faster than normal orbit
				petalAngle := Tau*float32(j)/float32(len(petals)) + multipliedRotation*1.3

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

			if petal.DetachedFromOrbit {
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
	if math32.Abs(p.OrbitRotation) >= math32.MaxFloat32 {
		p.OrbitRotation = math32.Mod(p.OrbitRotation, Tau)
	}
}
