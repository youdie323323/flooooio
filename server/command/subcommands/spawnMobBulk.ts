import { MobType } from "../../../shared/enum";
import { waveRoomService } from "../../main";
import { UserData } from "../../wave/WavePool";
import { CommandPointer, Command, GoLikeRespondValue, CommandFuncReturnType } from "../command";
import { ArgContext, createTypedArg } from "../commandArgs";
import { Type } from "../commandLexer";
import { setTimeout } from 'node:timers/promises';
import { SAFETY_DISTANCE } from "../../entity/EntityWorldBoundary";
import { getRandomSafePosition } from "../../utils/random";
import { SPAWN_MOB_DEFAULT_ARGS } from "./spawnMob";
import { Rarities } from "../../../shared/rarity";

export function registerSpawnMobBulk(spawnMob: CommandPointer) {
    return spawnMob.newCommand(new Command({
        aliases: ["bulk"],
        description: "spawn mob on map but with amount",
        args: [
            ...SPAWN_MOB_DEFAULT_ARGS,
            createTypedArg({
                name: "amount",
                description: "mob spawn amount",
                type: Type.NUMBER,
                openEnded: false,
                required: false,

                nonProvidedValue: (userData, args) => 3,
            }),
            createTypedArg({
                name: "delay",
                description: "delay of every spawn interval in ms",
                type: Type.NUMBER,
                openEnded: false,
                required: false,

                nonProvidedValue: (userData, args) => 500,
            }),
        ],

        commandFunc: async function (ctx: ArgContext, userData: UserData): CommandFuncReturnType {
            if (!userData) return null;

            const { waveRoomClientId, waveClientId } = userData;

            const waveRoom = waveRoomService.findPlayerRoom(waveRoomClientId);
            if (!waveRoom) return null;

            const mob: MobType = MobType[ctx.args[0].values[0].toPrimitive(String).toUpperCase()] ?? MobType.BEE;
            const rarity: Rarities = Rarities[ctx.args[1].values[0].toPrimitive(String).toUpperCase()] ?? Rarities.LEGENDARY;
            const coordinate = ctx.args[2].values[0].toPrimitive(String).toLowerCase();
            const amount = ctx.args[3].values[0].toPrimitive(Number);
            const delay = ctx.args[4].values[0].toPrimitive(Number);

            const coordinateSplittedXY = coordinate.split(",").map(c => parseFloat(c));
            if (coordinate !== "random" && coordinateSplittedXY.length !== 2) {
                return "Coordinate is unsupported type.";
            }

            (async () => {
                for (let i = 0; i < amount; i++) {
                    if (!waveRoom?.wavePool) {
                        return;
                    }

                    const [x, y] =
                        coordinate === "random" ?
                            getRandomSafePosition(waveRoom.wavePool.waveData.waveMapRadius, SAFETY_DISTANCE, waveRoom.wavePool.getAllClients().filter(p => !p.isDead)) :
                            coordinateSplittedXY;

                    waveRoom.wavePool.addPetalOrMob(mob, rarity, x, y, null, null);

                    await setTimeout(delay);
                }
            })();

            return "Spawn process started in the background.";
        },
    }));
}