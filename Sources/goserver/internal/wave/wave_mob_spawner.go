package wave

import (
	"container/list"
	crand "crypto/rand"
	"encoding/binary"
	"math"
	"slices"

	"flooooio/internal/native"
)

var LinkableMobs = []native.MobType{
	native.MobTypeCentipede,
	native.MobTypeCentipedeDesert,
	native.MobTypeCentipedeEvil,
}

type MobSpawnRule struct {
	SpawnAfter uint16
	Weight     int
}

var MobSpawnRules = map[native.Biome]map[native.MobType]MobSpawnRule{
	native.BiomeGarden: {
		native.MobTypeBee:           {SpawnAfter: 1, Weight: 100},
		native.MobTypeSpider:        {SpawnAfter: 3, Weight: 100},

		native.MobTypeCentipede:     {SpawnAfter: 2, Weight: 1},
		native.MobTypeCentipedeEvil: {SpawnAfter: 3, Weight: 1},
	},
	native.BiomeDesert: {
		native.MobTypeBeetle:          {SpawnAfter: 2, Weight: 100},
		native.MobTypeSandstorm:       {SpawnAfter: 1, Weight: 100},

		native.MobTypeCentipedeDesert: {SpawnAfter: 1, Weight: 1},
	},
	native.BiomeOcean: {
		native.MobTypeStarfish:  {SpawnAfter: 3, Weight: 1},
		native.MobTypeJellyfish: {SpawnAfter: 3, Weight: 1},
		native.MobTypeBubble:    {SpawnAfter: 1, Weight: 1},
		native.MobTypeSponge:    {SpawnAfter: 1, Weight: 1},
	},
}

var WaveSpawnEndAt = map[native.Rarity]uint16{
	native.RarityCommon:    20,
	native.RarityUnusual:   30,
	native.RarityRare:      40,
	native.RarityEpic:      50,
	native.RarityLegendary: 60,
	native.RarityMythic:    200,
}

var RelativeRarity = []float64{
	60000, // Common
	15000, // Unusual
	2500,  // Rare
	100,   // Epic
	5,     // Legendary
	0.1,   // Mythic
	0.001, // Ultra
}

var rarityTable []float64

func init() {
	rarityTable = make([]float64, len(RelativeRarity))
	totalWeight := 0.0
	for _, weight := range RelativeRarity {
		totalWeight += weight
	}

	acc := 0.0
	for i := range rarityTable {
		rarityTable[i] = acc / totalWeight
		acc += RelativeRarity[i]
	}
}

func secureRandom() float64 {
	var buf [8]byte
	crand.Read(buf[:])
	return float64(binary.LittleEndian.Uint64(buf[:])) / (1 << 64)
}

func getRandomMobType(difficulty uint16, biome native.Biome) native.MobType {
	totalWeight := 0

	// First pass: calculate total weight
	for _, rule := range MobSpawnRules[biome] {
		if rule.SpawnAfter <= difficulty {
			totalWeight += rule.Weight
		}
	}

	// Second pass: select mob
	random := secureRandom() * float64(totalWeight)
	for mobType, rule := range MobSpawnRules[biome] {
		if rule.SpawnAfter <= difficulty {
			random -= float64(rule.Weight)

			if random <= 0 {
				return mobType
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
	v = math.Pow(v, 1.0/n)
	return getRandomRarity(v)
}

func pickRandomRarity(difficulty uint16, luck float64) native.Rarity {
	r := getRandomRarityWithRolls(math.Pow(1.3, float64(difficulty)) * luck)
	if r >= native.RarityUltra {
		r = native.RarityMythic
	}

	return r
}

type StaticMob struct {
	MobType     native.MobType
	Rarity      native.Rarity
	CentiBodies int
}

type WaveMobSpawner struct {
	t         float64
	spawnList *list.List
}

func (s *WaveMobSpawner) calculateWaveLuck(progress int) float64 {
	return math.Pow(1.3, float64(progress)) - 1
}

func (s *WaveMobSpawner) Next(data *WaveData) {
	s.t = -1

	if s.spawnList == nil {
		s.spawnList = list.New()
	}
}

func (s *WaveMobSpawner) DetermineStaticMobData(data *WaveData) *StaticMob {
	s.t++

	const fps = 30 * 5

	if math.Mod(s.t, fps) == 0 {
		pointsToUse := int(math.Round(s.gaussian(s.t / fps)))

		for pointsToUse > 0 {
			mobType := getRandomMobType(data.Progress, data.Biome)
			spawnRarity := pickRandomRarity(data.Progress, 1+0)

			for rarity, maxWave := range WaveSpawnEndAt {
				if data.Progress > maxWave && spawnRarity == rarity {
					spawnRarity = native.Rarity(min(int(spawnRarity)+1, int(native.RarityMythic)))
				}
			}

			centiBodies := -1

			if slices.Contains(LinkableMobs, mobType) {
				centiBodies = 9
			}

			s.spawnList.PushBack(&StaticMob{
				MobType:     mobType,
				Rarity:      spawnRarity,
				CentiBodies: centiBodies,
			})

			pointsToUse--
		}
	}

	if s.spawnList.Len() == 0 {
		return nil
	}

	if math.Mod(s.t, 5) == 0 {
		element := s.spawnList.Front()
		s.spawnList.Remove(element)

		sm := element.Value.(*StaticMob)

		for i := 0; i < sm.CentiBodies && s.spawnList.Len() > 0; i++ {
			element = s.spawnList.Front()
			s.spawnList.Remove(element)
		}

		return sm
	} else {
		return nil
	}
}

func flatTopGaussian(x, A, mu, w, sigma1, sigma2 float64) float64 {
	const baseline = 1.0

	distance := math.Abs(x - mu)
	halfWidth := w / 2.0

	if distance <= halfWidth {
		return baseline + A
	}

	if x <= mu {
		return baseline + A*math.Exp(-math.Pow(distance-halfWidth, 2)/(2*math.Pow(sigma1, 2)))
	}

	return baseline + A*math.Exp(-math.Pow(distance-halfWidth, 2)/(2*math.Pow(sigma2, 2)))
}

const (
	gaussianAmplitude          = 10
	gaussianMean               = 15
	gaussianStandardDeviation1 = 1.
	gaussianStandardDeviation2 = 5.
	gaussianW                  = 25
)

func (s *WaveMobSpawner) gaussian(x float64) float64 {
	return flatTopGaussian(x, gaussianAmplitude, gaussianMean, gaussianW, gaussianStandardDeviation1, gaussianStandardDeviation2)
}
