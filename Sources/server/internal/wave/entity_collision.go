package wave

import "flooooio/internal/wave/florr/native"

const searchRadiusMultiplier = 2

func CalculateSearchRadius(collision native.EntityCollision, size float32) float32 {
	return (searchRadiusMultiplier * collision.Radius) * (size / collision.Fraction)
}
