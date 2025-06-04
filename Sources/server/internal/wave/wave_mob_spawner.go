package wave

import (
	"container/list"
	"fmt"
	"math"
	"math/rand/v2"
	"slices"

	"flooooio/internal/wave/florr/native"

	"github.com/chewxy/math32"
)

var LinkableMobTypes = []native.MobType{
	native.MobTypeCentipede,
	native.MobTypeCentipedeDesert,
	native.MobTypeCentipedeEvil,
	native.MobTypeLeech,
}

type MobSpawnRule struct {
	SpawnAfter uint16
	Weight     float64
	Points     int
}

const (
	centipedePoint = 3
)

var mobSpawnRules = map[native.Biome]map[native.MobType]MobSpawnRule{
	native.BiomeGarden: {
		native.MobTypeBee:    {1, 50, 1},
		native.MobTypeSpider: {3, 50, 1},
		native.MobTypeHornet: {3, 50, 1},

		native.MobTypeCentipede:     {2, 1, centipedePoint},
		native.MobTypeCentipedeEvil: {3, 1, centipedePoint},
	},
	native.BiomeDesert: {
		native.MobTypeBeetle:       {2, 200, 1},
		native.MobTypeSandstorm:    {1, 200, 1},
		native.MobTypeCactus:       {1, 200, 1},
		native.MobTypeScorpion:     {3, 200, 1},
		native.MobTypeLadybugShiny: {3, 1, 5},

		native.MobTypeCentipedeDesert: {1, 1, centipedePoint},
	},
	native.BiomeOcean: {
		native.MobTypeStarfish:  {3, 1, 1},
		native.MobTypeJellyfish: {3, 1, 1},
		native.MobTypeBubble:    {1, 1, 1},
		native.MobTypeSponge:    {1, 1, 1},
		native.MobTypeShell:     {1, 1, 1},
		native.MobTypeCrab:      {2, 1, 1},
		native.MobTypeLeech:     {4, 1, 1},
	},
}

var mobSpawnEndAfter = map[native.Rarity]uint16{
	native.RarityCommon:    20,
	native.RarityUnusual:   30,
	native.RarityRare:      40,
	native.RarityEpic:      50,
	native.RarityLegendary: 60,
	native.RarityMythic:    math.MaxUint16,
}

type SpawnGroup = []native.MobType

var specialWaveMobGroups = map[native.Biome][]SpawnGroup{
	native.BiomeGarden: {
		// {BABY ANT, WORKER ANT, ROCK},
		{native.MobTypeBee /* LADYBUG */},
		{native.MobTypeHornet},
		{native.MobTypeHornet, native.MobTypeBee},
		// {LADYBUG, LADYBUG JUNGLE},
		{native.MobTypeSpider},
	},
	native.BiomeDesert: {
		{native.MobTypeBeetle},
		{native.MobTypeCentipedeDesert},
		{native.MobTypeSandstorm},
		{native.MobTypeScorpion},
	},
	native.BiomeOcean: {
		{native.MobTypeBubble},
		{native.MobTypeCrab},
		{native.MobTypeJellyfish},
		{native.MobTypeLeech},
		{native.MobTypeShell},
		{native.MobTypeShell, native.MobTypeSponge},
		{native.MobTypeStarfish},
	},
}

var relativeRarity = []float64{
	28710.94, // Common
	4921.88,  // Unusual
	656.25,   // Rare
	52.5,     // Epic
	1.0,      // Legendary
	0.1,      // Mythic
	0.001,    // Ultra
}

var amountTable = []float64{
	0.25,
	0.20,
	0.15,
	0.10,
	0.05,
}

var rarityTable = make([]float64, len(relativeRarity))

var totalWeight float64 = 0.

var totalAmountWeight float64 = 0.

func init() {
	for _, w := range relativeRarity {
		totalWeight += w
	}

	for _, a := range amountTable {
		totalAmountWeight += a
	}

	acc := .0

	for i := range rarityTable {
		rarityTable[i] = acc / totalWeight

		acc += relativeRarity[i]
	}
}

func generateRandomMobAmounts() int {
	r := rand.Float64() * totalAmountWeight

	for i, w := range amountTable {
		r -= w

		if r <= 0 {
			return i + 1
		}
	}

	return len(amountTable)
}

func getRandomMobType(diff uint16, b native.Biome, sg *SpawnGroup) native.MobType {
	// If special group exists, use it
	if sg != nil {
		totalWeight := 0.

		// Calculate total weight for valid mob types in the special group
		for _, t := range *sg {
			if r, exists := mobSpawnRules[b][t]; exists && r.SpawnAfter <= diff {
				totalWeight += r.Weight
			}
		}

		// Select mob from special group
		random := rand.Float64() * totalWeight
		for _, t := range *sg {
			if r, exists := mobSpawnRules[b][t]; exists && r.SpawnAfter <= diff {
				random -= r.Weight

				if random <= 0 {
					return t
				}
			}
		}
	}

	totalWeight := 0.

	// First pass: calculate total weight
	for _, r := range mobSpawnRules[b] {
		if r.SpawnAfter <= diff {
			totalWeight += r.Weight
		}
	}

	// Second pass: select mob
	random := rand.Float64() * totalWeight
	for t, r := range mobSpawnRules[b] {
		if r.SpawnAfter <= diff {
			random -= r.Weight

			if random <= 0 {
				return t
			}
		}
	}

	return native.MobTypeBee
}

func translateProbabilityToRarity(v float64) native.Rarity {
	for i := len(rarityTable) - 1; i >= 0; i-- {
		if v >= rarityTable[i] {
			return native.Rarity(i)
		}
	}

	return native.RarityCommon
}

func getRandomRarityWithRolls(n float64) native.Rarity {
	v := rand.Float64()

	v = math.Pow(v, 1/n)

	return translateProbabilityToRarity(v)
}

func pickRandomRarity(difficulty uint16, luck float64) native.Rarity {
	r := getRandomRarityWithRolls(math.Pow(1.3, float64(difficulty)) * luck)

	if r >= native.RarityUltra {
		r = native.RarityMythic
	}

	return r
}

type DynamicMobData struct {
	StaticMobData

	SegmentBodies int
}

type WaveMobSpawner struct {
	// totalTime is total progress time.
	totalTime int

	// spawnList is mob list to spawn.
	spawnList *list.List

	// spawnGroup is current spawn group.
	// nil for empty.
	spawnGroup *SpawnGroup

	// points is current point.
	points int
}

func CalculateWaveLuck(progress WaveProgress) float64 {
	return math.Pow(1.3, float64(progress)) - 1
}

// CalculateSpawnWave calculate spawn wave by best wave progression of this wave.
func CalculateSpawnWave(bestWave WaveProgress) WaveProgress {
	return WaveProgress(math.Ceil(2 / 3 * float64(bestWave)))
}

func CalculateWaveLength(x float32) float32 {
	return max(60, math32.Pow(x, 0.2)*18.9287+30)
}

func (s *WaveMobSpawner) Next(data *WaveData, groupIndex *int) {
	s.totalTime = -1

	if s.spawnList == nil {
		s.spawnList = list.New()
	}

	if groupIndex == nil {
		// Special wave starts with 15%
		if data.Progress >= 15 && rand.Float64() < 0.15 {
			groups := specialWaveMobGroups[data.Biome]

			s.spawnGroup = &groups[rand.IntN(len(groups))]
		} else {
			s.spawnGroup = nil
		}
	} else {
		groups := specialWaveMobGroups[data.Biome]

		s.spawnGroup = &groups[*groupIndex]
	}

	s.points = int(data.Progress) * 10

	if s.spawnGroup != nil {
		s.points += 500
	}
}

const (
	spawnDelay int = WaveDataUpdateFPS * 0.8
)

func (s *WaveMobSpawner) ComputeDynamicMobData(data *WaveData) *DynamicMobData {
	// Increase time
	s.totalTime++

	if s.points > 0 && (s.totalTime%spawnDelay) == 0 {
		var amount int

		if s.spawnGroup == nil {
			amount = generateRandomMobAmounts()
		} else {
			sec := s.totalTime / spawnDelay

			amount = int(math.Round(s.gaussian(float64(sec))))
		}

		for range amount {
			t := getRandomMobType(data.Progress, data.Biome, s.spawnGroup)
			r := pickRandomRarity(data.Progress, 1+0)

			for a, m := range mobSpawnEndAfter {
				if data.Progress > m && r == a {
					r = native.Rarity(min(int(r)+1, int(native.RarityMythic)))
				}
			}

			pointsToConsume := mobSpawnRules[data.Biome][t].Points

			segmentBodies := -1

			if slices.Contains(LinkableMobTypes, t) {
				// TODO: this depend on rarity as described in wiki
				segmentBodies = 9

				pointsToConsume *= segmentBodies
			}

			s.spawnList.PushBack(&DynamicMobData{
				StaticMobData: StaticMobData{
					Type:   t,
					Rarity: r,
				},
				SegmentBodies: segmentBodies,
			})

			s.points = max(0, s.points-pointsToConsume)

			if s.points == 0 {
				break
			}

			fmt.Println(s.totalTime, s.points)
		}
	}

	if s.spawnList.Len() == 0 {
		return nil
	}

	element := s.spawnList.Front()
	s.spawnList.Remove(element)

	dm := element.Value.(*DynamicMobData)

	for i := 0; i < dm.SegmentBodies && s.spawnList.Len() > 0; i++ {
		element = s.spawnList.Front()

		s.spawnList.Remove(element)
	}

	return dm
}

func flatTopGaussian(x, A, mu, w, sigma float64) float64 {
	const baseline = 1.0

	distance := x - mu
	halfWidth := w / 2.0

	if x <= mu {
		if distance >= -halfWidth {
			return baseline + A
		}

		return baseline + A*math.Exp(-math.Pow(-distance-halfWidth, 2)/(2*math.Pow(sigma, 2)))
	}

	return baseline + A
}

const (
	gaussianAmplitude = 15
	gaussianMean      = 20
	gaussianW         = 25
	gaussianStdev     = 1.
)

func (s *WaveMobSpawner) gaussian(x float64) float64 {
	return flatTopGaussian(x, gaussianAmplitude, gaussianMean, gaussianW, gaussianStdev)
}
