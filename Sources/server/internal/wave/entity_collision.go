package wave

import "flooooio/internal/native"

func CalculateSearchRadius(collision native.EntityCollision, size float32) float32 {
	return (2 * collision.Radius) * (size / collision.Fraction)
}
