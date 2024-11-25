import { MobType, Rarities } from "../../../shared/enum";
import { SAFETY_DISTANCE } from "../../entity/EntityWorldBoundary";
import { waveRoomService } from "../../main";
import { getRandomMapSafePosition } from "../../utils/random";
import { UserData } from "../../wave/WavePool";
import { CommandPointer, Command, GoLikeRespondValue, CommandFuncReturnType } from "../command";
import { ArgContext, createTypedArg } from "../commandArgs";
import { Type } from "../commandLexer";

export function registerSpawn(root: CommandPointer) {
    return root.newCommand(new Command({
        aliases: ["spawn"],
        description: "spawn entity on map",
        args: [],

        commandFunc: async function (ctx: ArgContext, userData: UserData): CommandFuncReturnType {
            return "Spawn command not valid with single.";
        },
    }));
}