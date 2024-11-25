import { UserData } from "../wave/WavePool";
import { Command } from "./command";
import { ArgContext } from "./commandArgs";
import { registerSpawnMob } from "./commands/spawnMob";

let root: Command = new Command({
    aliases: ["<root_node>"],
    description: "root node for the command handler",

    commandFunc: async (ac: ArgContext, userData: UserData) => {
        return new Promise((resolve, reject) => {
            resolve(new Error(`Command not found`));
        });
    },
});

export default root;