package collision

import (
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
	distance := math32.Hypot(dx, dy)

	// If distance is zero, dx and dy will be NaN and cause errors
	// So knockout them with ε-like value
	if distance == 0 {
		return 1, 1, true
	}

	delta := c0.R + c1.R - distance
	if delta <= 0 {
		return 0, 0, false
	}

	invDist := 1 / distance
	nx := dx * invDist
	ny := dy * invDist

	return nx * delta, ny * delta, true
}
