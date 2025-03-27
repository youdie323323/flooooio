package native

type Mood uint

const (
	MoodNormal Mood = 0
	MoodAngry  Mood = 1 << iota // 1
	MoodSad                     // 2
)

var ValidMoodFlags = []Mood{
	MoodNormal,
	MoodAngry,
	MoodSad,
	MoodAngry | MoodSad,
}

func (m *Mood) Set(mood Mood) {
	*m |= mood
}

func (m Mood) IsSet(mood Mood) bool {
	return m&mood != 0
}
