package wave

import (
	"container/list"
	crand "crypto/rand"
	"encoding/binary"
	"math"
	"math/rand/v2"
	"slices"

	"flooooio/internal/wave/florr/native"
)

var LinkableMobTypes = []native.MobType{
	native.MobTypeCentipede,
	native.MobTypeCentipedeDesert,
	native.MobTypeCentipedeEvil,
	native.MobTypeLeech,
}

type MobSpawnRule struct {
	SpawnAfter uint16
	Weight     int
}

var mobSpawnRules = map[native.Biome]map[native.MobType]MobSpawnRule{
	native.BiomeGarden: {
		native.MobTypeBee:    {SpawnAfter: 1, Weight: 50},
		native.MobTypeSpider: {SpawnAfter: 3, Weight: 50},
		native.MobTypeHornet: {SpawnAfter: 3, Weight: 50},

		native.MobTypeCentipede:     {SpawnAfter: 2, Weight: 1},
		native.MobTypeCentipedeEvil: {SpawnAfter: 3, Weight: 1},
	},
	native.BiomeDesert: {
		native.MobTypeBeetle:       {SpawnAfter: 2, Weight: 50},
		native.MobTypeSandstorm:    {SpawnAfter: 1, Weight: 50},
		native.MobTypeCactus:       {SpawnAfter: 1, Weight: 50},
		native.MobTypeScorpion:     {SpawnAfter: 3, Weight: 50},
		native.MobTypeLadybugShiny: {SpawnAfter: 3, Weight: 1},

		native.MobTypeCentipedeDesert: {SpawnAfter: 1, Weight: 1},
	},
	native.BiomeOcean: {
		native.MobTypeStarfish:  {SpawnAfter: 3, Weight: 1},
		native.MobTypeJellyfish: {SpawnAfter: 3, Weight: 1},
		native.MobTypeBubble:    {SpawnAfter: 1, Weight: 1},
		native.MobTypeSponge:    {SpawnAfter: 1, Weight: 1},
		native.MobTypeShell:     {SpawnAfter: 1, Weight: 1},
		native.MobTypeCrab:      {SpawnAfter: 2, Weight: 1},
		native.MobTypeLeech:     {SpawnAfter: 4, Weight: 1},
	},
}

var mobSpawnEndAfter = map[native.Rarity]uint16{
	native.RarityCommon:    20,
	native.RarityUnusual:   30,
	native.RarityRare:      40,
	native.RarityEpic:      50,
	native.RarityLegendary: 60,
	native.RarityMythic:    200,
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
	60000, // Common
	15000, // Unusual
	2500,  // Rare
	100,   // Epic
	5,     // Legendary
	0.1,   // Mythic
	0.001, // Ultra
}

var rarityTable []float64 = make([]float64, len(relativeRarity))

func init() {
	totalWeight := 0.0

	for _, weight := range relativeRarity {
		totalWeight += weight
	}

	acc := .0

	for i := range rarityTable {
		rarityTable[i] = acc / totalWeight

		acc += relativeRarity[i]
	}
}

func secureRandom() float64 {
	var buf [8]byte

	crand.Read(buf[:])

	return float64(binary.LittleEndian.Uint64(buf[:])) / (1 << 64)
}

func getRandomMobType(difficulty uint16, biome native.Biome, sg *SpawnGroup) native.MobType {
	// If special group exists, use it
	if sg != nil {
		totalWeight := 0

		// Calculate total weight for valid mob types in the special group
		for _, t := range *sg {
			if r, exists := mobSpawnRules[biome][t]; exists && r.SpawnAfter <= difficulty {
				totalWeight += r.Weight
			}
		}

		// Select mob from special group
		random := secureRandom() * float64(totalWeight)
		for _, t := range *sg {
			if r, exists := mobSpawnRules[biome][t]; exists && r.SpawnAfter <= difficulty {
				random -= float64(r.Weight)

				if random <= 0 {
					return t
				}
			}
		}
	}

	totalWeight := 0

	// First pass: calculate total weight
	for _, r := range mobSpawnRules[biome] {
		if r.SpawnAfter <= difficulty {
			totalWeight += r.Weight
		}
	}

	// Second pass: select mob
	random := secureRandom() * float64(totalWeight)
	for t, r := range mobSpawnRules[biome] {
		if r.SpawnAfter <= difficulty {
			random -= float64(r.Weight)

			if random <= 0 {
				return t
			}
		}
	}

	return native.MobTypeBee
}

func getRandomRarity(v float64) native.Rarity {
	for i := len(rarityTable) - 1; i >= 0; i-- {
		if v >= rarityTable[i] {
			return native.Rarity(i)
		}
	}

	return native.RarityCommon
}

func getRandomRarityWithRolls(n float64) native.Rarity {
	v := secureRandom()

	v = math.Pow(v, 1/n)

	return getRandomRarity(v)
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
	totalTime float64

	// spawnList is mob list to spawn.
	spawnList *list.List

	// spawnGroup is current spawn group.
	// nil for empty.
	spawnGroup *SpawnGroup
}

func (s *WaveMobSpawner) calculateWaveLuck(progress int) float64 {
	return math.Pow(1.3, float64(progress)) - 1
}

func (s *WaveMobSpawner) Next(data *WaveData) {
	s.totalTime = -1

	if s.spawnList == nil {
		s.spawnList = list.New()
	}

	// Special wave starts with 15%
	if data.Progress > 1 && secureRandom() < 0.15 {
		groups := specialWaveMobGroups[data.Biome]

		s.spawnGroup = &groups[rand.IntN(len(groups))]
	} else {
		s.spawnGroup = nil
	}
}

func (s *WaveMobSpawner) ComputeDynamicMobData(data *WaveData) *DynamicMobData {
	s.totalTime++

	const fps = 50

	if math.Mod(s.totalTime, fps) == 0 {
		pointsToUse := int(math.Round(s.gaussian(s.totalTime / fps)))

		for pointsToUse > 0 {
			t := getRandomMobType(data.Progress, data.Biome, s.spawnGroup)
			rarity := pickRandomRarity(data.Progress, 1+0)

			for r, max := range mobSpawnEndAfter {
				if data.Progress > max && rarity == r {
					rarity = native.Rarity(min(int(rarity)+1, int(native.RarityMythic)))
				}
			}

			segmentBodies := -1

			if slices.Contains(LinkableMobTypes, t) {
				segmentBodies = 9
			}

			s.spawnList.PushBack(&DynamicMobData{
				StaticMobData: StaticMobData{
					Type:   t,
					Rarity: rarity,
				},
				SegmentBodies: segmentBodies,
			})

			pointsToUse--
		}
	}

	if s.spawnList.Len() == 0 {
		return nil
	}

	if math.Mod(s.totalTime, 5) == 0 {
		element := s.spawnList.Front()
		s.spawnList.Remove(element)

		dm := element.Value.(*DynamicMobData)

		for i := 0; i < dm.SegmentBodies && s.spawnList.Len() > 0; i++ {
			element = s.spawnList.Front()

			s.spawnList.Remove(element)
		}

		return dm
	} else {
		return nil
	}
}

// TODO: make these types float32

func flatTopGaussian(x, A, mu, w, sigma1, sigma2 float64) float64 {
	const baseline = 1

	distance := math.Abs(x - mu)
	halfWidth := w / 2

	if distance <= halfWidth {
		return baseline + A
	}

	if x <= mu {
		return baseline + A*math.Exp(-math.Pow(distance-halfWidth, 2)/(2*math.Pow(sigma1, 2)))
	}

	return baseline + A*math.Exp(-math.Pow(distance-halfWidth, 2)/(2*math.Pow(sigma2, 2)))
}

const (
	amplitude = 10
	mean      = 15
	stdev1    = 1.
	stdev2    = 5.
	width     = 25
)

func (s *WaveMobSpawner) gaussian(x float64) float64 {
	return flatTopGaussian(x, amplitude, mean, width, stdev1, stdev2)
}
