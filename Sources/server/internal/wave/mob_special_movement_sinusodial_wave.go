package wave

import "github.com/chewxy/math32"

func generateSinWaveTable(sampleRate int) []float32 {
	samples := make([]float32, sampleRate)

	for i := range sampleRate {
		samples[i] = math32.Sin(float32(i) / float32(sampleRate) * Tau)
	}

	return samples
}

type SinusoidalWave struct {
	table []float32
}

func NewSinusoidalWave(sampleRate int) *SinusoidalWave {
	return &SinusoidalWave{
		table: generateSinWaveTable(sampleRate),
	}
}

func (w *SinusoidalWave) At(t int) float32 {
	index := t % len(w.table)

	return w.table[index]
}

var SinusodialWave = NewSinusoidalWave(200)
