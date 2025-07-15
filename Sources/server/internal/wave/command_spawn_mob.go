package wave

import (
	"slices"

	"flooooio/internal/wave/florr/native"
)

type SpawnMobCmd struct {
	Type    native.MobType `arg:"0" help:"type"`
	Rarity  native.Rarity  `arg:"1" help:"rarity"`
	IsEnemy yesNoBool      `arg:"2" help:"enemy"`
	Num     int            `arg:"3" optional:"" default:"1" help:"num"`
}

func (sm *SpawnMobCmd) Run(ctx *Context) error {
	var petMaster *Player

	if sm.IsEnemy {
		petMaster = nil
	} else {
		petMaster = ctx.Operator
	}

	if slices.Contains(LinkableMobTypes, sm.Type) {
		for range sm.Num {
			ctx.Wp.LinkedMobSegmentation(
				sm.Type,

				sm.Rarity,

				ctx.Operator.X,
				ctx.Operator.Y,

				9,

				petMaster,
			)
		}
	} else {
		for range sm.Num {
			ctx.Wp.GenerateMob(
				sm.Type,

				sm.Rarity,

				ctx.Operator.X,
				ctx.Operator.Y,

				petMaster,

				nil,
				false,
			)
		}
	}

	return nil
}
