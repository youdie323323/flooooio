package wave

const (
	// VectorEpsilon is machine epsilon used for movement value.
	// When velocity is reduced by friction, it may not become zero even if multiplied infinitely.
	// To check if it is almost zero, compare it with this value.
	VectorEpsilon = 0.1
)

// VectorWithinEpsilon returns whether vector within epsilon.
func VectorWithinEpsilon(v Vector2) bool {
	return v[0] < VectorEpsilon && v[1] < VectorEpsilon
}

func angleToRadian(angle float32) float32 {
	return angle / 255 * Tau32
}
