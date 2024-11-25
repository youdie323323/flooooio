import { MobType, Rarities } from "../../../shared/enum";
import { waveRoomService } from "../../main";
import { UserData } from "../../wave/WavePool";
import { CommandPointer, Command, RespondValue } from "../command";
import { ArgContext, typesafeArg } from "../commandArgs";
import { Type } from "../commandLexer";
import { setTimeout } from 'node:timers/promises';

export function registerSpawnMobBulk(spawnMob: CommandPointer) {
    return spawnMob.newCommand(new Command({
        aliases: ["bulk"],
        description: "spawn mob on map but with amount",
        args: [
            typesafeArg({
                name: "amount",
                description: "mob spawn amount",
                type: Type.NUMBER,
                openEnded: false,
                required: false,

                notProvided: (userData, args) => 3,
            }),
            typesafeArg({
                name: "delay",
                description: "delay of every spawn interval in ms",
                type: Type.NUMBER,
                openEnded: false,
                required: false,

                notProvided: (userData, args) => 500,
            }),
        ],

        commandFunc: async function (ctx: ArgContext, userData: UserData): RespondValue {
            if (!userData) return null;

            const { waveRoomClientId, waveClientId } = userData;

            const amount = ctx.args[0].values[0].toConstructorValue(Number);
            const delay = ctx.args[1].values[0].toConstructorValue(Number);

            const waveRoom = waveRoomService.findPlayerRoom(waveRoomClientId);
            if (!waveRoom) return null;

            for (let i = 0; i < amount; i++) {
                waveRoom.wavePool.addPetalOrMob(MobType.BEE, Rarities.MYTHIC, 100, 100, null, null);

                await setTimeout(delay);
            }

            return "Successfully spawned all.";
        },
    }));
}