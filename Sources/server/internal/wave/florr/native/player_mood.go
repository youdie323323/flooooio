package native

type PlayerMood uint8

const (
	PlayerMoodDefault PlayerMood = 0
	PlayerMoodAngry   PlayerMood = 1
	PlayerMoodSad     PlayerMood = 2
)

var ValidPlayerMoodFlags = []PlayerMood{
	PlayerMoodDefault,
	PlayerMoodAngry,
	PlayerMoodSad,
	PlayerMoodAngry | PlayerMoodSad,
}

func (m PlayerMood) IsSet(mood PlayerMood) bool {
	return m&mood != 0
}
