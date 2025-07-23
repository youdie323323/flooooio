package wave

type SetWaveProgressCommand struct {
	Progress   uint16 `arg:"0" help:"progress"`
	GroupIndex *int   `arg:"1" optional:"" help:"group"`
}

func (swp *SetWaveProgressCommand) Run(ctx *Context) error {
	ctx.Wp.Data.Progress = swp.Progress
	ctx.Wp.Data.ProgressIsRed = false
	ctx.Wp.Data.ProgressRedTimer = 0
	ctx.Wp.Data.ProgressTimer = 0

	ctx.Wp.Spawner.Next(ctx.Wp.Data, swp.GroupIndex)

	return nil
}
