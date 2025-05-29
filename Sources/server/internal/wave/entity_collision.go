package wave

import "flooooio/internal/native"

const searchRadiusFactor = 2

func CalculateSearchRadius(collision native.EntityCollision, size float32) float32 {
	return (searchRadiusFactor * collision.Radius) * (size / collision.Fraction)
}
