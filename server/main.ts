import uWS, { App, SHARED_COMPRESSOR } from 'uWebSockets.js';
import { UserData } from './wave/WavePool';
import { pack } from 'msgpackr';
import * as fs from 'fs';
import * as path from 'path';
import WaveRoomService from './wave/WaveRoomService';
import { PlayerReadyState, WaveRoomVisibleState } from './wave/WaveRoom';
import { Logger } from './logger/Logger';
import { Mob } from './entity/mob/Mob';
import { kickClient } from './utils/common';
import { MockPlayerData } from './entity/player/Player';
import { choice, randomEnum, shuffle } from './utils/random';
import { MockPetalData } from './entity/mob/petal/Petal';
import { PetalType, Rarities, Packet, Mood, BIOME_VALUES } from '../shared/enum';

/**
 * Temp player data.
 */
const DEFAULT_PLAYER_DATA: Omit<MockPlayerData, "ws"> = {
    name: 'YOBA',
    slots: {
        surface: [
            {
                type: PetalType.BEETLE_EGG,
                rarity: Rarities.SUPER,
            } as MockPetalData,
            {
                type: PetalType.BEETLE_EGG,
                rarity: Rarities.SUPER,
            } as MockPetalData,
            {
                type: PetalType.BEETLE_EGG,
                rarity: Rarities.SUPER,
            } as MockPetalData,
        ],
        bottom: [],
    },
};

const PORT = 8080;
const app = App();

export const waveRoomService = new WaveRoomService();

/**
 * Global logger instance.
 */
export const logger = new Logger();

logger.info("App started");

/**
 * Global instance for decoding string of buffer.
 */
const textDecoder = new TextDecoder('utf-8');

function handleMessage(ws: uWS.WebSocket<UserData>, message: ArrayBuffer, isBinary: boolean) {
    const buffer = new Uint8Array(message);
    if (buffer.length < 1 || !isBinary) return;

    const userData = ws.getUserData();
    if (!userData) return;

    const { waveRoomClientId, waveClientId } = userData;

    // Hmm, maybe should i kick client if their packet is incorrect?

    switch (buffer[0]) {
        case Packet.MOVE: {
            if (buffer.length !== 3) return;

            const waveRoom = waveRoomService.findPlayerRoom(waveRoomClientId);
            if (!waveRoom) return;

            const client = waveRoom.wavePool.getClient(waveClientId);
            if (!client) return;

            if (!waveRoom.wavePool.updateMovement(waveClientId, buffer[1], buffer[2])) {
                logger.region(() => {
                    using _guard = logger.metadata({
                        waveClientId,
                        angle: buffer[1],
                        magnitude: buffer[2],
                    });

                    logger.warn("Invalid magnitude/angle received from client, kicking");
                });

                kickClient(waveRoom, client);
            };

            break;
        }
        case Packet.MOOD: {
            if (buffer.length !== 2) return;

            const waveRoom = waveRoomService.findPlayerRoom(waveRoomClientId);
            if (!waveRoom) return;

            const client = waveRoom.wavePool.getClient(waveClientId);
            if (!client) return;

            if (!waveRoom.wavePool.changeMood(waveClientId, buffer[1])) {
                logger.region(() => {
                    using _guard = logger.metadata({
                        waveClientId,
                        kind: Mood[buffer[1]],
                    });

                    logger.warn("Invalid mood kind received from client, kicking");
                });

                kickClient(waveRoom, client);
            };

            break;
        }
        case Packet.SWAP_PETAL: {
            if (buffer.length !== 2) return;

            const waveRoom = waveRoomService.findPlayerRoom(waveRoomClientId);
            if (!waveRoom) return;

            waveRoom.wavePool.swapPetal(waveClientId, buffer[1]);

            break;
        }
        case Packet.CHAT: {
            if (buffer.length < 2) return;

            const waveRoom = waveRoomService.findPlayerRoom(waveRoomClientId);
            if (!waveRoom) return;

            const length = buffer[1];
            if (buffer.length !== 2 + length) return;

            const chat = textDecoder.decode(buffer.slice(2, 2 + length));

            waveRoom.enqueueMessage(chat);

            break;
        }
        // Wave
        case Packet.WAVE_ROOM_CREATE: {
            if (buffer.length !== 2 || !BIOME_VALUES.includes(buffer[1])) return;

            const id = waveRoomService.createWaveRoom(userData, buffer[1]);
            if (!id) return;

            userData.waveRoomClientId = id;

            break;
        }
        case Packet.WAVE_ROOM_JOIN: {
            if (buffer.length < 2) return;

            const length = buffer[1];
            if (buffer.length !== 2 + length) return;

            const roomCode = textDecoder.decode(buffer.slice(2, 2 + length));

            const id = waveRoomService.joinWaveRoom(userData, roomCode);

            const response = Buffer.alloc(id ? 5 : 1);
            response.writeUInt8(id ? Packet.WAVE_ROOM_SELF_ID : Packet.WAVE_ROOM_JOIN_FAILED, 0);

            if (id) {
                response.writeUInt32BE(id, 1);

                userData.waveRoomClientId = id;
            };

            ws.send(response, true);

            break;
        }
        case Packet.WAVE_ROOM_JOIN_PUBLIC: {
            if (buffer.length !== 2 || !BIOME_VALUES.includes(buffer[1])) return;

            const id = waveRoomService.joinPublicWaveRoom(userData, buffer[1]);
            if (!id) return;

            userData.waveRoomClientId = id;

            break;
        }
        case Packet.WAVE_ROOM_CHANGE_READY: {
            if (buffer.length !== 2) return;

            const waveRoom = waveRoomService.findPlayerRoom(waveRoomClientId);
            if (!waveRoom) return;

            waveRoom.setPlayerReadyState(waveRoomClientId, buffer[1] ? PlayerReadyState.READY : PlayerReadyState.UNREADY);

            break;
        }
        case Packet.WAVE_ROOM_CHANGE_VISIBLE: {
            if (buffer.length !== 2) return;

            const waveRoom = waveRoomService.findPlayerRoom(waveRoomClientId);
            if (!waveRoom) return;

            waveRoom.setPublicState(waveRoomClientId, buffer[1] ? WaveRoomVisibleState.PUBLIC : WaveRoomVisibleState.PRIVATE);

            break;
        }
        case Packet.WAVE_ROOM_LEAVE: {
            waveRoomService.leaveWaveRoom(waveRoomClientId);

            break;
        }
        case Packet.WAVE_ROOM_GAME_LEAVE: {
            const waveRoom = waveRoomService.findPlayerRoom(waveRoomClientId);
            if (!waveRoom) return;

            const client = waveRoom.wavePool.getClient(waveClientId);
            if (!client) return;

            kickClient(waveRoom, client);

            break;
        }
    }
}

const MIME_TYPES = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    ".json": "application/json",
    '.css': 'text/css',
    '.png': 'image/png',
    '.ico': 'image/x-icon'
};

app
    .get('/*', (res, req) => logger.region(() => {
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

            // TODO: only log html request
            // using _guard = logger.metadata({
            //     ipAddress: Buffer.from(res.getRemoteAddressAsText()).toString(),
            //     mimeType: contentType,
            // });
            // logger.info(`Request from client`);

            res.cork(() => {
                res.writeHeader('Content-Type', contentType).end(data);
            });
        });
    }))
    .ws('/*', {
        compression: SHARED_COMPRESSOR,
        maxPayloadLength: 16 * 1024 * 1024,
        sendPingsAutomatically: false,
        idleTimeout: 0,
        open: (ws: uWS.WebSocket<UserData>) => logger.region(() => {
            using _guard = logger.metadata({
                ipAddress: Buffer.from(ws.getRemoteAddressAsText()).toString(),
            });
            logger.info("Client connected");

            // Safely set them null
            const userData = ws.getUserData();
            userData.waveRoomClientId = null;
            userData.waveClientId = null;
            userData.wavePlayerData = { ...DEFAULT_PLAYER_DATA, ws };

            // Lag simulator
            // const originalSend = ws.send;
            // ws.send = function (...args) {
            //     setTimeout(() => {
            //         originalSend.apply(ws, args);
            //     }, 300);
            // };
        }),
        // I dont log errors here because all errors are well-known (ws.send fail)
        // its maybe impact performance
        message: (ws: uWS.WebSocket<UserData>, message: ArrayBuffer, isBinary: boolean) => {
            handleMessage(ws, message, isBinary);
        },
        close: (ws: uWS.WebSocket<UserData>, code, message) => logger.region(() => {
            const { waveRoomClientId, waveClientId } = ws.getUserData();

            using _guard = logger.metadata({
                reason: Buffer.from(message).toString() || "UNKNOWN",
                waveRoomClientId,
                waveClientId,
            });
            logger.info(`Client disconnected`);

            const waveRoom = waveRoomService.findPlayerRoom(waveRoomClientId);

            if (waveRoom) {
                // Leave current wave room | wave
                waveRoomService.leaveWaveRoom(waveRoomClientId);

                const waveClient = waveRoom.wavePool.getClient(waveClientId);
                if (waveClient) {
                    kickClient(waveRoom, waveClient);
                };
            }
        })
    })
    .listen(PORT, (token) => {
        if (token) {
            logger.info(`Server running on port ${PORT}`);
        } else {
            logger.error(`Failed to listen on port ${PORT}`);
        }
    });

// TODO: fix this ass...
// process.on('SIGINT', () => {
//     logger.warn("Gracefully shutdown");
//
//     const serverClosedBuffer = Buffer.from([PacketKind.SERVER_CLOSED]);
//     waveRoomManager.getAllWebsockets().forEach(ws => {
//         ws.send(serverClosedBuffer, true);
//         ws.close();
//     });
//
//     app.close();
// });