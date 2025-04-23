package wave

import "flooooio/internal/native"

func CalculateSearchRadius(collision native.EntityCollision, size float64) float64 {
	return (2 * collision.Radius) * (size / collision.Fraction)
}
