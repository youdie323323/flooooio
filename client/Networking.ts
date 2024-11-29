import { Mood, Biomes } from "../shared/enum";
import { ClientBound, ServerBound } from "../shared/packet";
import { Rarities } from "../shared/rarity";
import { WaveRoomPlayerReadyState, WaveRoomState, WaveRoomVisibleState } from "../shared/waveRoom";
import EntityMob from "./entity/EntityMob";
import EntityPlayer from "./entity/EntityPlayer";
import { players, mobs, uiCtx } from "./main";
import UserInterfaceGame from "./ui/mode/UserInterfaceModeGame";
import UserInterfaceTitle, { WaveRoomPlayerInformation } from "./ui/mode/UserInterfaceModeTitle";

export let wameSelfId = -1;
export let waveRoomSelfId = -1;

function angleToRad(angle: number) {
    return angle / 255 * (Math.PI * 2);
}

function getNormalizedAngle(angle: number): number {
    angle %= Math.PI * 2;
    if (angle < 0) {
        angle += Math.PI * 2;
    }
    return Math.round(angle / (Math.PI * 2) * 255);
}

export default class Networking {
    constructor(public ws: WebSocket) {
        const textDecoder = new TextDecoder("utf-8");

        ws.onmessage = (event) => {
            const readString = (): string => {
                const len = data.getUint8(offset++);
                const buffers = new Uint8Array(data.buffer, offset, len);
                const string = textDecoder.decode(buffers);
                offset += len;
                return string;
            }

            const data = new DataView(event.data);
            let offset = 0;

            const kind = data.getUint8(offset++);
            switch (kind) {
                case ClientBound.WAVE_SELF_ID: {
                    wameSelfId = data.getUint32(offset);

                    break;
                }
                case ClientBound.WAVE_ROOM_SELF_ID: {
                    waveRoomSelfId = data.getUint32(offset);

                    break;
                }
                case ClientBound.WAVE_UPDATE: {
                    if (uiCtx.currentUI instanceof UserInterfaceGame) {
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
                            const waveSize = data.getUint16(offset);
                            offset += 2;

                            uiCtx.currentUI.waveProgress = waveProgress;

                            uiCtx.currentUI.nWaveProgressTimer = waveProgressTimer;
                            uiCtx.currentUI.oWaveProgressTimer = uiCtx.currentUI.waveProgressTimer;

                            uiCtx.currentUI.nWaveProgressRedGageTimer = waveProgressRedGageTimer;
                            uiCtx.currentUI.oWaveProgressRedGageTimer = uiCtx.currentUI.waveProgressRedGageTimer;

                            uiCtx.currentUI.waveEnded = waveEnded;

                            uiCtx.currentUI.nWorldSize = waveSize;
                            uiCtx.currentUI.oWorldSize = uiCtx.currentUI.worldSize;

                            uiCtx.currentUI.updateT = 0;
                        }

                        let ids: Set<number> = new Set();

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

                            const clientMood = data.getUint8(offset++) as Mood;

                            const clientIsDead = !!data.getUint8(offset++);

                            const clientNickname = readString();

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

                            ids.add(clientId);
                        }

                        players.forEach((player, key) => {
                            if (
                                !ids.has(key) &&
                                // Dont repeat them
                                !player.isDeleted
                            ) {
                                player.isDeleted = true;

                                player.isDead = true;
                                player.deadT = 0;
                                player.health = 0;
                            }
                        });

                        ids.clear();

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

                            const mobIsPet = !!data.getUint8(offset++);

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

                                mob.nHealth = mobHealth;

                                mob.ox = mob.x;
                                mob.oy = mob.y;
                                mob.oAngle = mob.angle;
                                mob.oHealth = mob.health;
                                mob.oSize = mob.size;
                                mob.updateT = 0;
                            } else {
                                mobs.set(mobId, new EntityMob(mobId, mobX, mobY, mobAngle, mobSize, mobHealth, mobMaxHealth, mobType, mobRarity, mobIsPet));
                            }

                            ids.add(mobId);
                        }

                        mobs.forEach((mob, key) => {
                            if (!ids.has(key)) {
                                mob.isDead = true;
                            }
                        });

                        ids.clear();

                    };

                    break;
                }
                case ClientBound.WAVE_ROOM_UPDATE: {
                    if (uiCtx.currentUI instanceof UserInterfaceTitle) {
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

                        uiCtx.currentUI.waveRoomPlayers = _players;
                        uiCtx.currentUI.waveRoomCode = waveCode;
                        uiCtx.currentUI.waveRoomState = waveState;
                        uiCtx.currentUI.waveRoomVisible = waveVisible;

                        uiCtx.currentUI.biome = waveBiome;
                    }

                    break;
                }
                case ClientBound.WAVE_STARTING: {
                    if (uiCtx.currentUI instanceof UserInterfaceTitle) {
                        uiCtx.currentUI.squadMenuContainer.setVisible(false, true);
                    }

                    uiCtx.switchUI("game");

                    const waveBiome = data.getUint8(offset++) as Biomes;

                    if (uiCtx.previousUI) {
                        uiCtx.previousUI.biome = waveBiome;
                    }
                    if (uiCtx.currentUI) {
                        uiCtx.currentUI.biome = waveBiome;
                    }

                    break;
                }
                case ClientBound.WAVE_ROOM_JOIN_FAILED: {
                    alert("Failed to join");

                    break;
                }
                case ClientBound.WAVE_CHAT_RECV: {
                    if (uiCtx.currentUI instanceof UserInterfaceGame) {
                        uiCtx.currentUI.chats.push(readString());
                        if (uiCtx.currentUI.chats.length > UserInterfaceGame.MAX_MESSAGE_QUEUE_AMOUNT) {
                            uiCtx.currentUI.chats.shift();
                        }
                    }

                    break;
                }
            }
        };
    }

    public sendAngle(angle: number, magnitude = 1) {
        const normalizedAngle = getNormalizedAngle(angle);
        const data = new Uint8Array([ServerBound.WAVE_CHANGE_MOVE, normalizedAngle, Math.round(magnitude * 255)]);
        this.ws.send(data);
    }

    public sendMood(flag: Mood) {
        const data = new Uint8Array([ServerBound.WAVE_CHANGE_MOOD, flag]);
        this.ws.send(data);
    }

    public sendSwapPetal(index: number) {
        const data = new Uint8Array([ServerBound.WAVE_SWAP_PETAL, index]);
        this.ws.send(data);
    }
}