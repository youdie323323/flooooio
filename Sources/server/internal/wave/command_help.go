package wave

type HelpCmd struct{}

var helpString = GetCliHelp(cli{})

func (h *HelpCmd) Run(ctx *Context) error {
	ctx.Wp.UnicastChatReceivPacket(ctx.Operator, helpString)

	return nil
}
