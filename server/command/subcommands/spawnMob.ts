import { MobType } from "../../../shared/enum";
import { Rarities } from "../../../shared/rarity";
import { SAFETY_DISTANCE } from "../../entity/EntityMapBoundary";
import { waveRoomService } from "../../main";
import { getRandomSafePosition } from "../../utils/random";
import { UserData } from "../../wave/WavePool";
import { CommandPointer, Command, GoLikeRespondValue, CommandFuncReturnType } from "../command";
import { ArgContext, createTypedArg } from "../commandArgs";
import { Type } from "../commandLexer";

export const SPAWN_MOB_DEFAULT_ARGS = [
    createTypedArg({
        name: "mob",
        description: "name of mob",
        type: Type.STRING,
        openEnded: false,
        required: false,

        nonProvidedValue: (userData, args) => "BEE",
    }),
    createTypedArg({
        name: "rarity",
        description: "rarity of mob",
        type: Type.STRING,
        openEnded: false,
        required: false,

        nonProvidedValue: (userData, args) => "LEGENDARY",
    }),
    createTypedArg({
        name: "coordinate",
        description: "coordinate where mob spawn at (100,200 or random)",
        type: Type.STRING,
        openEnded: false,
        required: false,

        nonProvidedValue: (userData, args) => "random",
    }),
];

export function registerSpawnMob(spawn: CommandPointer) {
    return spawn.newCommand(new Command({
        aliases: ["mob"],
        description: "spawn mob on map",
        args: SPAWN_MOB_DEFAULT_ARGS,

        commandFunc: async function (ctx: ArgContext, userData: UserData): CommandFuncReturnType {
            if (!userData) return null;

            const { waveRoomClientId, waveClientId } = userData;

            const waveRoom = waveRoomService.findPlayerRoom(waveRoomClientId);
            if (!waveRoom) return null;

            const mob: MobType = MobType[ctx.args[0].values[0].toPrimitive(String).toUpperCase()] ?? MobType.BEE;
            const rarity: Rarities = Rarities[ctx.args[1].values[0].toPrimitive(String).toUpperCase()] ?? Rarities.LEGENDARY;
            const coordinate = ctx.args[2].values[0].toPrimitive(String).toLowerCase();

            const coordinateSplittedXY = coordinate.split(",").map(c => parseFloat(c));
            if (coordinate !== "random" && coordinateSplittedXY.length !== 2) {
                return "Coordinate is unsupported type.";
            }

            const [x, y] =
                coordinate === "random" ?
                    getRandomSafePosition(waveRoom.wavePool.waveData.waveMapRadius, SAFETY_DISTANCE, waveRoom.wavePool.getAllClients().filter(p => !p.isDead)) :
                    coordinateSplittedXY;

            waveRoom.wavePool.addPetalOrMob(mob, rarity, x, y, null, null);

            return "Successfully spawned.";
        },
    }));
}