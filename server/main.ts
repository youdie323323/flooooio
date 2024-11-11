import uWS from 'uWebSockets.js';
import { PacketKind } from '../shared/packet';
import { UserData } from './entity/EntityPool';
import { pack } from 'msgpackr';
import { MobType, PetalType } from '../shared/types';
import * as fs from 'fs';
import * as path from 'path';
import { choice, getRandomSafePosition, annihilateClient, randomEnum } from './entity/common/common';
import { Rarities } from '../shared/rarities';
import { mapCenterX, mapCenterY, mapRadius, safetyDistance } from './entity/EntityChecksum';
import { MOON_KIND_VALUES } from '../shared/mood';
import WaveRoomManager from './wave/WaveRoomManager';
import { BIOME_VALUES, Biomes } from '../shared/biomes';
import { PlayerData } from './entity/player/Player';
import { PlayerReadyState, WaveRoomVisibleState } from './wave/WaveRoom';

const DEFAULT_PLAYER_DATA: Omit<PlayerData, "ws"> = {
    name: 'hare',
    slots: {
        surface: Array(8 * 4).fill({
            type: PetalType.BASIC,
            rarity: Rarities.SUPER,
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
    '.css': 'text/css',
    '.png': 'image/png',
    '.ico': 'image/x-icon'
};

const waveRoomManager = new WaveRoomManager();

function handleWebSocketMessage(ws: uWS.WebSocket<UserData>, message: ArrayBuffer, isBinary: any) {
    const buffer = new Uint8Array(message);
    if (buffer.length < 1 || !isBinary) return;

    const userData = ws.getUserData();
    if (!userData) return;

    const { waveRoomClientId, waveClientId } = userData;

    switch (buffer[0]) {
        case PacketKind.MOVE:
            handleMovePacket(buffer, waveRoomClientId, waveClientId);
            break;
        case PacketKind.MOOD:
            handleMoodPacket(buffer, waveRoomClientId, waveClientId);
            break;
        case PacketKind.SWAP_PETAL:
            handleSwapPetalPacket(buffer, waveRoomClientId, waveClientId);
            break;
        case PacketKind.CREATE_WAVE_ROOM:
            handleCreateWaveRoom(ws, buffer);
            break;
        case PacketKind.JOIN_WAVE_ROOM:
            handleJoinWaveRoom(ws, buffer);
            break;
        case PacketKind.WAVE_ROOM_READY:
            handleWaveRoomReady(buffer, waveRoomClientId);
            break;
        case PacketKind.WAVE_ROOM_CHANGE_VISIBLE:
            handleWaveRoomVisibility(buffer, waveRoomClientId);
            break;
        case PacketKind.WAVE_ROOM_LEAVE:
            handleWaveRoomLeave(waveRoomClientId);
            break;
    }
}

function handleMovePacket(buffer: Uint8Array, waveRoomClientId: number, waveClientId: number) {
    if (buffer.length < 3) return;

    const waveRoom = waveRoomManager.findPlayerRoom(waveRoomClientId);
    if (!waveRoom) return;

    waveRoom.entityPool.updatePositionProp(waveClientId, buffer[1], buffer[2]);
}

function handleMoodPacket(buffer: Uint8Array, waveRoomClientId: number, waveClientId: number) {
    if (buffer.length < 2 || !MOON_KIND_VALUES.includes(buffer[1])) return;

    const waveRoom = waveRoomManager.findPlayerRoom(waveRoomClientId);
    if (!waveRoom) return;

    waveRoom.entityPool.updateMood(waveClientId, buffer[1]);
}

function handleSwapPetalPacket(buffer: Uint8Array, waveRoomClientId: number, waveClientId: number) {
    if (buffer.length < 2) return;

    const waveRoom = waveRoomManager.findPlayerRoom(waveRoomClientId);
    if (!waveRoom) return;

    waveRoom.entityPool.swapPetal(waveClientId, buffer[1]);
}

function handleCreateWaveRoom(ws: uWS.WebSocket<UserData>, buffer: Uint8Array) {
    if (buffer.length < 2 || !BIOME_VALUES.includes(buffer[1])) return;

    const userData = ws.getUserData();

    if (userData.waveRoomClientId) {
        waveRoomManager.leaveWaveRoom(userData.waveRoomClientId)
    }

    const id = waveRoomManager.createWaveRoom({ ...DEFAULT_PLAYER_DATA, ws }, buffer[1]);
    if (!id) return;

    ws.getUserData().waveRoomClientId = id;
}

function handleJoinWaveRoom(ws: uWS.WebSocket<UserData>, buffer: Uint8Array) {
    if (buffer.length < 2) return;

    const length = buffer[1];
    if (buffer.length < 2 + length) return;

    const roomCode = new TextDecoder('utf-8').decode(buffer.slice(2, 2 + length));

    const userData = ws.getUserData();

    if (userData.waveRoomClientId) {
        const waveRoom = waveRoomManager.findPlayerRoom(userData.waveRoomClientId);

        if (waveRoom && waveRoom.code === roomCode) {
            ws.send(Buffer.from([PacketKind.WAVE_CODE_INVALID]), true);
            return;
        }

        waveRoomManager.leaveWaveRoom(userData.waveRoomClientId);
        userData.waveRoomClientId = null;
    }

    const idOrNullish = waveRoomManager.joinWaveRoom({ ...DEFAULT_PLAYER_DATA, ws }, roomCode);

    const response = Buffer.alloc(idOrNullish ? 5 : 1);
    response.writeUInt8(idOrNullish ? PacketKind.WAVE_SELF_ID : PacketKind.WAVE_CODE_INVALID, 0);

    if (idOrNullish) {
        response.writeUInt32BE(idOrNullish, 1);
        userData.waveRoomClientId = idOrNullish;
    };

    ws.send(response, true);
}

function handleWaveRoomReady(buffer: Uint8Array, waveRoomClientId: number) {
    if (buffer.length < 2) return;

    const waveRoom = waveRoomManager.findPlayerRoom(waveRoomClientId);
    if (!waveRoom) return;

    waveRoom.setPlayerReadyState(waveRoomClientId, buffer[1] ? PlayerReadyState.READY : PlayerReadyState.UNREADY);
}

function handleWaveRoomVisibility(buffer: Uint8Array, waveRoomClientId: number) {
    if (buffer.length < 2) return;

    const waveRoom = waveRoomManager.findPlayerRoom(waveRoomClientId);
    if (!waveRoom) return;

    waveRoom.setPublicState(waveRoomClientId, buffer[1] ? WaveRoomVisibleState.PUBLIC : WaveRoomVisibleState.PUBLIC);
}

function handleWaveRoomLeave(waveRoomClientId: number) {
    waveRoomManager.leaveWaveRoom(waveRoomClientId);
}

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
        },
        message: (ws: uWS.WebSocket<UserData>, message: ArrayBuffer, isBinary: boolean) => {
            try {
                handleWebSocketMessage(ws, message, isBinary);
            } catch { }
        },
        close: (ws: uWS.WebSocket<UserData>, code, message) => {
            const { waveRoomClientId, waveClientId } = ws.getUserData();
            const waveRoom = waveRoomManager.findPlayerRoom(waveRoomClientId);

            if (waveRoom) {
                const waveClient = waveRoom.entityPool.getClient(waveClientId);
                if (waveClient) {
                    annihilateClient(waveRoom.entityPool, waveClient, waveRoomManager, waveRoomClientId, true)
                };
            }
        }
    })
    .listen(PORT, (token) => {
        console.log(token ? `Server running on port ${PORT}` : `Failed to listen on port ${PORT}`);
    });