package wave

const (
	// VelocityEpsilon is machine epsilon used for movement value.
	// When velocity is reduced by friction, it may not become zero even if multiplied infinitely.
	// To check if it is almost zero, compare it with this value.
	VelocityEpsilon = 0.1
)

// VelocityWithinEpsilon returns whether vector within epsilon.
func VelocityWithinEpsilon(v Velocity) bool {
	return v[0] < VelocityEpsilon && v[1] < VelocityEpsilon
}

func angleToRadian(angle float32) float32 {
	return angle / 255 * Tau
}
