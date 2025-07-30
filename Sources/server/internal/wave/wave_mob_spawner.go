package wave

import (
	"container/list"
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
	SpawnsAfter uint16
	Weight      float64
	Point       int
}

const (
	centipedePoint = 3
)

var mobSpawnRules = map[native.Biome]map[native.MobType]MobSpawnRule{
	native.BiomeGarden: {
		native.MobTypeBee:        {1, 50, 1},
		native.MobTypeSpider:     {3, 50, 1},
		native.MobTypeHornet:     {3, 50, 1},
		native.MobTypeBabyAnt:    {1, 50, 1},
		native.MobTypeWorkerAnt:  {2, 50, 1},
		native.MobTypeSoldierAnt: {3, 50, 1},

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
		{native.MobTypeBabyAnt, native.MobTypeWorkerAnt, native.MobTypeSoldierAnt /* ROCK */},
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

var relativeRarityWeight float64 = 0.

var amountTableWeight float64 = 0.

func init() {
	for _, w := range relativeRarity {
		relativeRarityWeight += w
	}

	for _, a := range amountTable {
		amountTableWeight += a
	}

	acc := .0

	for i := range rarityTable {
		rarityTable[i] = acc / relativeRarityWeight

		acc += relativeRarity[i]
	}
}

func generateRandomMobAmounts() int {
	r := amountTableWeight * rand.Float64()

	for i, w := range amountTable {
		r -= w

		if r <= 0 {
			return i + 1
		}
	}

	return len(amountTable)
}

func pickRandomMobType(difficulty uint16, biome native.Biome, sg *SpawnGroup) native.MobType {
	// If special group exists, use it
	if sg != nil {
		totalWeight := 0.

		// Calculate total weight for valid mob types in the special group
		for _, t := range *sg {
			if rule, exists := mobSpawnRules[biome][t]; exists && rule.SpawnsAfter <= difficulty {
				totalWeight += rule.Weight
			}
		}

		// Select mob from special group
		random := totalWeight * rand.Float64()

		for _, t := range *sg {
			if rule, exists := mobSpawnRules[biome][t]; exists && rule.SpawnsAfter <= difficulty {
				random -= rule.Weight

				if random <= 0 {
					return t
				}
			}
		}
	}

	totalWeight := 0.

	// First pass: calculate total weight
	for _, rule := range mobSpawnRules[biome] {
		if rule.SpawnsAfter <= difficulty {
			totalWeight += rule.Weight
		}
	}

	// Second pass: select mob
	random := rand.Float64() * totalWeight

	for t, rule := range mobSpawnRules[biome] {
		if rule.SpawnsAfter <= difficulty {
			random -= rule.Weight

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

type MobSpawner struct {
	// totalTime is total progress time.
	totalTime int

	// spawnList is mob list to spawn.
	spawnList *list.List

	// spawnGroup is current spawn group.
	spawnGroup *SpawnGroup

	// point is current point.
	point int
}

func NewMobSpawner(data *Data) *MobSpawner {
	s := new(MobSpawner)

	s.Next(data, nil)

	return s
}

func CalculateWaveLuck(progress DataProgress) float64 {
	return math.Pow(1.3, float64(progress)) - 1
}

const twoOverThree float64 = 2. / 3.

// CalculateSpawnWave calculates spawn wave by best wave progress.
func CalculateSpawnWave(progress DataProgress) DataProgress {
	return DataProgress(math.Ceil(twoOverThree * float64(progress)))
}

func CalculateWaveLength(x float32) float32 {
	return max(18.9287*math32.Pow(x, 0.2)+30, 60)
}

func (s *MobSpawner) Next(data *Data, groupIndex *int) {
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

	s.point = int(data.Progress) * 10

	if s.spawnGroup != nil {
		s.point += 1000
	}
}

const (
	spawnDelay int = 0.8 * DataUpdatePerSec
)

func (s *MobSpawner) ComputeDynamicMobData(data *Data) *DynamicMobData {
	// Increase time
	s.totalTime++

	if s.point > 0 && (s.totalTime%spawnDelay) == 0 {
		var amount int

		if s.spawnGroup == nil {
			amount = generateRandomMobAmounts()
		} else {
			ratio := float64(s.totalTime) / float64(spawnDelay)

			amount = int(math.Round(s.gaussian(ratio)))
		}

		for range amount {
			t := pickRandomMobType(data.Progress, data.Biome, s.spawnGroup)
			r := pickRandomRarity(data.Progress, 1+0)

			for a, m := range mobSpawnEndAfter {
				if data.Progress > m && r == a {
					r = native.Rarity(min(int(r)+1, int(native.RarityMythic)))
				}
			}

			pointToConsume := mobSpawnRules[data.Biome][t].Point

			segmentBodies := -1

			if slices.Contains(LinkableMobTypes, t) {
				// TODO: this depend on rarity as described in wiki
				segmentBodies = 9

				// pointsToConsume *= segmentBodies
			}

			s.spawnList.PushBack(&DynamicMobData{
				StaticMobData: StaticMobData{
					Type:   t,
					Rarity: r,
				},

				SegmentBodies: segmentBodies,
			})

			s.point = max(0, s.point-pointToConsume)

			if s.point == 0 {
				break
			}
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
	gaussianAmplitude = 25
	gaussianMean      = 20
	gaussianW         = 25
	gaussianStdev     = 1.
)

func (s *MobSpawner) gaussian(x float64) float64 {
	return flatTopGaussian(x, gaussianAmplitude, gaussianMean, gaussianW, gaussianStdev)
}
