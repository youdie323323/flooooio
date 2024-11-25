import { MobType, Rarities } from "../../../shared/enum";
import { waveRoomService } from "../../main";
import { UserData } from "../../wave/WavePool";
import { CommandPointer, Command, RespondValue } from "../command";
import { ArgContext } from "../commandArgs";

export function registerSpawnMob(root: CommandPointer) {
    return root.newCommand(new Command({
        aliases: ["spawn-mob"],
        description: "spawn mob on map",
        args: [],
        
        commandFunc: function (ctx: ArgContext, userData: UserData): RespondValue {
            if (!userData) return null;

            const { waveRoomClientId, waveClientId } = userData;

            const waveRoom = waveRoomService.findPlayerRoom(waveRoomClientId);
            if (!waveRoom) return null;

            waveRoom.wavePool.addPetalOrMob(MobType.BEE, Rarities.MYTHIC, 100, 100, null, null);
        },
    }));
}