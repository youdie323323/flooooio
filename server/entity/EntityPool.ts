import uWS from 'uWebSockets.js';
import { MoodKind, PacketKind, PacketType } from "../../shared/packet";
import { MobType, PetalType } from "../../shared/types";
import { Mob, MobInstance, MOB_SIZE_FACTOR, MobData } from "./mob/Mob";
import { Player, PlayerInstance } from "./player/Player";
import { onUpdateTick } from "./Entity";
import { generateId, getRandomAngle, getRandomSafePosition, isPetal } from './utils/small';
import { Rarities } from '../../shared/rarities';
import { mapCenterX, mapCenterY, mapRadius, safetyDistance } from './EntityChecksum';
import { MOB_PROFILES } from '../../shared/mobProfiles';
import { PETAL_PROFILES } from '../../shared/petalProfiles';
import { PetalData } from './mob/petal/Petal';

// Define UserData for WebSocket connections
export interface UserData {
    clientId: number;
}

export const FPS = 60;

export class EntityPool {
    public clients: Map<number, PlayerInstance>;
    public mobs: Map<number, MobInstance>;
    private updateInterval: NodeJS.Timeout;

    constructor() {
        this.clients = new Map();
        this.mobs = new Map();
        this.updateInterval = setInterval(() => this.update(), 1000 / FPS);
    }

    addClient(ws: uWS.WebSocket<UserData>): number | null {
        const clientId = generateId();

        // Ensure unique clientId
        if (Array.from(this.clients.values()).map(v => v.id).includes(clientId)) {
            return this.addClient(ws);
        }

        // 100 is level
        const levelMultiplier: number = (243 ** 0.01) ** (Math.max(100, 75) - 0.5);

        const randPos = getRandomSafePosition(mapCenterX, mapCenterY, mapRadius, safetyDistance, entityPool);
        if (!randPos) {
            return null;
        }

        const playerInstance = new Player();
        Object.assign(playerInstance, {
            id: clientId,
            x: randPos.x,
            y: randPos.y,
            angle: 0,
            magnitude: 0,
            mood: 0,
            size: 15,
            health: 200 * levelMultiplier,
            bodyDamage: 25 * levelMultiplier,
            // Not changing
            maxHealth: 200 * levelMultiplier,
            isDead: false,
            nickname: "s3x",
            ws,
            slots: {
                surface: [
                    this.addPetalOrMob(PetalType.FASTER, Rarities.SUPER, 0, 0),
                    this.addPetalOrMob(PetalType.BASIC, Rarities.SUPER, 0, 0),
                    this.addPetalOrMob(PetalType.BASIC, Rarities.SUPER, 0, 0),
                    this.addPetalOrMob(PetalType.BASIC, Rarities.SUPER, 0, 0),
                    this.addPetalOrMob(PetalType.BASIC, Rarities.SUPER, 0, 0),
                    this.addPetalOrMob(PetalType.BASIC, Rarities.SUPER, 0, 0),
                    this.addPetalOrMob(PetalType.BASIC, Rarities.SUPER, 0, 0),
                    this.addPetalOrMob(PetalType.BASIC, Rarities.SUPER, 0, 0),
                ].map(c => {
                    c.parentPlayer = playerInstance;
                    return c;
                }),
                bottom: new Array(8).fill(null),
                cooldowns: new Array(8).fill(0),
            },
        });

        this.clients.set(clientId, playerInstance);

        ws.getUserData().clientId = clientId;

        return clientId;
    }

    // Ill just return instance here
    addPetalOrMob(type: MobType | PetalType, rarity: Rarities, x: number, y: number) {
        const mobId = generateId();
        if (this.mobs.has(mobId)) {
            return this.addPetalOrMob(type, rarity, x, y);
        }

        const profile: MobData | PetalData = MOB_PROFILES[type] || PETAL_PROFILES[type];

        const mobInstance = new Mob();
        Object.assign(mobInstance, {
            id: mobId,
            type,
            x,
            y,
            angle: getRandomAngle(),
            magnitude: 0,
            rarity,
            size: isPetal(type) ? 6 : ((profile as MobData).baseSize * MOB_SIZE_FACTOR[rarity]),
            health: profile[rarity].health,
            // Not changing
            maxHealth: profile[rarity].health,
            targetPlayer: null,
        });

        this.mobs.set(mobId, mobInstance);
        return mobInstance;
    }

    private update() {
        this.clients.forEach((client) => {
            if (client[onUpdateTick]) {
                client[onUpdateTick](this);
            }
        });

        this.mobs.forEach((mob) => {
            if (mob[onUpdateTick]) {
                mob[onUpdateTick](this);
            }
        });

        this.broadcastUpdatePacket();
    }

    updatePositionProp(clientId: number, angle: number, magnitude: number) {
        const client = this.clients.get(clientId);
        if (client && !client.isDead) {
            client.angle = angle;
            client.magnitude = Math.max(0, Math.min(magnitude, 255)) * 5;
        }
    }

    updateMood(clientId: number, flag: MoodKind) {
        const client = this.clients.get(clientId);
        if (client && !client.isDead) {
            client.mood = flag;
        }
    }

    swapPetal(clientId: number, i: number) {
        const client = this.clients.get(clientId);
        if (
            client &&
            !client.isDead &&
            client.slots.surface.length >= i && client.slots.bottom.length >= i &&
            client.slots.bottom[i] instanceof Mob
        ) {
            if (client.slots.surface[i] instanceof Mob) {
                this.removeMob(client.slots.surface[i].id);
            }

            const temp = client.slots.surface[i];
            client.slots.surface[i] = client.slots.bottom[i];
            client.slots.bottom[i] = temp;
        }
    }

    broadcastUpdatePacket(excludeClientId?: number) {
        const updatePacket = this.createUpdatePacket();

        // Loop through all WebSocket connections
        this.clients.forEach((_, clientId) => {
            const ws = this.getWebSocket(clientId);
            if (ws && clientId !== excludeClientId) {
                try {
                    ws.send(updatePacket, true);
                } catch (e) {
                    // Connection is closed, remove the client
                    this.removeClient(clientId);
                }
            }
        });
    }

    private calculateClientsPacketSize(): number {
        // 2 bytes for the client count
        let size = 2;
        this.clients.forEach(client => {
            size += 4 + 8 + 8 + 4 + 4 + 1 + 1 + 1 + client.nickname.length + 1 + 4; // Total bytes per client
        });
        return size;
    }

    private calculateMobsPacketSize(): number {
        // 2 bytes for the mob count
        let size = 2;
        this.mobs.forEach(mob => {
            size += 4 + 8 + 8 + 4 + 4 + 8 + 1 + 1 + 4; // Total bytes per mob
        });
        return size;
    }

    private createClientsPacket() {
        const size = this.calculateClientsPacketSize();
        const buffer = Buffer.alloc(size);
        let offset = 0;

        // Client count
        buffer.writeUInt16BE(this.clients.size, offset);
        offset += 2;

        this.clients.forEach(client => {
            buffer.writeUInt32BE(client.id, offset);
            offset += 4;

            buffer.writeDoubleBE(client.x, offset);
            offset += 8;
            buffer.writeDoubleBE(client.y, offset);
            offset += 8;

            buffer.writeInt32BE(client.health, offset);
            offset += 4;

            buffer.writeUInt32BE(client.size, offset);
            offset += 4;

            buffer.writeUInt8(client.angle, offset++);

            buffer.writeUInt8(client.mood, offset++);

            buffer.writeUInt8(client.isDead ? 1 : 0, offset++);

            const nicknameBuffer = Buffer.from(client.nickname, 'utf-8');

            buffer.writeUInt8(nicknameBuffer.length, offset++);

            nicknameBuffer.copy(buffer, offset);
            offset += nicknameBuffer.length;

            buffer.writeInt32BE(client.maxHealth, offset);
            offset += 4;
        });

        return buffer;
    }

    private createMobsPacket() {
        const size = this.calculateMobsPacketSize();
        const buffer = Buffer.alloc(size);
        let offset = 0;

        // Mob count
        buffer.writeUInt16BE(this.mobs.size, offset);
        offset += 2;

        this.mobs.forEach(mob => {
            buffer.writeUInt32BE(mob.id, offset);
            offset += 4;

            buffer.writeDoubleBE(mob.x, offset);
            offset += 8;
            buffer.writeDoubleBE(mob.y, offset);
            offset += 8;

            buffer.writeInt32BE(mob.health, offset);
            offset += 4;

            buffer.writeUInt32BE(mob.size, offset);
            offset += 4;

            buffer.writeDoubleBE(mob.angle, offset);
            offset += 8;

            // Make this uint16 when petals & mobs ids above 255
            buffer.writeUInt8(mob.type, offset++);

            buffer.writeUInt8(mob.rarity, offset++);

            buffer.writeInt32BE(mob.maxHealth, offset);
            offset += 4;
        });

        return buffer;
    }

    private createUpdatePacket(): Buffer {
        const clientsPacket = this.createClientsPacket();
        const mobsPacket = this.createMobsPacket();

        const totalLength = 1 + clientsPacket.length + mobsPacket.length;

        const buffer = Buffer.alloc(totalLength);
        let offset = 0;

        buffer.writeUInt8(PacketKind.UPDATE, offset++);

        clientsPacket.copy(buffer, offset);
        offset += clientsPacket.length;

        mobsPacket.copy(buffer, offset);

        return buffer;
    }

    getClientId(ws: uWS.WebSocket<UserData>): number | undefined {
        return ws.getUserData()?.clientId;
    }

    getClient(id: number): PlayerInstance | undefined {
        return this.clients.get(id);
    }

    removeClient(clientId: number) {
        const client = this.clients.get(clientId);
        if (client) {
            this.clients.delete(clientId);
        }
    }

    getAllClients() {
        return Array.from(this.clients.values());
    }

    getMob(id: number): MobInstance | undefined {
        return this.mobs.get(id);
    }

    removeMob(id: number) {
        const mob = this.mobs.get(id);
        if (mob) {
            this.mobs.delete(id);
        }
    }

    getAllMobs() {
        return Array.from(this.mobs.values());
    }

    private getWebSocket(clientId: number): uWS.WebSocket<UserData> | undefined {
        return this.clients.get(clientId)?.ws;
    }
}

export const entityPool = new EntityPool();