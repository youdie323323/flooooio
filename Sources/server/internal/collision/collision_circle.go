package collision

import (
	"math"
)

type Circle struct {
	X float64
	Y float64
	R float64
}

func ComputeCirclePush(c0, c1 Circle) (float64, float64, bool) {
	dx := c1.X - c0.X
	dy := c1.Y - c0.Y
	distance := math.Hypot(dx, dy)

	delta := c0.R + c1.R - distance
	if delta <= 0 {
		return 0, 0, false
	}

	// If distance is zero, dx and dy will be NaN and cause errors
	if distance == 0 {
		return 1, 1, true
	}

	nx := dx / distance
	ny := dy / distance

	return nx * delta, ny * delta, true
}
