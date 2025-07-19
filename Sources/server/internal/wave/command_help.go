package wave

type HelpCmd struct{}

var helpString = GetCliHelp(cli{})

func (h *HelpCmd) Run(ctx *Context) error {
	ctx.Wp.UnicastChatReceivePacket(ctx.Operator, helpString)

	return nil
}
