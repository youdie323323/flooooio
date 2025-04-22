package game

type ExpandMapRadiusCmd struct {
	Radius uint16 `arg:"0" help:"radius"`
}

func (er *ExpandMapRadiusCmd) Run(ctx *Context) error {
	ctx.Wp.Wd.MapRadius = er.Radius

	return nil
}
