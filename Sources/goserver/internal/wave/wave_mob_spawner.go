package wave

import (
	"crypto/rand"
	"encoding/binary"
	"math"

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
		native.MobTypeBee:           {SpawnAfter: 1, Weight: 30},
		native.MobTypeSpider:        {SpawnAfter: 3, Weight: 30},
		native.MobTypeCentipede:     {SpawnAfter: 2, Weight: 1},
		native.MobTypeCentipedeEvil: {SpawnAfter: 3, Weight: 1},
	},
	native.BiomeDesert: {
		native.MobTypeCentipedeDesert: {SpawnAfter: 1, Weight: 1},
		native.MobTypeBeetle:          {SpawnAfter: 2, Weight: 30},
	},
	native.BiomeOcean: {
		native.MobTypeBubble:    {SpawnAfter: 1, Weight: 1},
		native.MobTypeSponge:    {SpawnAfter: 1, Weight: 1},
		native.MobTypeStarfish:  {SpawnAfter: 3, Weight: 1},
		native.MobTypeJellyfish: {SpawnAfter: 3, Weight: 1},
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
	rand.Read(buf[:])
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

type StaticMobData struct {
	MobType native.MobType
	Rarity  native.Rarity
}

type WaveMobSpawner struct {
	timer  int
	points float64
}

func (s *WaveMobSpawner) calculateWaveLuck(progress int) float64 {
	return math.Pow(1.3, float64(progress)) - 1
}

func (s *WaveMobSpawner) Next(data *WaveData) {
	s.timer = -1
	s.points = 50 + math.Pow(float64(data.Progress), 1.6)
	s.points += 1500
}

func (s *WaveMobSpawner) DetermineStaticMobData(data *WaveData) *StaticMobData {
	// luck := (s.calculateWaveLuck(data.Progress) * (0.0 + 1)) * 1

	if s.shouldSpawnMob() {
		mobType := getRandomMobType(data.Progress, data.Biome)
		spawnRarity := pickRandomRarity(data.Progress, 1+0)

		for rarity, maxWave := range WaveSpawnEndAt {
			if data.Progress > maxWave && spawnRarity == rarity {
				spawnRarity = native.Rarity(min(int(spawnRarity)+1, int(native.RarityMythic)))
			}
		}

		s.points--

		return &StaticMobData{
			MobType: mobType,
			Rarity:  spawnRarity,
		}
	}

	return nil
}

func (s *WaveMobSpawner) shouldSpawnMob() bool {
	s.timer++
	
	return s.timer%10 == 0 && s.points > 0
}