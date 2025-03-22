import path from "path";
import type uWS from 'uWebSockets.js';
import { App, SHARED_COMPRESSOR } from 'uWebSockets.js';
import { PLAYER_STATE_VALUES, VISIBLE_STATE_VALUES } from "../Shared/WaveRoom";
import fs from "fs";
import { VALID_MOOD_FLAGS } from "../Shared/Mood";
import { BIOME_VALUES } from "../Shared/Biome";
import { Logger } from "./Sources/Logger/Logger";
import { Rarity } from "../Shared/Entity/Statics/EntityRarity";
import { PetalType } from "../Shared/Entity/Statics/EntityType";
import type { StaticPetalData } from "./Sources/Game/Entity/Dynamics/Mob/Petal/Petal";
import type { StaticPlayerData } from "./Sources/Game/Entity/Dynamics/Player/Player";
import type { UserData } from "./Sources/Game/Genres/Wave/WavePool";
import WaveRoomService from "./Sources/Game/Genres/Wave/WaveRoomService";
import { removeClientFromAllService } from "./Sources/Game/Entity/Dynamics/EntityElimination";
import { joinWaveRoom } from "./Sources/Game/Genres/Wave/WaveRoom";
import BinaryReader from "../Shared/Websocket/Binary/ReadWriter/Reader/BinaryReader";
import { isWaveRoomCode } from "../Shared/WaveRoomCode";
import { Serverbound } from "../Shared/Websocket/Packet/PacketDirection";

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
        surface: Array(14).fill(
            {
                type: PetalType.BASIC,
                rarity: Rarity.ULTRA,
            } satisfies StaticPetalData,
        ),
        bottom: Array(3).fill(
            {
                type: PetalType.BUBBLE,
                rarity: Rarity.ULTRA,
            } satisfies StaticPetalData,
        ).concat(
            Array(3).fill(
                {
                    type: PetalType.EGG_BEETLE,
                    rarity: Rarity.ULTRA,
                } satisfies StaticPetalData,
            ),
        ).concat(
            Array(4).fill(
                {
                    type: PetalType.YIN_YANG,
                    rarity: Rarity.ULTRA,
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

function handleMessage(ws: uWS.WebSocket<UserData>, message: ArrayBuffer, isBinary: boolean) {
    if (!isBinary) return;

    const reader = new BinaryReader(message);

    const { buffer } = reader;

    if (1 > buffer.length) return;

    const userData = ws.getUserData();
    if (!userData) return;

    const { waveRoomClientId, waveClientId } = userData;

    const opcode = reader.readUInt8() satisfies Serverbound;

    switch (opcode) {
        // Wave

        case Serverbound.WAVE_CHANGE_MOVE: {
            if (buffer.length !== 3) return;

            const waveRoom = waveRoomService.findPlayerRoom(waveRoomClientId);
            if (!waveRoom) return;

            const client = waveRoom.wavePool.getClient(waveClientId);
            if (!client) return;

            const angle = reader.readUInt8();

            const magnitude = reader.readUInt8();

            waveRoom.wavePool.updateMovement(waveClientId, angle, magnitude);

            break;
        }

        case Serverbound.WAVE_CHANGE_MOOD: {
            if (buffer.length !== 2) return;

            const flag = reader.readUInt8();
            if (!VALID_MOOD_FLAGS.includes(flag)) return;

            const waveRoom = waveRoomService.findPlayerRoom(waveRoomClientId);
            if (!waveRoom) return;

            const client = waveRoom.wavePool.getClient(waveClientId);
            if (!client) return;

            waveRoom.wavePool.changeMood(waveClientId, flag);

            break;
        }

        case Serverbound.WAVE_SWAP_PETAL: {
            if (buffer.length !== 2) return;

            const waveRoom = waveRoomService.findPlayerRoom(waveRoomClientId);
            if (!waveRoom) return;

            const at = reader.readUInt8();

            waveRoom.wavePool.swapPetal(waveClientId, at);

            break;
        }

        case Serverbound.WAVE_SEND_CHAT: {
            if (buffer.length < 2) return;

            const waveRoom = waveRoomService.findPlayerRoom(waveRoomClientId);
            if (!waveRoom) return;

            const chatMsg = reader.readString();

            waveRoom.handleChatMessage(userData, chatMsg);

            break;
        }

        case Serverbound.WAVE_LEAVE: {
            const waveRoom = waveRoomService.findPlayerRoom(waveRoomClientId);
            if (!waveRoom) return;

            const client = waveRoom.wavePool.getClient(waveClientId);
            if (!client) return;

            removeClientFromAllService(waveRoom, client.id);

            userData.waveClientId = null;

            break;
        }

        // Wave room
        
        case Serverbound.WAVE_ROOM_CREATE: {
            if (buffer.length !== 2) return;

            const biome = reader.readUInt8();
            if (!BIOME_VALUES.has(biome)) return;

            const id = waveRoomService.createWaveRoom(userData, biome);

            joinWaveRoom(ws, id);

            break;
        }

        case Serverbound.WAVE_ROOM_JOIN: {
            if (buffer.length < 2) return;

            const code = reader.readString();
            if (!isWaveRoomCode(code)) return;

            const id = waveRoomService.joinWaveRoom(userData, code);

            joinWaveRoom(ws, id);

            break;
        }

        case Serverbound.WAVE_ROOM_FIND_PUBLIC: {
            if (buffer.length !== 2) return;

            const biome = reader.readUInt8();
            if (!BIOME_VALUES.has(biome)) return;

            const id = waveRoomService.joinPublicWaveRoom(userData, biome);

            joinWaveRoom(ws, id);

            break;
        }

        case Serverbound.WAVE_ROOM_CHANGE_READY: {
            if (buffer.length !== 2) return;

            const state = reader.readUInt8();
            if (!PLAYER_STATE_VALUES.includes(state)) return;

            const waveRoom = waveRoomService.findPlayerRoom(waveRoomClientId);
            if (!waveRoom) return;

            waveRoom.updatePlayerReadyState(waveRoomClientId, state);

            break;
        }

        case Serverbound.WAVE_ROOM_CHANGE_VISIBLE: {
            if (buffer.length !== 2) return;

            const state = reader.readUInt8();
            if (!VISIBLE_STATE_VALUES.includes(state)) return;

            const waveRoom = waveRoomService.findPlayerRoom(waveRoomClientId);
            if (!waveRoom) return;

            waveRoom.updateRoomVisibility(waveRoomClientId, state);

            break;
        }

        case Serverbound.WAVE_ROOM_CHANGE_NAME: {
            if (buffer.length < 2) return;

            const name = reader.readString();

            const waveRoom = waveRoomService.findPlayerRoom(waveRoomClientId);
            if (!waveRoom) return;

            const ok = waveRoom.updatePlayerName(waveRoomClientId, name);
            if (!ok) return;

            break;
        }

        case Serverbound.WAVE_ROOM_LEAVE: {
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
                    if (waveClient) removeClientFromAllService(waveRoom, waveClient.id);
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