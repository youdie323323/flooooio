package native

type Mood uint8

const (
	MoodDefault Mood = 0
	MoodAngry   Mood = 1
	MoodSad     Mood = 2
)

var ValidMoodFlags = []Mood{
	MoodDefault,
	MoodAngry,
	MoodSad,
	MoodAngry | MoodSad,
}

func (m Mood) IsSet(mood Mood) bool {
	return m&mood != 0
}
