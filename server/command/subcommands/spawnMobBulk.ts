import { MobType, Rarities } from "../../../shared/enum";
import { waveRoomService } from "../../main";
import { UserData } from "../../wave/WavePool";
import { CommandPointer, Command, RespondValue } from "../command";
import { ArgContext, typesafeArg } from "../commandArgs";
import { Type } from "../commandLexer";
import { setTimeout } from 'node:timers/promises';
import { SPAWN_MOB_DEFAULT_OPTIONS } from "../commands/spawnMob";
import { MAP_CENTER_X, MAP_CENTER_Y, SAFETY_DISTANCE } from "../../entity/EntityWorldBoundary";
import { getRandomMapSafePosition } from "../../utils/random";

export function registerSpawnMobBulk(spawnMob: CommandPointer) {
    return spawnMob.newCommand(new Command({
        aliases: ["bulk"],
        description: "spawn mob on map but with amount",
        args: [
            ...SPAWN_MOB_DEFAULT_OPTIONS,
            typesafeArg({
                name: "amount",
                description: "mob spawn amount",
                type: Type.NUMBER,
                openEnded: false,
                required: false,

                nonProvidedValue: (userData, args) => 3,
            }),
            typesafeArg({
                name: "delay",
                description: "delay of every spawn interval in ms",
                type: Type.NUMBER,
                openEnded: false,
                required: false,

                nonProvidedValue: (userData, args) => 500,
            }),
        ],

        commandFunc: async function (ctx: ArgContext, userData: UserData): RespondValue {
            if (!userData) return null;

            const { waveRoomClientId, waveClientId } = userData;

            const waveRoom = waveRoomService.findPlayerRoom(waveRoomClientId);
            if (!waveRoom) return null;

            const mob: MobType = MobType[ctx.args[0].values[0].toConstructorValue(String).toUpperCase()] ?? MobType.BEE;
            const rarity: Rarities = Rarities[ctx.args[1].values[0].toConstructorValue(String).toUpperCase()] ?? Rarities.LEGENDARY;
            const coordinate = ctx.args[2].values[0].toConstructorValue(String).toLowerCase();
            const amount = ctx.args[3].values[0].toConstructorValue(Number);
            const delay = ctx.args[4].values[0].toConstructorValue(Number);

            const coordinateSplittedXY = coordinate.split(",").map(c => parseFloat(c));
            if (coordinate !== "random" && coordinateSplittedXY.length !== 2) {
                return null;
            }

            for (let i = 0; i < amount; i++) {
                const [x, y] =
                    coordinate === "random" ?
                        getRandomMapSafePosition(MAP_CENTER_X, MAP_CENTER_Y, waveRoom.wavePool.waveData.mapSize, SAFETY_DISTANCE, waveRoom.wavePool.getAllClients().filter(p => !p.isDead)) :
                        coordinateSplittedXY;

                waveRoom.wavePool.addPetalOrMob(mob, rarity, x, y, null, null);

                await setTimeout(delay);
            }

            return "Successfully spawned all.";
        },
    }));
}