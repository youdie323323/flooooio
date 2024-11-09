import uWS from 'uWebSockets.js';
import { PacketKind } from '../shared/packet';
import { UserData } from './entity/EntityPool';
import { pack } from 'msgpackr';
import { MobType, PetalType } from '../shared/types';
import * as fs from 'fs';
import * as path from 'path';
import { choice, getRandomSafePosition, annihilateClient, randomEnum } from './entity/utils/common';
import { Rarities } from '../shared/rarities';
import { mapCenterX, mapCenterY, mapRadius, safetyDistance } from './entity/EntityChecksum';
import { MOON_KIND_VALUES } from '../shared/mood';
import WaveRoomManager from './wave/WaveRoomManager';
import { BIOME_VALUES, Biomes } from '../shared/biomes';
import { PlayerData } from './entity/player/Player';
import { PlayerReadyState } from './wave/WaveRoom';

const DEFAULT_PLAYER_DATA: Omit<PlayerData, "ws"> = {
    name: 'hare',
    slots: {
        surface: [
            {
                type: PetalType.BASIC,
                rarity: Rarities.MYTHIC,
            },
        ],
        bottom: [
            null,
        ]
    },
};

const PORT = 8080;
const MIME_TYPES = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.png': 'image/png',
    '.ico': 'image/x-icon'
};

export const waveRoomManager = new WaveRoomManager();

uWS.App()
    .get('/*', (res, req) => {
        const url = req.getUrl();
        const filePath = path.join(__dirname, 'public', url === '/' ? 'index.html' : url);
        const ext = path.extname(filePath);

        res.onAborted(() => { });

        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.cork(() => {
                    res.writeStatus('404 Not Found').end('File Not Found');
                });
                return;
            }

            const contentType = MIME_TYPES[ext] || 'application/octet-stream';

            res.cork(() => {
                res.writeHeader('Content-Type', contentType).end(data);
            });
        });
    })
    .ws('/*', {
        compression: uWS.SHARED_COMPRESSOR,
        maxPayloadLength: 16 * 1024 * 1024,
        sendPingsAutomatically: false,
        idleTimeout: 0,
        open: (ws: uWS.WebSocket<UserData>) => {
            // Lag emulation:
            // const originalSend = ws.send;

            // ws.send = function (...args) {
            //     setTimeout(() => {
            //         originalSend.apply(ws, args);
            //     }, 100);
            // };
        },
        message: (ws: uWS.WebSocket<UserData>, message: ArrayBuffer, isBinary) => {
            const buffer = new Uint8Array(message);
            if (buffer.length < 1 || !isBinary) return;

            switch (buffer[0]) {
                case PacketKind.MOVE: {
                    if (buffer.length < 3) return;

                    const userData = ws.getUserData();
                    if (!userData) {
                        return;
                    }

                    const { waveRoomClientId, waveClientId } = userData;

                    const waveRoom = waveRoomManager.findPlayerRoom(waveRoomClientId);
                    if (!waveRoom) {
                        return;
                    }

                    waveRoom.entityPool.updatePositionProp(waveClientId, buffer[1], buffer[2]);

                    break;
                }
                case PacketKind.MOOD: {
                    if (buffer.length < 2) return;

                    if (!MOON_KIND_VALUES.includes(buffer[1])) {
                        break;
                    }

                    const userData = ws.getUserData();
                    if (!userData) {
                        return;
                    }

                    const { waveRoomClientId, waveClientId } = userData;

                    const waveRoom = waveRoomManager.findPlayerRoom(waveRoomClientId);
                    if (!waveRoom) {
                        return;
                    }

                    waveRoom.entityPool.updateMood(waveClientId, buffer[1]);

                    break;
                }
                case PacketKind.SWAP_PETAL: {
                    if (buffer.length < 2) return;

                    const userData = ws.getUserData();
                    if (!userData) {
                        return;
                    }

                    const { waveRoomClientId, waveClientId } = userData;

                    const waveRoom = waveRoomManager.findPlayerRoom(waveRoomClientId);
                    if (!waveRoom) {
                        return;
                    }

                    waveRoom.entityPool.swapPetal(waveClientId, buffer[1]);

                    break;
                }
                case PacketKind.CREATE_WAVE_ROOM: {
                    if (buffer.length < 2) return;

                    if (!BIOME_VALUES.includes(buffer[1])) {
                        break;
                    }

                    const id = waveRoomManager.createWaveRoom({
                        ...DEFAULT_PLAYER_DATA,
                        ws: ws
                    }, buffer[1] as Biomes);
                    if (!id) {
                        return;
                    }

                    ws.getUserData().waveRoomClientId = id;

                    break;
                }
                case PacketKind.JOIN_WAVE_ROOM: {
                    if (buffer.length < 2) return;

                    const length = buffer[1];
                    if (buffer.length < 2 + length) return;

                    const roomCode = new TextDecoder("utf-8").decode(buffer.slice(2, 2 + length));

                    const idOrNullish = waveRoomManager.joinPrivateWaveRoom({
                        ...DEFAULT_PLAYER_DATA,
                        ws: ws
                    }, roomCode);

                    const buffer2 = Buffer.alloc(idOrNullish == false ? 1 : (1 + 4));
                    let offset = 0;

                    if (idOrNullish == false) {
                        buffer2.writeUInt8(PacketKind.WAVE_CODE_INVALID, offset++);
                    } else {
                        buffer2.writeUInt8(PacketKind.WAVE_SELF_ID, offset++);
                        buffer2.writeUInt32BE(idOrNullish, offset);
                        offset += 4;
                    }

                    ws.send(buffer2, true)

                    break;
                }
                case PacketKind.WAVE_ROOM_READY: {
                    if (buffer.length < 2) return;

                    const userData = ws.getUserData();
                    if (!userData) {
                        return;
                    }

                    const { waveRoomClientId } = userData;

                    const waveRoom = waveRoomManager.findPlayerRoom(waveRoomClientId);
                    if (!waveRoom) {
                        return;
                    }

                    waveRoom.setPlayerReadyState(waveRoomClientId, !!buffer[1] ? PlayerReadyState.READY : PlayerReadyState.UNREADY);

                    break;
                }
            }
        },
        close: (ws: uWS.WebSocket<UserData>, code, message) => {
            const { waveRoomClientId, waveClientId } = ws.getUserData();

            const waveRoom = waveRoomManager.findPlayerRoom(waveRoomClientId);
            if (!waveRoom) {
                return;
            }

            const waveClient = waveRoom.entityPool.getClient(waveClientId);
            if (!waveClient) {
                return;
            }

            annihilateClient(waveRoom.entityPool, waveClient, true);
        },
    })
    .listen(PORT, async (token) => {
        if (token) {
            console.log(`Running on port ${PORT}`);

            // setTimeout(() => {
            //     setInterval(() => {
            //         const randPos = getRandomSafePosition(mapCenterX, mapCenterY, mapRadius, safetyDistance, entityPool);
            //         if (!randPos) {
            //             return;
            //         }
            //         if (Math.random() > 0.01) {
            //             entityPool.addPetalOrMob(MobType.BUBBLE, Rarities.MYTHIC, randPos.x, randPos.y);
            //         } else {
            //             entityPool.addPetalOrMob(choice([MobType.BEE, MobType.BEETLE, MobType.JELLYFISH, MobType.STARFISH]), Rarities.MYTHIC, randPos.x, randPos.y);
            //         }
            //     }, 5);
            // }, 20000)
        } else {
            console.error(`Failed to listen on port ${PORT}`);
        }
    });