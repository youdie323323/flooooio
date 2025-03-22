import type { Biome } from "../../../../../Shared/Biome";
import { WaveRoomVisibleState } from "../../../../../Shared/WaveRoom";
import type { WaveRoomCode} from "../../../../../Shared/WaveRoomCode";
import { generateRandomWaveRoomCode } from "../../../../../Shared/WaveRoomCode";
import { logger } from "../../../../Main";
import type { UserData } from "./WavePool";
import type { WaveRoomPlayerId } from "./WaveRoom";
import WaveRoom from "./WaveRoom";

export default class WaveRoomService {
    private waveRooms: WaveRoom[] = [];

    /**
     * Adds a player to an existing public wave room or creates a new one if none exists.
     */
    public joinPublicWaveRoom(userData: UserData, biome: Biome): WaveRoomPlayerId | false {
        if (!this.canUserDataAdded(userData)) {
            return false;
        }

        this.leaveCurrentWaveRoom(userData);

        let waveRoom = this.findPublicRoom(biome);

        if (!waveRoom) {
            return this.createWaveRoom(userData, biome);
        } else {
            return waveRoom.registerPlayer(userData.staticPlayerData);
        }
    }

    /**
     * Adds a player to a private wave room using a room code.
     */
    public joinWaveRoom(userData: UserData, code: WaveRoomCode): WaveRoomPlayerId | false {
        if (!this.canUserDataAdded(userData)) {
            return false;
        }

        this.leaveCurrentWaveRoom(userData);

        const room = this.findPrivateRoom(code);
        if (!room) {
            return false;
        }

        return room.registerPlayer(userData.staticPlayerData);
    }

    /**
     * Removes a player from their wave room, delete empty rooms if wave room is empty.
     */
    public leaveWaveRoom(id: WaveRoomPlayerId): boolean {
        for (const waveRoom of this.waveRooms) {
            if (waveRoom.unregisterPlayer(id)) {
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
     * 
     * @remarks
     * 
     * This release wavePool memory too.
     */
    public removeWaveRoom(waveRoom: WaveRoom) {
        waveRoom.releaseAllMemory();

        this.waveRooms.splice(this.waveRooms.indexOf(waveRoom), 1);

        logger.region(() => {
            using _guard = logger.metadata({ code: waveRoom.code });
            logger.info("Removed wave (room)");
        });
    }

    /**
     * Creates a new wave room with initial player.
     */
    public createWaveRoom(userData: UserData, biome: Biome): WaveRoomPlayerId | false {
        if (!this.canUserDataAdded(userData)) {
            return false;
        }

        this.leaveCurrentWaveRoom(userData);

        const waveRoom = new WaveRoom(biome, this.generateCode());
        this.waveRooms.push(waveRoom);

        logger.region(() => {
            using _guard = logger.metadata({ code: waveRoom.code });
            logger.info("Created wave room");
        });

        return waveRoom.registerPlayer(userData.staticPlayerData);
    }

    /**
     * Finds a public room with available slots for the specified biome.
     */
    private findPublicRoom(biome: Biome): WaveRoom | undefined {
        // Trying to find biome-specific room, if not found, try other biome
        const isPublic = (room: WaveRoom) => room.visible === WaveRoomVisibleState.Public && room.newPlayerAcceptable;

        return this.waveRooms.find(room => room.biome === biome && isPublic(room)) || this.waveRooms.find(room => isPublic(room));
    }

    /**
     * Finds a private room with available slots by room code.
     * 
     * @remarks
     * This don't actually find a private room, just find a room with the same code.
     */
    private findPrivateRoom(code: WaveRoomCode): WaveRoom | undefined {
        return this.waveRooms.find(room => room.code === code && room.newPlayerAcceptable);
    }

    /**
     * Finds the wave room that contains a specific player.
     */
    public findPlayerRoom(id: WaveRoomPlayerId): WaveRoom | null {
        for (const waveRoom of this.waveRooms) {
            const findedPlayer = waveRoom.roomCandidates.find(p => p.id === id);
            if (findedPlayer) {
                return waveRoom;
            }
        }

        return null;
    }

    /**
     * Generates a unique room code.
     */
    private generateCode(): WaveRoomCode {
        const randomId = generateRandomWaveRoomCode();
        if (!this.waveRooms.every((room) => room.code !== randomId)) {
            return this.generateCode();
        }
        
        return randomId;
    }

    /**
     * Remove player from wave room if player were in other wave room.
     * 
     * @remarks
     * The first time this code is executed, the room which player was in will no finded by find○○Room.
     * However, placing this at the beginning of the code means that the player will exit the player's current room even if they are not joining a room.
     * I don't know how this works in the original, but this maybe not correct.
     */
    private leaveCurrentWaveRoom(userData: UserData) {
        if (userData?.waveRoomClientId) this.leaveWaveRoom(userData.waveRoomClientId);
    }

    /**
     * Determine if user data is allowed to join/add.
     */
    private canUserDataAdded(userData: UserData): boolean {
        return !userData || !userData.staticPlayerData ||
            // Anti ws duplicate
            !new Set(this.waveRooms.map(waveRoom => waveRoom.wavePool.getAllClients().map(c => c.ws)).flat()).has(userData.staticPlayerData.ws);
    }

    /**
     * Get all wave room.
     */
    public get allWaveRoom(): WaveRoom[] {
        return this.waveRooms;
    }
}