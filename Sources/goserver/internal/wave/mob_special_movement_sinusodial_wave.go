package wave

import "math"

const TAU = math.Pi * 2

func generateSinWaveTable(sampleRate int) []float64 {
    samples := make([]float64, sampleRate)
    
    for i := range sampleRate {
        y := math.Sin(float64(i) / float64(sampleRate) * TAU)
        samples[i] = y
    }
    
    return samples
}

type SinusoidalWave struct {
    table []float64
}

func NewSinusoidalWave(sampleRate int) *SinusoidalWave {
    return &SinusoidalWave{
        table: generateSinWaveTable(sampleRate),
    }
}

func (w *SinusoidalWave) At(t int) float64 {
    index := t % len(w.table)
    return w.table[index]
}

var SinusodialWave = NewSinusoidalWave(200)