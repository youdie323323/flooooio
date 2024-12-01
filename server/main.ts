import uWS, { App, SHARED_COMPRESSOR } from 'uWebSockets.js';
import { UserData } from './wave/WavePool';
import { pack } from 'msgpackr';
import * as fs from 'fs';
import * as path from 'path';
import WaveRoomService from './wave/WaveRoomService';
import { Logger } from './logger/Logger';
import { Mob } from './entity/mob/Mob';
import { clientRemove, kickClient, processJoin } from './utils/common';
import { MockPlayerData } from './entity/player/Player';
import { choice, randomEnum, shuffle } from './utils/random';
import { MockPetalData } from './entity/mob/petal/Petal';
import { PetalType, Mood, BIOME_VALUES, MOOD_VALUES } from '../shared/enum';
import root from './command/commandRoot';
import { registerSpawnMobBulk } from './command/subcommands/spawnMobBulk';
import { registerSpawnMob } from './command/subcommands/spawnMob';
import { registerSpawn } from './command/commands/spawn';
import { Rarities } from '../shared/rarity';
import { ClientBound, ClientboundConnectionKickReason, ServerBound } from '../shared/packet';
import { PLAYER_STATE_VALUES, VISIBLE_STATE_VALUES, WaveRoomPlayerReadyState, WaveRoomVisibleState } from '../shared/waveRoom';

/**
 * Temp player data.
 */
const DEFAULT_PLAYER_DATA: Omit<MockPlayerData, "ws"> = {
    name: 'YOBA',
    slots: {
        surface: [
            {
                type: PetalType.BASIC,
                rarity: Rarities.SUPER,
            } as MockPetalData,
            {
                type: PetalType.BASIC,
                rarity: Rarities.SUPER,
            } as MockPetalData,
            {
                type: PetalType.BASIC,
                rarity: Rarities.SUPER,
            } as MockPetalData,
            {
                type: PetalType.BASIC,
                rarity: Rarities.SUPER,
            } as MockPetalData,
            {
                type: PetalType.BASIC,
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

const packetHistory: string[] = [];

function handleMessage(ws: uWS.WebSocket<UserData>, message: ArrayBuffer, isBinary: boolean) {
    const buffer = new Uint8Array(message);
    if (buffer.length < 1 || !isBinary) return;

    const userData = ws.getUserData();
    if (!userData) return;

    const { waveRoomClientId, waveClientId } = userData;

    const packetType = buffer[0];
    packetHistory.push(ServerBound[packetType]);
    if (packetHistory.length > 10) {
        packetHistory.shift();
    }

    // Hmm, maybe should i kick client if their packet is incorrect?

    switch (packetType) {
        case ServerBound.WAVE_CHANGE_MOVE: {
            if (buffer.length !== 3) return;

            const waveRoom = waveRoomService.findPlayerRoom(waveRoomClientId);
            if (!waveRoom) return;

            const client = waveRoom.wavePool.getClient(waveClientId);
            if (!client) return;

            waveRoom.wavePool.updateMovement(waveClientId, buffer[1], buffer[2]);

            break;
        }
        case ServerBound.WAVE_CHANGE_MOOD: {
            if (buffer.length !== 2 || !MOOD_VALUES.includes(buffer[1])) return;

            const waveRoom = waveRoomService.findPlayerRoom(waveRoomClientId);
            if (!waveRoom) return;

            const client = waveRoom.wavePool.getClient(waveClientId);
            if (!client) return;

            waveRoom.wavePool.changeMood(waveClientId, buffer[1])

            break;
        }
        case ServerBound.WAVE_SWAP_PETAL: {
            if (buffer.length !== 2) return;

            const waveRoom = waveRoomService.findPlayerRoom(waveRoomClientId);
            if (!waveRoom) return;

            waveRoom.wavePool.swapPetal(waveClientId, buffer[1]);

            break;
        }
        case ServerBound.WAVE_CHAT_SENT: {
            if (buffer.length < 2) return;

            const waveRoom = waveRoomService.findPlayerRoom(waveRoomClientId);
            if (!waveRoom) return;

            const length = buffer[1];
            if (buffer.length !== 2 + length) return;

            const chat = textDecoder.decode(buffer.slice(2, 2 + length));

            waveRoom.processChatMessage(userData, chat);

            break;
        }
        // Wave
        case ServerBound.WAVE_ROOM_CREATE: {
            if (buffer.length !== 2 || !BIOME_VALUES.includes(buffer[1])) return;

            const id = waveRoomService.createWaveRoom(userData, buffer[1]);

            processJoin(ws, id);

            break;
        }
        case ServerBound.WAVE_ROOM_JOIN: {
            if (buffer.length < 2) return;

            const length = buffer[1];
            if (buffer.length !== 2 + length) return;

            const roomCode = textDecoder.decode(buffer.slice(2, 2 + length));

            const id = waveRoomService.joinWaveRoom(userData, roomCode);

            processJoin(ws, id);

            break;
        }
        case ServerBound.WAVE_ROOM_FIND_PUBLIC: {
            if (buffer.length !== 2 || !BIOME_VALUES.includes(buffer[1])) return;

            const id = waveRoomService.joinPublicWaveRoom(userData, buffer[1]);

            processJoin(ws, id);

            break;
        }
        case ServerBound.WAVE_ROOM_CHANGE_READY: {
            if (buffer.length !== 2 || !PLAYER_STATE_VALUES.includes(buffer[1])) return;

            const waveRoom = waveRoomService.findPlayerRoom(waveRoomClientId);
            if (!waveRoom) return;

            waveRoom.setPlayerReadyState(waveRoomClientId, buffer[1]);

            break;
        }
        case ServerBound.WAVE_ROOM_CHANGE_VISIBLE: {
            if (buffer.length !== 2 || !VISIBLE_STATE_VALUES.includes(buffer[1])) return;

            const waveRoom = waveRoomService.findPlayerRoom(waveRoomClientId);
            if (!waveRoom) return;

            waveRoom.setPublicState(waveRoomClientId, buffer[1]);

            break;
        }
        case ServerBound.WAVE_ROOM_CHANGE_NAME: {
            if (buffer.length < 2) return;

            const length = buffer[1];
            if (buffer.length !== 2 + length) return;

            const newName = textDecoder.decode(buffer.slice(2, 2 + length));

            const waveRoom = waveRoomService.findPlayerRoom(waveRoomClientId);
            if (!waveRoom) return;

            const ok = waveRoom.setPlayerName(waveRoomClientId, newName);
            if (!ok) return;

            break;
        }
        case ServerBound.WAVE_ROOM_LEAVE: {
            const ok = waveRoomService.leaveWaveRoom(waveRoomClientId);
            if (!ok) return;

            userData.waveRoomClientId = null;

            break;
        }
        case ServerBound.WAVE_LEAVE: {
            const waveRoom = waveRoomService.findPlayerRoom(waveRoomClientId);
            if (!waveRoom) return;

            const client = waveRoom.wavePool.getClient(waveClientId);
            if (!client) return;

            clientRemove(waveRoom, client.id);

            userData.waveClientId = null;

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
        maxPayloadLength: 16 * 1024,
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
            //     }, 100);
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

                if (waveRoom?.wavePool) {
                    const waveClient = waveRoom.wavePool.getClient(waveClientId);
                    if (waveClient) clientRemove(waveRoom, waveClient.id);
                }
            }
        })
    })
    .listen(PORT, (token) => {
        if (token) {
            logger.info(`Server running on port ${PORT}`);

            // Register all commands on global root
            {
                // Spawn and their sub commands
                {
                    const spawn = registerSpawn(root);
                    const spawnMob = registerSpawnMob(spawn);
                    registerSpawnMobBulk(spawnMob);
                }
            }
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

// ---------- BEGIN DEBUG (for data collect) ----------

process.on('uncaughtException', function (err) {
    logger.error("Uncaught exception occurred!");
    logger.error("Last 10 packet types received: " + JSON.stringify(packetHistory.slice(), null, "\t"));

    throw err;
});