package wave

import "flooooio/internal/wave/florr/native"

const SearchRadiusMultiplier = 2

func CalculateSearchRadius(collision native.EntityCollision, size float32) float32 {
	return (SearchRadiusMultiplier * collision.Radius) * (size / collision.Fraction)
}
