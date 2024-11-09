import { Biomes } from "../../shared/biomes";
import { PlayerData, PlayerInstance } from "../entity/player/Player";
import WaveRoom from "./WaveRoom";

export default class WaveRoomManager {
    private waveRooms: WaveRoom[] = [];

    public joinPublicWaveRoom(player: PlayerData, biome: Biomes): boolean {
        let waveRoom = this.findPublicRoom(biome);

        if (!waveRoom) {
            this.waveRooms.push(new WaveRoom(biome, player, this.generateCode()));
        } else {
            if (!waveRoom.addPlayer(player)) {
                return false;
            }
        }

        return true;
    }

    public joinPrivateWaveRoom(player: PlayerData, code: string): number | false {
        const room = this.findPrivateRoom(code);
        if (!room) {
            return false;
        }

        return room.addPlayer(player);
    }

    public leaveWaveRoom(id: number): boolean {
        for (const waveRoom of this.waveRooms) {
            if (waveRoom.removePlayer(id)) {
                if (waveRoom.roomPlayers.length === 0) {
                    this.waveRooms.splice(this.waveRooms.indexOf(waveRoom), 1);
                }

                return true;
            }
        }

        return false;
    }

    public createWaveRoom(player: PlayerData, biome: Biomes) {
        this.waveRooms.push(new WaveRoom(biome, player, this.generateCode()));
    }

    private findPublicRoom(biome: Biomes): WaveRoom | undefined {
        return this.waveRooms.find(
            (room) => room.biome === biome && room.public === true && room.roomPlayers.length < WaveRoom.MAX_PLAYER_AMOUNT
        );
    }

    private findPrivateRoom(code: string): WaveRoom | undefined {
        return this.waveRooms.find(room => room.code === code && room.roomPlayers.length < WaveRoom.MAX_PLAYER_AMOUNT);
    }

    public findPlayerRoom(id: number): WaveRoom | null {
        for (const waveRoom of this.waveRooms) {
            const findedPlayer = waveRoom.roomPlayers.find(p => p.id === id);
            if (findedPlayer) {
                return waveRoom;
            }
        }

        return null;
    }

    private generateCode(): string {
        const randomId = Math.random().toString(32).slice(2);
        if (!this.waveRooms.every((room) => room.code !== randomId)) {
            return this.generateCode();
        }
        return randomId;
    }
}