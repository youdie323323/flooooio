import path from "path";
import uWS, { App, SHARED_COMPRESSOR } from 'uWebSockets.js';
import { PLAYER_STATE_VALUES, VISIBLE_STATE_VALUES } from "../Shared/WaveRoom";
import fs from "fs";
import { VALID_MOOD_FLAGS } from "../Shared/Mood";
import { BIOME_VALUES } from "../Shared/Biome";
import { kickClient, clientRemove, processJoin } from "./Sources/Game/Utils/common";
import { Logger } from "./Sources/Logger/Logger";
import { Rarity } from "../Shared/Entity/Statics/EntityRarity";
import { PetalType } from "../Shared/Entity/Statics/EntityType";
import { StaticPetalData } from "./Sources/Game/Entity/Dynamics/Mob/Petal/Petal";
import { StaticPlayerData } from "./Sources/Game/Entity/Dynamics/Player/Player";
import { UserData } from "./Sources/Game/Genres/Wave/WavePool";
import WaveRoomService from "./Sources/Game/Genres/Wave/WaveRoomService";
import { ClientboundConnectionKickReason } from "../Shared/Packet/Bound/Client/ClientboundConnectionKickReason";
import { ServerBound } from "../Shared/Packet/Bound/Server/ServerBound";

require('dotenv').config({
    path: path.resolve(__dirname, '../../.env'),
});

export const isDebug = process.argv.includes("-d");

/**
 * Temp player data.
 */
const MOCK_PLAYER_DATA: Omit<StaticPlayerData, "ws"> = {
    name: 'A-NNCYANCHI-N',
    slots: {
        surface: Array(5).fill(
            {
                type: PetalType.BeetleEgg,
                rarity: Rarity.Ultra,
            } satisfies StaticPetalData,
        ),
        bottom: Array(3).fill(
            {
                type: PetalType.Bubble,
                rarity: Rarity.Ultra,
            } satisfies StaticPetalData,
        ).concat(
            Array(3).fill(
                {
                    type: PetalType.BeetleEgg,
                    rarity: Rarity.Ultra,
                } satisfies StaticPetalData,
            ),
        ).concat(
            Array(4).fill(
                {
                    type: PetalType.YinYang,
                    rarity: Rarity.Ultra,
                } satisfies StaticPetalData,
            ),
        ),
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
 * Global instance for decoding string section of buffer.
 */
const textDecoder = new TextDecoder('utf-8');

function handleMessage(ws: uWS.WebSocket<UserData>, message: ArrayBuffer, isBinary: boolean) {
    const buffer = new Uint8Array(message);
    if (buffer.length < 1 || !isBinary) return;

    const userData = ws.getUserData();
    if (!userData) return;

    const { waveRoomClientId, waveClientId } = userData;

    const packetType = buffer[0];

    // Hmm, maybe should i kick client if their packet is incorrect?

    switch (packetType) {
        // Wave
        case ServerBound.WaveChangeMove: {
            if (buffer.length !== 3) return;

            const waveRoom = waveRoomService.findPlayerRoom(waveRoomClientId);
            if (!waveRoom) return;

            const client = waveRoom.wavePool.getClient(waveClientId);
            if (!client) return;

            waveRoom.wavePool.updateMovement(waveClientId, buffer[1], buffer[2]);

            break;
        }
        case ServerBound.WaveChangeMood: {
            if (buffer.length !== 2 || !VALID_MOOD_FLAGS.includes(buffer[1])) {
                kickClient(ws, ClientboundConnectionKickReason.CheatDetected);

                return;
            }

            const waveRoom = waveRoomService.findPlayerRoom(waveRoomClientId);
            if (!waveRoom) return;

            const client = waveRoom.wavePool.getClient(waveClientId);
            if (!client) return;

            waveRoom.wavePool.changeMood(waveClientId, buffer[1]);

            break;
        }
        case ServerBound.WaveSwapPetal: {
            if (buffer.length !== 2) return;

            const waveRoom = waveRoomService.findPlayerRoom(waveRoomClientId);
            if (!waveRoom) return;

            waveRoom.wavePool.swapPetal(waveClientId, buffer[1]);

            break;
        }
        case ServerBound.WaveChat: {
            if (buffer.length < 2) return;

            const waveRoom = waveRoomService.findPlayerRoom(waveRoomClientId);
            if (!waveRoom) return;

            const length = buffer[1];
            if (buffer.length !== 2 + length) return;

            const chat = textDecoder.decode(buffer.slice(2, 2 + length));

            waveRoom.processChatMessage(userData, chat);

            break;
        }
        case ServerBound.WaveLeave: {
            const waveRoom = waveRoomService.findPlayerRoom(waveRoomClientId);
            if (!waveRoom) return;

            const client = waveRoom.wavePool.getClient(waveClientId);
            if (!client) return;

            clientRemove(waveRoom, client.id);

            userData.waveClientId = null;

            break;
        }

        // Wave room
        case ServerBound.WaveRoomCreate: {
            if (buffer.length !== 2 || !BIOME_VALUES.has(buffer[1])) return;

            const id = waveRoomService.createWaveRoom(userData, buffer[1]);

            processJoin(ws, id);

            break;
        }
        case ServerBound.WaveRoomJoin: {
            if (buffer.length < 2) return;

            const length = buffer[1];
            if (buffer.length !== 2 + length) return;

            const roomCode = textDecoder.decode(buffer.slice(2, 2 + length));

            const id = waveRoomService.joinWaveRoom(userData, roomCode);

            processJoin(ws, id);

            break;
        }
        case ServerBound.WaveRoomFindPublic: {
            if (buffer.length !== 2 || !BIOME_VALUES.has(buffer[1])) return;

            const id = waveRoomService.joinPublicWaveRoom(userData, buffer[1]);

            processJoin(ws, id);

            break;
        }
        case ServerBound.WaveRoomChangeReady: {
            if (buffer.length !== 2 || !PLAYER_STATE_VALUES.includes(buffer[1])) return;

            const waveRoom = waveRoomService.findPlayerRoom(waveRoomClientId);
            if (!waveRoom) return;

            waveRoom.setPlayerReadyState(waveRoomClientId, buffer[1]);

            break;
        }
        case ServerBound.WaveRoomChangeVisible: {
            if (buffer.length !== 2 || !VISIBLE_STATE_VALUES.includes(buffer[1])) return;

            const waveRoom = waveRoomService.findPlayerRoom(waveRoomClientId);
            if (!waveRoom) return;

            waveRoom.setPublicState(waveRoomClientId, buffer[1]);

            break;
        }
        case ServerBound.WaveRoomChangeName: {
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
        case ServerBound.WaveRoomLeave: {
            const ok = waveRoomService.leaveWaveRoom(waveRoomClientId);
            if (!ok) return;

            userData.waveRoomClientId = null;

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
    '.ico': 'image/x-icon',
};

app
    .get('/*', (res, req) => {
        const url = req.getUrl();
        const filePath = path.join(__dirname, "..", "..", 'build', "statics", url === '/' ? 'index.html' : url);
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
    })
    .ws('/*', {
        compression: SHARED_COMPRESSOR,
        maxPayloadLength: 16 * 1024,
        sendPingsAutomatically: false,
        idleTimeout: 0,
        open: (ws: uWS.WebSocket<UserData>) => {
            logger.region(() => {
                using _guard = logger.metadata({
                    ipAddress: Buffer.from(ws.getRemoteAddressAsText()).toString(),
                });
                logger.info("Client connected");
            });

            // Safely set them null
            const userData = ws.getUserData();
            userData.waveRoomClientId = null;
            userData.waveClientId = null;
            userData.staticPlayerData = { ...MOCK_PLAYER_DATA, ws };

            // Lag simulator
            // const originalSend = ws.send;
            // ws.send = function (...args) {
            //     setTimeout(() => {
            //         originalSend.apply(ws, args);
            //     }, 200);
            //     
            //     return 0;
            // };
        },
        // I dont log errors here because all errors are well-known (ws.send fail)
        // its maybe impact performance
        message: handleMessage,
        close: (ws: uWS.WebSocket<UserData>, code, message) => {
            const { waveRoomClientId, waveClientId } = ws.getUserData();

            logger.region(() => {
                using _guard = logger.metadata({
                    reason: Buffer.from(message).toString() || "UNKNOWN",
                    waveRoomClientId,
                    waveClientId,
                });
                logger.info(`Client disconnected`);
            });

            const waveRoom = waveRoomService.findPlayerRoom(waveRoomClientId);

            if (waveRoom) {
                // Leave current wave room | wave
                waveRoomService.leaveWaveRoom(waveRoomClientId);

                if (waveRoom?.wavePool) {
                    const waveClient = waveRoom.wavePool.getClient(waveClientId);
                    if (waveClient) clientRemove(waveRoom, waveClient.id);
                }
            }
        },
    })
    .listen("0.0.0.0", PORT, (token: any) => {
        if (token) {
            logger.info(`Server running on port ${PORT}`);
        } else {
            logger.error(`Failed to listen on port ${PORT}`);
        }
    });