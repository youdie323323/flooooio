package wave

// Vector2 is two-dimensional vector.
type Vector2 = [2]float32

// VectorEpsilon is machine epsilon used for velocity.
// When velocity is reduced by friction, it may not become zero even if multiplied infinitely.
// To check if it is almost zero, compare it with this value.
const VectorEpsilon = 0.1

// Vector2WithinEpsilon returns whether two-dimensional vector within epsilon.
func Vector2WithinEpsilon(v Vector2) bool {
	return v[0] < VectorEpsilon && v[1] < VectorEpsilon
}

func AngleToRadian(angle float32) float32 {
	return angle / 255 * Tau32
}
