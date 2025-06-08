package wave

type SetWaveProgressCommand struct {
	Progress   uint16 `arg:"0" help:"progress"`
	GroupIndex *int   `arg:"1" optional:""  help:"group"`
}

func (swp *SetWaveProgressCommand) Run(ctx *Context) error {
	ctx.Wp.Wd.Progress = swp.Progress
	ctx.Wp.Wd.ProgressIsRed = false
	ctx.Wp.Wd.ProgressRedTimer = 0
	ctx.Wp.Wd.ProgressTimer = 0

	ctx.Wp.Ms.Next(ctx.Wp.Wd, swp.GroupIndex)

	return nil
}
