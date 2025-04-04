package wave

import (
	"fmt"
	"math/rand/v2"
	"regexp"
	"strings"
)

type WaveRoomCode string

func generateRandomServerIdentifier() string {
	chars := make([]string, 3)
	for i := range chars {
		chars[i] = fmt.Sprintf("%x", rand.IntN(16))
	}

	return strings.Join(chars, "")
}

func generateRandomMeaninglessIdentifier() string {
	chars := make([]string, 6)
	for i := range chars {
		chars[i] = string(rune('a' + rand.IntN(26)))
	}

	return strings.Join(chars, "")
}

func GenerateRandomWaveRoomCode() WaveRoomCode {
	serverPart := generateRandomServerIdentifier()
	meaninglessPart := generateRandomMeaninglessIdentifier()

	return WaveRoomCode(fmt.Sprintf("%s-%s", serverPart, meaninglessPart))
}

func IsWaveRoomCode(maybeCode string) bool {
	if len(maybeCode) != 10 {
		return false
	}
	
	if maybeCode[3] != '-' {
		return false
	}

	parts := strings.Split(maybeCode, "-")
	if len(parts) != 2 {
		return false
	}

	prefix := parts[0]
	suffix := parts[1]

	hexMatch, _ := regexp.MatchString("^[0-9a-f]{3}$", prefix)
	if !hexMatch {
		return false
	}

	alphaMatch, _ := regexp.MatchString("^[a-z]{6}$", suffix)
	if !alphaMatch {
		return false
	}

	return true
}
