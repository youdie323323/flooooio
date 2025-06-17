package native

type Mood uint8

const (
	MoodAngry       = 0
	MoodSad         = 1
)

var ValidMoodFlags = []Mood{
	MoodAngry,
	MoodSad,
	MoodAngry | MoodSad,
}

func (m Mood) IsSet(mood Mood) bool {
	return m&mood != 0
}