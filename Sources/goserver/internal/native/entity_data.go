package native

type EntityCollision struct {
	// Fraction is the division factor of the size of the scaling that is pre-invoked when drawing. 1 means no scaling.
	Fraction float64 `json:"fraction"`

	// Radius is the radius of circle.
	Radius float64 `json:"radius"`
}

type EntityData[I18n any] struct {
	// I18n is internationalization of entity data.
	I18n I18n `json:"i18n"`

	// Collision is data needed for collide.
	Collision EntityCollision `json:"collision"`
}

func DamageOfStat(s any) float64 {
	mobStat, ok := s.(MobStat)
	if ok {
		return mobStat.BodyDamage
	}

	petalStat, ok := s.(PetalStat)
	if ok {
		return petalStat.Damage
	}

	return 0
}
