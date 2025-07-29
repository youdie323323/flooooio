package wave

import (
	"flooooio/internal/wave/florr/native"

	"github.com/chewxy/math32"
)

type Circle struct {
	X float32
	Y float32
	R float32
}

func ComputeCirclePush(c0, c1 Circle) (float32, float32, bool) {
	dx := c1.X - c0.X
	dy := c1.Y - c0.Y

	dot := dx*dx + dy*dy

	// If distance is zero, dx and dy will be NaN and cause errors
	// So knockout them with ε-like value
	if dot == 0 {
		return 1, 1, true
	}

	radiusSum := c0.R + c1.R

	if radiusSumSq := radiusSum * radiusSum; dot >= radiusSumSq {
		return 0, 0, false
	}

	distance := math32.Sqrt(dot)

	delta := radiusSum - distance

	nx := dx / distance
	ny := dy / distance

	return nx * delta, ny * delta, true
}

const SearchRadiusMultiplier = 2

func CalculateSearchRadius(collision native.EntityCollision, size float32) float32 {
	return (SearchRadiusMultiplier * collision.Radius) * (size / collision.Fraction)
}