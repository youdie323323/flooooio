import { Biomes } from "../shared/biomes";
import { MoodKind } from "../shared/mood";
import { PacketKind } from "../shared/packet";
import { Rarities } from "../shared/rarities";
import { TWO_PI } from "./constants";
import EntityMob from "./entity/EntityMob";
import EntityPlayer from "./entity/EntityPlayer";
import { players, mobs, uiManager } from "./main";
import UserInterfaceGame from "./ui/UserInterfaceGame";

export let selfId = -1;
export let waveSelfId = -1;

function angleToRad(angle: number) {
    return angle / 255 * TWO_PI;
}

function getNormalizedAngle(angle: number): number {
    angle %= TWO_PI;
    if (angle < 0) {
        angle += TWO_PI;
    }
    return Math.round(angle / TWO_PI * 255);
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
                case PacketKind.SELF_ID: {
                    selfId = data.getUint32(offset);
                    break;
                }
                case PacketKind.WAVE_ROOM_SELF_ID: {
                    waveSelfId = data.getUint32(offset);
                    break;
                }
                case PacketKind.UPDATE: {
                    // Wave informations
                    {
                        /*
                                                    client.nx = clientX;
                            client.ny = clientY;
                            client.nAngle = clientAngle;
                            client.nSize = clientSize;
                            client.mood = clientMood;
                            client.isDead = clientIsDead;

                            if (clientHp < client.nHealth) {
                                client.redHealthTimer = 1;
                            } else if (clientHp > client.nHealth) {
                                client.redHealthTimer = 0;
                            }

                            if (clientHp < client.nHealth) {
                                client.hurtT = 1;
                            }

                            client.nHealth = clientHp;

                            client.ox = client.x;
                            client.oy = client.y;
                            client.oAngle = client.angle;
                            client.oHealth = client.health;
                            client.oSize = client.size;
                            client.updateT = 0;
                         */
                        const waveProgress = data.getUint16(offset);
                        offset += 2;

                        const waveProgressTimer = data.getFloat64(offset);
                        offset += 8;

                        const waveProgressRedGageTimer = data.getFloat64(offset);
                        offset += 8;
                        
                        if (uiManager.currentUI instanceof UserInterfaceGame) {
                            uiManager.currentUI.waveProgress = waveProgress;

                            uiManager.currentUI.nWaveProgressTimer = waveProgressTimer;
                            uiManager.currentUI.oWaveProgressTimer = uiManager.currentUI.waveProgressTimer;

                            uiManager.currentUI.nWaveProgressRedGageTimer = waveProgressRedGageTimer;
                            uiManager.currentUI.oWaveProgressRedGageTimer = uiManager.currentUI.waveProgressRedGageTimer;

                            uiManager.currentUI.updateT = 0;
                        }
                    };

                    const clientCount = data.getUint16(offset);
                    offset += 2;

                    let clientIds: Set<number> = new Set();

                    for (let i = 0; i < clientCount; i++) {
                        const clientId = data.getUint32(offset);
                        offset += 4;

                        clientIds.add(clientId);

                        const clientX = data.getFloat64(offset);
                        offset += 8;
                        const clientY = data.getFloat64(offset);
                        offset += 8;

                        const clientHp = data.getInt32(offset);
                        offset += 4;

                        const clientSize = data.getUint32(offset);
                        offset += 4;

                        const clientAngle = angleToRad(data.getUint8(offset++));

                        const clientMood = data.getUint8(offset++) as MoodKind;

                        const clientIsDead = !!data.getUint8(offset++);

                        const clientNickname = readString();

                        const clientMaxHealth = data.getInt32(offset);
                        offset += 4;

                        const client = players.get(clientId);
                        if (client) {
                            client.nx = clientX;
                            client.ny = clientY;
                            client.nAngle = clientAngle;
                            client.nSize = clientSize;
                            client.mood = clientMood;
                            client.isDead = clientIsDead;

                            if (clientHp < client.nHealth) {
                                client.redHealthTimer = 1;
                            } else if (clientHp > client.nHealth) {
                                client.redHealthTimer = 0;
                            }

                            if (clientHp < client.nHealth) {
                                client.hurtT = 1;
                            }

                            client.nHealth = clientHp;

                            client.ox = client.x;
                            client.oy = client.y;
                            client.oAngle = client.angle;
                            client.oHealth = client.health;
                            client.oSize = client.size;
                            client.updateT = 0;
                        } else {
                            players.set(clientId, new EntityPlayer(clientId, clientX, clientY, clientSize, clientHp, clientMaxHealth, clientAngle, clientMood, clientNickname));
                        }
                    }

                    players.forEach((client, key) => {
                        if (!clientIds.has(key)) {
                            players.delete(key);
                        }
                    });

                    const mobCount = data.getUint16(offset);
                    offset += 2;

                    let mobIds: Set<number> = new Set();

                    for (let i = 0; i < mobCount; i++) {
                        const mobId = data.getUint32(offset);
                        offset += 4;

                        mobIds.add(mobId);

                        const mobX = data.getFloat64(offset);
                        offset += 8;
                        const mobY = data.getFloat64(offset);
                        offset += 8;

                        const mobHp = data.getInt32(offset);
                        offset += 4;

                        const mobSize = data.getUint32(offset);
                        offset += 4;

                        const mobAngle = angleToRad(data.getFloat64(offset));
                        offset += 8;

                        const mobType = data.getUint8(offset++);

                        const mobRarity = data.getUint8(offset++) as Rarities;

                        const mobMaxHealth = data.getInt32(offset);
                        offset += 4;

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

                            if (mobHp < mob.nHealth) {
                                mob.hurtT = 1;
                            }

                            mob.nHealth = mobHp;

                            mob.ox = mob.x;
                            mob.oy = mob.y;
                            mob.oAngle = mob.angle;
                            mob.oHealth = mob.health;
                            mob.oSize = mob.size;
                            mob.updateT = 0;
                        } else {
                            mobs.set(mobId, new EntityMob(mobId, mobType, mobRarity, mobX, mobY, mobSize, mobHp, mobMaxHealth, mobAngle, mobIsPet));
                        }
                    }

                    mobs.forEach((mob, key) => {
                        if (!mobIds.has(key)) {
                            mob.isDead = true;
                        }
                    });

                    break;
                }
                case PacketKind.WAVE_ROOM_UPDATE: {
                    const waveClientCount = data.getUint8(offset++);

                    const clients = [];

                    for (let i = 0; i < waveClientCount; i++) {
                        const waveClientId = data.getUint32(offset);
                        offset += 4;

                        const waveClientIsOwner = data.getUint8(offset++) === 1;

                        const waveClientName = readString();

                        clients.push({
                            id: waveClientId,
                            isOwner: waveClientIsOwner,
                            name: waveClientName,
                        });
                    }

                    console.table(clients);

                    const waveCode = readString();

                    const waveBiome = data.getUint8(offset++) as Biomes;

                    const waveState = data.getUint8(offset++);

                    const waveIsPublic = !!data.getUint8(offset++);

                    console.log(waveCode, waveBiome, waveState, waveIsPublic);

                    uiManager.currentUI.biome = waveBiome;

                    break;
                }
                case PacketKind.WAVE_ROOM_STARTING: {
                    uiManager.switchUI("game");

                    const waveBiome = data.getUint8(offset++) as Biomes;

                    uiManager.currentUI.biome = waveBiome;

                    break;
                }
                case PacketKind.WAVE_ROOM_JOIN_FAILED: {
                    alert("Code invalid!");

                    break;
                }
                case PacketKind.SERVER_CLOSED: {
                    document.body.innerHTML = "<h1>Server closed. Try again after some minutes.</h1>";

                    break;
                }
            }
        };
    }

    sendAngle(angle: number, magnitude = 1) {
        const normalizedAngle = getNormalizedAngle(angle);
        const data = new Uint8Array([PacketKind.MOVE, normalizedAngle, Math.round(magnitude * 255)]);
        this.ws.send(data);
    }

    sendMood(flag: MoodKind) {
        const data = new Uint8Array([PacketKind.MOOD, flag]);
        this.ws.send(data);
    }

    sendSwapPetal(index: number) {
        const data = new Uint8Array([PacketKind.SWAP_PETAL, index]);
        this.ws.send(data);
    }
}