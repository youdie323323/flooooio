import { MobType, Rarities } from "../../../shared/enum";
import { MAP_CENTER_X, MAP_CENTER_Y, SAFETY_DISTANCE } from "../../entity/EntityWorldBoundary";
import { waveRoomService } from "../../main";
import { getRandomMapSafePosition } from "../../utils/random";
import { UserData } from "../../wave/WavePool";
import { CommandPointer, Command, RespondValue } from "../command";
import { ArgContext, typesafeArg } from "../commandArgs";
import { Type } from "../commandLexer";

export const SPAWN_MOB_DEFAULT_OPTIONS = [
    typesafeArg({
        name: "mob",
        description: "name of mob",
        type: Type.STRING,
        openEnded: false,
        required: false,

        nonProvidedValue: (userData, args) => "BEE",
    }),
    typesafeArg({
        name: "rarity",
        description: "rarity of mob",
        type: Type.STRING,
        openEnded: false,
        required: false,

        nonProvidedValue: (userData, args) => "LEGENDARY",
    }),
    typesafeArg({
        name: "coordinate",
        description: "coordinate where mob spawn at (100,200 or random)",
        type: Type.STRING,
        openEnded: false,
        required: false,

        nonProvidedValue: (userData, args) => "random",
    }),
];

export function registerSpawnMob(root: CommandPointer) {
    return root.newCommand(new Command({
        aliases: ["spawn-mob"],
        description: "spawn mob on map",
        args: [...SPAWN_MOB_DEFAULT_OPTIONS],

        commandFunc: function (ctx: ArgContext, userData: UserData): RespondValue {
            if (!userData) return null;

            const { waveRoomClientId, waveClientId } = userData;

            const waveRoom = waveRoomService.findPlayerRoom(waveRoomClientId);
            if (!waveRoom) return null;

            const mob: MobType = MobType[ctx.args[0].values[0].toConstructorValue(String).toUpperCase()] ?? MobType.BEE;
            const rarity: Rarities = Rarities[ctx.args[1].values[0].toConstructorValue(String).toUpperCase()] ?? Rarities.LEGENDARY;
            const coordinate = ctx.args[2].values[0].toConstructorValue(String).toLowerCase();

            const coordinateSplittedXY = coordinate.split(",").map(c => parseFloat(c));
            if (coordinate !== "random" && coordinateSplittedXY.length !== 2) {
                return null;
            }

            const [x, y] =
                coordinate === "random" ?
                    getRandomMapSafePosition(MAP_CENTER_X, MAP_CENTER_Y, waveRoom.wavePool.waveData.mapSize, SAFETY_DISTANCE, waveRoom.wavePool.getAllClients().filter(p => !p.isDead)) :
                    coordinateSplittedXY;

            waveRoom.wavePool.addPetalOrMob(mob, rarity, x, y, null, null);
        },
    }));
}