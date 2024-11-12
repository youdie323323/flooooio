import uWS from 'uWebSockets.js';
import { PacketKind } from '../shared/packet';
import { UserData } from './entity/EntityPool';
import { pack } from 'msgpackr';
import { MobType, PetalType } from '../shared/types';
import * as fs from 'fs';
import * as path from 'path';
import { MoodKind, MOON_KIND_VALUES } from '../shared/mood';
import WaveRoomManager from './wave/WaveRoomManager';
import { BIOME_VALUES, Biomes } from '../shared/biomes';
import { PlayerData } from './entity/player/Player';
import { PlayerReadyState, WaveRoomVisibleState } from './wave/WaveRoom';
import { Logger } from './logger/Logger';
import { Mob } from './entity/mob/Mob';
import { Rarities } from '../shared/rarities';
import { kickClient } from './entity/common/common';

/**
 * Temp player data.
 */
const DEFAULT_PLAYER_DATA: Omit<PlayerData, "ws"> = {
    name: 'hare',
    slots: {
        surface: Array.from({ length: 8 }, () => {
            return {
                type: PetalType.BEETLE_EGG,
                rarity: Rarities.ULTRA,
            };
        }),
        bottom: [
            null,
        ]
    },
};

const PORT = 8080;
const MIME_TYPES = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    ".json": "application/json",
    '.css': 'text/css',
    '.png': 'image/png',
    '.ico': 'image/x-icon'
};

// Define wave room manager
const waveRoomManager = new WaveRoomManager();

/**
 * Global logger instance.
 */
export const logger = new Logger();

logger.info("App started");

function handleMessage(ws: uWS.WebSocket<UserData>, message: ArrayBuffer, isBinary: boolean) {
    const buffer = new Uint8Array(message);
    if (buffer.length < 1 || !isBinary) return;

    const userData = ws.getUserData();
    if (!userData) return;

    const { waveRoomClientId, waveClientId } = userData;

    switch (buffer[0]) {
        case PacketKind.MOVE: {
            if (buffer.length !== 3) return;

            const waveRoom = waveRoomManager.findPlayerRoom(waveRoomClientId);
            if (!waveRoom) return;

            waveRoom.entityPool.updateMovement(waveClientId, buffer[1], buffer[2]);

            break;
        }
        case PacketKind.MOOD: {
            if (buffer.length !== 2) return;

            const waveRoom = waveRoomManager.findPlayerRoom(waveRoomClientId);
            if (!waveRoom) return;

            waveRoom.entityPool.updateMood(waveClientId, buffer[1]);

            break;
        }
        case PacketKind.SWAP_PETAL: {
            if (buffer.length !== 2) return;

            const waveRoom = waveRoomManager.findPlayerRoom(waveRoomClientId);
            if (!waveRoom) return;

            waveRoom.entityPool.swapPetal(waveClientId, buffer[1]);

            break;
        }
        // Wave
        case PacketKind.WAVE_ROOM_CREATE:
            if (buffer.length !== 2 || !BIOME_VALUES.includes(buffer[1])) return;

            const userData = ws.getUserData();

            if (userData.waveRoomClientId) {
                waveRoomManager.leaveWaveRoom(userData.waveRoomClientId);
            }

            const id = waveRoomManager.createWaveRoom({ ...DEFAULT_PLAYER_DATA, ws }, buffer[1]);
            if (!id) return;

            ws.getUserData().waveRoomClientId = id;

            break;
        case PacketKind.WAVE_ROOM_JOIN: {
            if (buffer.length < 2) return;

            const length = buffer[1];
            if (buffer.length !== 2 + length) return;

            const roomCode = new TextDecoder('utf-8').decode(buffer.slice(2, 2 + length));

            const userData = ws.getUserData();

            // Remove player from wave room if player were in other wave room
            if (userData.waveRoomClientId) {
                waveRoomManager.leaveWaveRoom(userData.waveRoomClientId);
                userData.waveRoomClientId = null;
            }

            const id = waveRoomManager.joinWaveRoom({ ...DEFAULT_PLAYER_DATA, ws }, roomCode);

            const response = Buffer.alloc(id ? 5 : 1);
            response.writeUInt8(id ? PacketKind.WAVE_ROOM_SELF_ID : PacketKind.WAVE_ROOM_JOIN_FAILED, 0);

            if (id) {
                response.writeUInt32BE(id, 1);
                userData.waveRoomClientId = id;
            };

            ws.send(response, true);

            break;
        }
        case PacketKind.WAVE_ROOM_CHANGE_READY: {
            if (buffer.length !== 2) return;

            const waveRoom = waveRoomManager.findPlayerRoom(waveRoomClientId);
            if (!waveRoom) return;

            waveRoom.setPlayerReadyState(waveRoomClientId, buffer[1] ? PlayerReadyState.READY : PlayerReadyState.UNREADY);

            break;
        }
        case PacketKind.WAVE_ROOM_CHANGE_VISIBLE: {
            if (buffer.length !== 2) return;

            const waveRoom = waveRoomManager.findPlayerRoom(waveRoomClientId);
            if (!waveRoom) return;

            waveRoom.setPublicState(waveRoomClientId, buffer[1] ? WaveRoomVisibleState.PUBLIC : WaveRoomVisibleState.PRIVATE);

            break;
        }
        case PacketKind.WAVE_ROOM_LEAVE: {
            waveRoomManager.leaveWaveRoom(waveRoomClientId);
            break;
        }
    }
}

uWS.App()
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
        compression: uWS.SHARED_COMPRESSOR,
        maxPayloadLength: 16 * 1024 * 1024,
        sendPingsAutomatically: false,
        idleTimeout: 0,
        open: (ws: uWS.WebSocket<UserData>) => logger.region(() => {
            using _guard = logger.metadata({
                ipAddress: Buffer.from(ws.getRemoteAddressAsText()).toString(),
            });
            logger.info("Client connected");

            // Safely set them null
            ws.getUserData().waveRoomClientId = null;
            ws.getUserData().waveClientId = null;

            // Lag simulator
            // const originalSend = ws.send;
            // ws.send = function (...args) {
            //     setTimeout(() => {
            //         originalSend.apply(ws, args);
            //     }, 200);
            // };
        }),
        // I dont log errors here because all errors are well-known (ws.send fail)
        // its maybe impact performance
        message: (ws: uWS.WebSocket<UserData>, message: ArrayBuffer, isBinary: boolean) => {
            handleMessage(ws, message, isBinary);
        },
        close: (ws: uWS.WebSocket<UserData>, code, message) => logger.region(() => {
            const { waveRoomClientId, waveClientId } = ws.getUserData();
            const waveRoom = waveRoomManager.findPlayerRoom(waveRoomClientId);

            if (waveRoom) {
                // Leave current wave room | wave
                waveRoomManager.leaveWaveRoom(waveRoomClientId);

                const waveClient = waveRoom.entityPool.getClient(waveClientId);
                if (waveClient) {
                    kickClient(waveRoom, waveClient);
                };
            }

            using _guard = logger.metadata({
                reason: Buffer.from(message).toString(),
                waveRoomClientId,
                waveClientId,
            });
            logger.info(`Client disconnected`);
        })
    })
    .listen(PORT, (token) => {
        if (token) {
            logger.info(`Server running on port ${PORT}`);
        } else {
            logger.error(`Failed to listen on port ${PORT}`);
        }
    });