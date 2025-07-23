package wave

import (
	"fmt"
	"reflect"
	"strconv"
	"strings"

	"github.com/alecthomas/kong"
)

/*
	We already did lock in HandleChatMessage, so no need to do lock for each commands Run().
*/

const (
	CommandPrefix = "/"
)

type Context struct {
	Operator *Player

	Wp *Pool
}

type cli struct {
	Help HelpCmd `cmd:"help" help:"List all commands or list help for a specific command"`

	SpawnMob        SpawnMobCmd            `cmd:"spawn-mob" help:"Spawns a mob"`
	ExpandMapRadius ExpandMapRadiusCmd     `cmd:"expand-map-radius" help:"Expands a map radius"`
	SetWaveProgress SetWaveProgressCommand `cmd:"set-wave-progress" help:"Sets a wave progress"`
}

type yesNoBool bool

var yesNoBoolType = reflect.TypeOf(yesNoBool(false))

func (b *yesNoBool) Decode(ctx *kong.DecodeContext) error {
	var value string
	if err := ctx.Scan.PopValueInto("value", &value); err != nil {
		return err
	}

	result, err := yesNoDecoder(value)
	if err != nil {
		return err
	}

	*b = yesNoBool(result)

	return nil
}

func yesNoDecoder(value string) (bool, error) {
	switch value {
	case "yes", "y":
		return true, nil

	case "no", "n":
		return false, nil

	default:
		return strconv.ParseBool(value)
	}
}

func GetCliHelp(c cli) string {
	t := reflect.TypeOf(c)

	var commands []string

	for i := range t.NumField() {
		field := t.Field(i)

		cmdName := field.Tag.Get("cmd")
		help := field.Tag.Get("help")

		args := GetCommandFormat(reflect.Zero(field.Type).Interface())
		if args != "" {
			args = " " + args
		}

		commands = append(commands, fmt.Sprintf("/%s%s - %s", cmdName, args, help))
	}

	return strings.Join(commands, "\n")
}

func GetCommandFormat(cmd any) string {
	t := reflect.TypeOf(cmd)

	var result []string

	for i := range t.NumField() {
		field := t.Field(i)

		help := field.Tag.Get("help")
		if field.Type == yesNoBoolType {
			help += "?"
			help += " "
			help += "y/n"
		}

		_, ok := field.Tag.Lookup("optional")

		if !ok {
			result = append(result, "<"+help+">")
		} else {
			result = append(result, "["+help+"]")
		}
	}

	return strings.Join(result, " ")
}

func ParseCommand(cmdStr string) (*kong.Context, error) {
	// Remove / prefix
	cmdStr = strings.TrimPrefix(cmdStr, CommandPrefix)

	var cli cli
	parser, err := kong.New(&cli)
	if err != nil {
		return nil, err
	}

	args := strings.Fields(cmdStr)

	ctx, err := parser.Parse(args)
	if err != nil {
		return nil, err
	}

	return ctx, nil
}
