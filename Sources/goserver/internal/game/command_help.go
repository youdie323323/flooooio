package game

type HelpCmd struct{}

var helpString = GetCliHelp(cli{})

func (h *HelpCmd) Run(ctx *Context) error {
	ctx.Wp.UnicastChatReceivPacket(*ctx.Operator.Id, helpString)

	return nil
}
