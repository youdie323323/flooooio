import { Biomes } from "../shared/enum";
import { Mood } from "../shared/mood";
import { ClientBound, ServerBound } from "../shared/packet";
import { Rarities } from "../shared/rarity";
import { WaveRoomPlayerReadyState, WaveRoomState, WaveRoomVisibleState } from "../shared/wave";
import EntityMob from "./entity/EntityMob";
import EntityPlayer from "./entity/EntityPlayer";
import { players, mobs, uiCtx } from "./main";
import UserInterfaceGame from "./ui/mode/UserInterfaceModeGame";
import UserInterfaceTitle, { StatusText, WaveRoomPlayerInformation } from "./ui/mode/UserInterfaceModeTitle";

const TAU = Math.PI * 2;

export let waveSelfId = -1;
export let waveRoomSelfId = -1;

// TODO: rewrite these shit

function angleToRad(angle: number) {
    return angle / 255 * TAU;
}

function getNormalizedAngle(angle: number): number {
    angle %= TAU;
    if (angle < 0) {
        angle += TAU;
    }
    return Math.round(angle / TAU * 255);
}

export default class Networking {
    // Message senders
    [key: `send${string}`]: (...args: ReadonlyArray<any>) => void;

    private textEncoder: TextEncoder;
    private textDecoder: TextDecoder;

    constructor(public ws: WebSocket) {
        this.textEncoder = new TextEncoder();
        this.textDecoder = new TextDecoder("utf-8", {
            ignoreBOM: true,
            fatal: true
        });

        ws.onmessage = (event) => {
            const readString = (): string => {
                const len = data.getUint8(offset++);
                const buffers = new Uint8Array(data.buffer, offset, len);
                const string = this.textDecoder.decode(buffers);
                offset += len;
                return string;
            }

            const data = new DataView(event.data);
            let offset = 0;

            switch (data.getUint8(offset++)) {
                case ClientBound.WAVE_SELF_ID: {
                    waveSelfId = data.getUint32(offset);

                    break;
                }
                case ClientBound.WAVE_ROOM_SELF_ID: {
                    waveRoomSelfId = data.getUint32(offset);

                    break;
                }
                case ClientBound.WAVE_UPDATE: {
                    if (uiCtx.currentCtx instanceof UserInterfaceGame) {
                        // Wave informations
                        {
                            const waveProgress = data.getUint16(offset);
                            offset += 2;

                            const waveProgressTimer = data.getFloat64(offset);
                            offset += 8;

                            const waveProgressRedGageTimer = data.getFloat64(offset);
                            offset += 8;

                            const waveEnded = !!data.getUint8(offset++);

                            // World size
                            const waveMapRadius = data.getUint16(offset);
                            offset += 2;

                            uiCtx.currentCtx.waveProgress = waveProgress;

                            uiCtx.currentCtx.nWaveProgressTimer = waveProgressTimer;
                            uiCtx.currentCtx.oWaveProgressTimer = uiCtx.currentCtx.waveProgressTimer;

                            uiCtx.currentCtx.nWaveProgressRedGageTimer = waveProgressRedGageTimer;
                            uiCtx.currentCtx.oWaveProgressRedGageTimer = uiCtx.currentCtx.waveProgressRedGageTimer;

                            uiCtx.currentCtx.waveEnded = waveEnded;

                            uiCtx.currentCtx.nMapRadius = waveMapRadius;
                            uiCtx.currentCtx.oMapRadius = uiCtx.currentCtx.mapRadius;

                            uiCtx.currentCtx.updateT = 0;
                        }

                        const clientCount = data.getUint16(offset);
                        offset += 2;

                        for (let i = 0; i < clientCount; i++) {
                            const clientId = data.getUint32(offset);
                            offset += 4;

                            const clientX = data.getFloat64(offset);
                            offset += 8;
                            const clientY = data.getFloat64(offset);
                            offset += 8;

                            const clientAngle = angleToRad(data.getUint8(offset++));

                            const clientHealth = data.getInt32(offset);
                            offset += 4;

                            const clientMaxHealth = data.getInt32(offset);
                            offset += 4;

                            const clientSize = data.getUint32(offset);
                            offset += 4;

                            const clientMood = data.getUint8(offset++);

                            const clientNickname = readString();

                            // Decode boolean flags
                            const bFlags = data.getUint8(offset++);
                            const clientIsDead = !!(bFlags & 1);

                            const client = players.get(clientId);
                            if (client) {
                                client.nx = clientX;
                                client.ny = clientY;
                                client.nAngle = clientAngle;
                                client.nSize = clientSize;
                                client.mood = clientMood;
                                client.isDead = clientIsDead;

                                if (clientHealth < client.nHealth) {
                                    client.redHealthTimer = 1;
                                } else if (clientHealth > client.nHealth) {
                                    client.redHealthTimer = 0;
                                }

                                if (clientHealth < client.nHealth) {
                                    client.hurtT = 1;
                                }

                                client.maxHealth = clientMaxHealth;

                                client.nHealth = clientHealth;

                                client.ox = client.x;
                                client.oy = client.y;
                                client.oAngle = client.angle;
                                client.oHealth = client.health;
                                client.oSize = client.size;
                                client.updateT = 0;
                            } else {
                                players.set(clientId, new EntityPlayer(clientId, clientX, clientY, clientAngle, clientSize, clientHealth, clientMaxHealth, clientMood, clientNickname));
                            }
                        }

                        const mobCount = data.getUint16(offset);
                        offset += 2;

                        for (let i = 0; i < mobCount; i++) {
                            const mobId = data.getUint32(offset);
                            offset += 4;

                            const mobX = data.getFloat64(offset);
                            offset += 8;
                            const mobY = data.getFloat64(offset);
                            offset += 8;

                            const mobAngle = angleToRad(data.getFloat64(offset));
                            offset += 8;

                            const mobHealth = data.getInt32(offset);
                            offset += 4;

                            const mobMaxHealth = data.getInt32(offset);
                            offset += 4;

                            const mobSize = data.getUint32(offset);
                            offset += 4;

                            const mobType = data.getUint8(offset++);

                            const mobRarity = data.getUint8(offset++) as Rarities;

                            // Decode boolean flags
                            const bFlags = data.getUint8(offset++);
                            const mobIsPet = !!(bFlags & 1);
                            const mobIsFirstSegment = !!(bFlags & 2);

                            const mob = mobs.get(mobId);
                            if (mob) {
                                mob.nx = mobX;
                                mob.ny = mobY;
                                mob.nAngle = mobAngle;
                                mob.nSize = mobSize;

                                if (mob.health < mob.nHealth) {
                                    mob.redHealthTimer = 1;
                                } else if (mob.health > mob.nHealth) {
                                    mob.redHealthTimer = 0;
                                }

                                if (mobHealth < mob.nHealth) {
                                    mob.hurtT = 1;
                                }

                                mob.maxHealth = mobMaxHealth;

                                mob.nHealth = mobHealth;

                                mob.ox = mob.x;
                                mob.oy = mob.y;
                                mob.oAngle = mob.angle;
                                mob.oHealth = mob.health;
                                mob.oSize = mob.size;
                                mob.updateT = 0;
                            } else {
                                mobs.set(mobId, new EntityMob(mobId, mobX, mobY, mobAngle, mobSize, mobHealth, mobMaxHealth, mobType, mobRarity, mobIsPet, mobIsFirstSegment));
                            }
                        }

                        const eliminatedEntitiesCount = data.getUint16(offset);
                        offset += 2;

                        for (let i = 0; i < eliminatedEntitiesCount; i++) {
                            const entityId = data.getUint32(offset);
                            offset += 4;

                            if (mobs.has(entityId)) {
                                const mob = mobs.get(entityId);

                                mob.isDead = true;

                                continue;
                            }

                            if (players.has(entityId)) {
                                const player = players.get(entityId);

                                player.isRemoved = true;

                                player.isDead = true;

                                // Maybe client is already dead and got revived, deadT is maybe halfway
                                player.deadT = 0;
                                player.health = 0;

                                continue;
                            }
                        }
                    };

                    break;
                }
                case ClientBound.WAVE_ROOM_UPDATE: {
                    if (uiCtx.currentCtx instanceof UserInterfaceTitle) {
                        const waveClientCount = data.getUint8(offset++);

                        const _players: WaveRoomPlayerInformation[] = [];

                        for (let i = 0; i < waveClientCount; i++) {
                            const waveClientId = data.getUint32(offset);
                            offset += 4;

                            let waveClientName = readString();
                            // This operation should be server side?
                            if (waveClientName === "") {
                                waveClientName = "Unnamed";
                            }

                            const waveClientReadyState = data.getUint8(offset++) as WaveRoomPlayerReadyState;

                            _players.push({
                                id: waveClientId,
                                name: waveClientName,
                                readyState: waveClientReadyState,
                            });
                        }

                        const waveCode = readString();

                        const waveBiome = data.getUint8(offset++) as Biomes;

                        const waveState = data.getUint8(offset++) as WaveRoomState;

                        const waveVisible = data.getUint8(offset++) as WaveRoomVisibleState;

                        uiCtx.currentCtx.waveRoomPlayers = _players;
                        uiCtx.currentCtx.waveRoomCode = waveCode;
                        uiCtx.currentCtx.waveRoomState = waveState;
                        uiCtx.currentCtx.waveRoomVisible = waveVisible;

                        uiCtx.currentCtx.biome = waveBiome;
                    }

                    break;
                }
                case ClientBound.WAVE_STARTING: {
                    if (uiCtx.currentCtx instanceof UserInterfaceTitle) {
                        uiCtx.currentCtx.squadMenuContainer.setVisible(false, true);
                    }

                    uiCtx.switchUI("game");

                    const waveBiome = data.getUint8(offset++) as Biomes;

                    if (uiCtx.previousCtx) {
                        uiCtx.previousCtx.biome = waveBiome;
                    }
                    if (uiCtx.currentCtx) {
                        uiCtx.currentCtx.biome = waveBiome;
                    }

                    break;
                }
                case ClientBound.WAVE_ROOM_JOIN_FAILED: {
                    if (uiCtx.currentCtx instanceof UserInterfaceTitle) {
                        // Reset squad state to render status text
                        uiCtx.currentCtx.resetWaveState();

                        uiCtx.currentCtx.statusTextRef = StatusText.SquadNotFound;
                    }

                    break;
                }
                case ClientBound.WAVE_CHAT_RECV: {
                    if (uiCtx.currentCtx instanceof UserInterfaceGame) {
                        const waveClientId = data.getUint32(offset);
                        offset += 4;

                        const chatMsg = readString();

                        const player = players.get(waveClientId);

                        if (player) {
                            // TODO: implement
                        }
                    }

                    break;
                }
            }
        };
    }

    public sendChangeMove(angle: number, magnitude = 1) {
        const normalizedAngle = getNormalizedAngle(angle);
        const data = new Uint8Array([ServerBound.WAVE_CHANGE_MOVE, normalizedAngle, Math.round(magnitude * 255)]);
        this.ws.send(data);
    }

    public sendChangeMood(flag: number) {
        const data = new Uint8Array([ServerBound.WAVE_CHANGE_MOOD, flag]);
        this.ws.send(data);
    }

    public sendSwapPetal(index: number) {
        const data = new Uint8Array([ServerBound.WAVE_SWAP_PETAL, index]);
        this.ws.send(data);
    }

    public sendChat(chatMsg: string) {
        const data = new Uint8Array([ServerBound.WAVE_CHAT, chatMsg.length, ...this.textEncoder.encode(chatMsg)]);
        this.ws.send(data);
    }

    public sendLeave() {
        const data = new Uint8Array([ServerBound.WAVE_LEAVE]);
        this.ws.send(data);
    }

    // Wave rooms

    public sendRoomCreate(biome: Biomes) {
        const data = new Uint8Array([ServerBound.WAVE_ROOM_CREATE, biome]);
        this.ws.send(data);
    }

    public sendRoomJoin(code: string) {
        const data = new Uint8Array([ServerBound.WAVE_ROOM_JOIN, code.length, ...this.textEncoder.encode(code)]);
        this.ws.send(data);
    }

    public sendRoomFindPublic(biome: Biomes) {
        const data = new Uint8Array([ServerBound.WAVE_ROOM_FIND_PUBLIC, biome]);
        this.ws.send(data);
    }

    public sendRoomChangeReady(state: WaveRoomPlayerReadyState) {
        const data = new Uint8Array([ServerBound.WAVE_ROOM_CHANGE_READY, state]);
        this.ws.send(data);
    }

    public sendRoomChangeVisible(state: WaveRoomVisibleState) {
        const data = new Uint8Array([ServerBound.WAVE_ROOM_CHANGE_VISIBLE, state]);
        this.ws.send(data);
    }

    public sendRoomChangeName(name: string) {
        const data = new Uint8Array([ServerBound.WAVE_ROOM_CHANGE_NAME, name.length, ...this.textEncoder.encode(name)]);
        this.ws.send(data);
    }

    public sendRoomLeave() {
        const data = new Uint8Array([ServerBound.WAVE_ROOM_LEAVE]);
        this.ws.send(data);
    }
}