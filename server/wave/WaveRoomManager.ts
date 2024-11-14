import { Biomes } from "../../shared/biomes";
import { UserData } from "../entity/EntityPool";
import { PlayerInstance, StaticPlayerData } from "../entity/player/Player";
import { logger } from "../main";
import WaveRoom, { PlayerReadyState, WaveRoomVisibleState } from "./WaveRoom";
import { generate } from 'generate-passphrase';
import uWS from 'uWebSockets.js';

export default class WaveRoomManager {
    private waveRooms: WaveRoom[] = [];

    /**
     * Adds a player to an existing public wave room or creates a new one if none exists
     */
    public joinPublicWaveRoom(player: StaticPlayerData, biome: Biomes): boolean {
        let waveRoom = this.findPublicRoom(biome);

        if (!waveRoom) {
            if (!this.createWaveRoom(player, biome)) {
                return false;
            }
        } else {
            if (!waveRoom.addPlayer(player)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Adds a player to a private wave room using a room code
     */
    public joinWaveRoom(player: StaticPlayerData, code: string): number | false {
        const room = this.findPrivateRoom(code);
        if (!room) {
            return false;
        }

        return room.addPlayer(player);
    }

    /**
     * Removes a player from their wave room and deletes empty rooms
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
     * Removes a specific wave room from the manager
     */
    public removeWaveRoom(waveRoom: WaveRoom) {
        this.waveRooms.splice(this.waveRooms.indexOf(waveRoom), 1);

        logger.region(() => {
            using _guard = logger.metadata({ code: waveRoom.code });
            logger.info("Removed wave room");
        });
    }

    /**
     * Creates a new wave room with initial player
     */
    public createWaveRoom(player: StaticPlayerData, biome: Biomes): number | false {
        const waveRoom = new WaveRoom(biome, this.generateCode());
        this.waveRooms.push(waveRoom);

        logger.region(() => {
            using _guard = logger.metadata({ code: waveRoom.code });
            logger.info("Created wave room");
        });

        const id = waveRoom.addPlayer(player);

        return id;
    }

    /**
     * Finds a public room with available slots for the specified biome
     */
    private findPublicRoom(biome: Biomes): WaveRoom | undefined {
        return this.waveRooms.find(room => room.biome === biome && room.visible === WaveRoomVisibleState.PUBLIC && room.roomCandidates.length < WaveRoom.MAX_PLAYER_AMOUNT);
    }

    /**
     * Finds a private room with available slots by room code
     */
    private findPrivateRoom(code: string): WaveRoom | undefined {
        return this.waveRooms.find(room => room.code === code && room.roomCandidates.length < WaveRoom.MAX_PLAYER_AMOUNT);
    }

    /**
     * Finds the wave room that contains a specific player
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

    public getAllWebsockets(): uWS.WebSocket<UserData>[] {
        return [...new Set(this.waveRooms.map(w => w.roomCandidates.map(c => c.ws).concat(w.entityPool.getAllClients().map(c => c.ws))).flat())];
    }

    /**
     * Generates a unique room code
     */
    private generateCode(): string {
        const randomId = generate({ length: 1, numbers: false, fast: true });
        if (!this.waveRooms.every((room) => room.code !== randomId)) {
            return this.generateCode();
        }
        return randomId;
    }
}