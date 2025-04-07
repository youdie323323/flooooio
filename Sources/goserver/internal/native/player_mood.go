package native

type Mood uint8

const (
	MoodNormal Mood = 0
	MoodAngry       = 1
	MoodSad         = 2
)

var ValidMoodFlags = []Mood{
	MoodNormal,
	MoodAngry,
	MoodSad,
	MoodAngry | MoodSad,
}

func (m Mood) IsSet(mood Mood) bool {
	return m&mood != 0
}