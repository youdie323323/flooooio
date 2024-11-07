import uWS from 'uWebSockets.js';
import { MoodKind, MOON_KIND_VALUES, PacketKind, PacketType } from '../shared/packet';
import { entityPool, UserData } from './entity/EntityPool';
import { pack } from 'msgpackr';
import { MobType, PetalType } from '../shared/types';
import * as fs from 'fs';
import * as path from 'path';
import { choice, getRandomMapPos, getRandomSafePosition, onPlayerDead, randomEnum } from './entity/utils/small';
import { Rarities } from '../shared/rarities';
import { mapCenterX, mapCenterY, mapRadius, safetyDistance } from './entity/EntityChecksum';

const PORT = 8080;
const MIME_TYPES = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.png': 'image/png',
    '.ico': 'image/x-icon'
};

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
        maxPayloadLength: 16 * 1024,
        sendPingsAutomatically: false,
        idleTimeout: 0,
        open: (ws: uWS.WebSocket<UserData>) => {
            const clientId = entityPool.addClient(ws);

            const buffer = Buffer.alloc(5);
            let offset = 0;

            buffer.writeUInt8(PacketKind.INIT, offset++);

            buffer.writeUInt32BE(clientId, offset);
            offset += 4;

            const client = entityPool.getClient(clientId);
            setInterval(() => {
                entityPool.addPetalOrMob(choice([MobType.BEETLE]), Rarities.MYTHIC, client.x, client.y, client);
            }, 250);

            // Lag emulation:
            // const originalSend = ws.send;

            // ws.send = function (...args) {
            //     setTimeout(() => {
            //         originalSend.apply(ws, args);
            //     }, 100);
            // };

            // Send id to client so client can knows their own id
            try {
                ws.send(buffer, true);
            } catch (e) {
                // Connection is closed, remove the client
                entityPool.removeClient(clientId);
            }
        },
        message: (ws: uWS.WebSocket<UserData>, message: ArrayBuffer, isBinary) => {
            const { clientId } = ws.getUserData();

            const buffer = new Uint8Array(message);
            if (buffer.length < 1 || !isBinary) return;

            switch (buffer[0]) {
                case PacketKind.MOVE: {
                    if (buffer.length < 3) return;
                    entityPool.updatePositionProp(clientId, buffer[1], buffer[2]);
                    break;
                }
                case PacketKind.MOOD: {
                    if (buffer.length < 2) return;
                    if (!MOON_KIND_VALUES.includes(buffer[1])) {
                        break;
                    }
                    entityPool.updateMood(clientId, buffer[1]);
                    break;
                }
                case PacketKind.SWAP_PETAL: {
                    if (buffer.length < 2) return;
                    entityPool.swapPetal(clientId, buffer[1]);
                    break;
                }
            }
        },
        close: (ws: uWS.WebSocket<UserData>, code, message) => {
            const { clientId } = ws.getUserData();

            onPlayerDead(entityPool, entityPool.getClient(clientId), true);
        },
    })
    .listen(PORT, async (token) => {
        if (token) {
            console.log(`Running on port ${PORT}`);

            setInterval(() => {
                const randPos = getRandomSafePosition(mapCenterX, mapCenterY, mapRadius, safetyDistance, entityPool);
                if (!randPos) {
                    return;
                }
                entityPool.addPetalOrMob(choice([MobType.BEETLE, MobType.BEE, MobType.JELLYFISH, MobType.STARFISH]), Rarities.MYTHIC, randPos.x, randPos.y);
            }, 100);
        } else {
            console.error(`Failed to listen on port ${PORT}`);
        }
    });