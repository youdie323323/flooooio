package wave

import (
	"math"

	"flooooio/internal/native"
)

func calculateSearchRadius(collision native.EntityCollision, size float64) float64 {
	return (2 * collision.Radius) * (size / collision.Fraction)
}

type circle struct {
	x float64
	y float64
	r float64
}

func computeCirclePush(c0, c1 circle) (float64, float64, bool) {
	dx := c1.x - c0.x
	dy := c1.y - c0.y
	distance := math.Hypot(dx, dy)

	delta := c0.r + c1.r - distance
	if delta <= 0 {
		return 0, 0, false
	}

	nx := dx / distance
	ny := dy / distance

	return nx * delta, ny * delta, true
}
