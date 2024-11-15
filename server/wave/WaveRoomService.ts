import { Biomes } from "../../shared/biomes";
import { UserData } from "../entity/EntityPool";
import { PlayerInstance, StaticPlayerData } from "../entity/player/Player";
import { logger } from "../main";
import WaveRoom, { PlayerReadyState, WaveRoomVisibleState } from "./WaveRoom";
import { generate } from 'generate-passphrase';
import uWS from 'uWebSockets.js';

export default class WaveRoomService {
    private waveRooms: WaveRoom[] = [];

    /**
     * Adds a player to an existing public wave room or creates a new one if none exists.
     */
    public joinPublicWaveRoom(userData: UserData, biome: Biomes): number | false {
        this.leaveCurrentWaveRoom(userData);

        let waveRoom = this.findPublicRoom(biome);

        if (!waveRoom) {
            return this.createWaveRoom(userData, biome);
        } else {
            return waveRoom.addPlayer(userData.wavePlayerData);
        }
    }

    /**
     * Adds a player to a private wave room using a room code.
     */
    public joinWaveRoom(userData: UserData, code: string): number | false {
        this.leaveCurrentWaveRoom(userData);

        const room = this.findPrivateRoom(code);
        if (!room) {
            return false;
        }

        return room.addPlayer(userData.wavePlayerData);
    }

    /**
     * Removes a player from their wave room, delete empty rooms if wave room is empty.
     */
    public leaveWaveRoom(id: number): boolean {
        for (const waveRoom of this.waveRooms) {
            if (waveRoom.removePlayer(id)) {
                if (waveRoom.roomCandidates.length === 0) {
                    this.removeWaveRoom(waveRoom);
                }

                return true;
            }
        }

        return false;
    }

    /**
     * Removes a specific wave room from the manager.
     */
    public removeWaveRoom(waveRoom: WaveRoom) {
        this.waveRooms.splice(this.waveRooms.indexOf(waveRoom), 1);

        logger.region(() => {
            using _guard = logger.metadata({ code: waveRoom.code });
            logger.info("Removed wave room");
        });
    }

    /**
     * Creates a new wave room with initial player.
     */
    public createWaveRoom(userData: UserData, biome: Biomes): number | false {
        this.leaveCurrentWaveRoom(userData);

        const waveRoom = new WaveRoom(biome, this.generateCode());
        this.waveRooms.push(waveRoom);

        logger.region(() => {
            using _guard = logger.metadata({ code: waveRoom.code });
            logger.info("Created wave room");
        });

        return waveRoom.addPlayer(userData.wavePlayerData);
    }

    /**
     * Finds a public room with available slots for the specified biome.
     */
    private findPublicRoom(biome: Biomes): WaveRoom | undefined {
        return this.waveRooms.find(room => room.biome === biome && room.visible === WaveRoomVisibleState.PUBLIC && room.canAddCandidate);
    }

    /**
     * Finds a private room with available slots by room code.
     * 
     * @remarks
     * 
     * This don't actually find a private room, just find a room with the same code.
     */
    private findPrivateRoom(code: string): WaveRoom | undefined {
        return this.waveRooms.find(room => room.code === code && room.canAddCandidate);
    }

    /**
     * Finds the wave room that contains a specific player.
     */
    public findPlayerRoom(id: number): WaveRoom | null {
        for (const waveRoom of this.waveRooms) {
            const findedPlayer = waveRoom.roomCandidates.find(p => p.id === id);
            if (findedPlayer) {
                return waveRoom;
            }
        }

        return null;
    }

    public get websockets(): uWS.WebSocket<UserData>[] {
        return [...new Set(this.waveRooms.map(w => w.roomCandidates.map(c => c.ws).concat(w.entityPool.getAllClients().map(c => c.ws))).flat())];
    }

    /**
     * Generates a unique room code.
     */
    private generateCode(): string {
        const randomId = generate({ length: 1, numbers: false, fast: true });
        if (!this.waveRooms.every((room) => room.code !== randomId)) {
            return this.generateCode();
        }
        return randomId;
    }

    /**
     * Remove player from wave room if player were in other wave room.
     * 
     * @remarks
     * 
     * The first time this code is executed, the room which player was in will no finded by find○○Room.
     * However, placing this at the beginning of the code means that the player will exit the player's current room even if they are not joining a room.
     * I don't know how this works in the original, but this may not be correct.
     */
    private leaveCurrentWaveRoom(userData: UserData) {
        if (userData?.waveRoomClientId) this.leaveWaveRoom(userData.waveRoomClientId);
    }
}