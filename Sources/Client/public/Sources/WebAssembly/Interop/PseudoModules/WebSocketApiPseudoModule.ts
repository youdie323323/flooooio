import type WebAssemblyPseudoModule from "./PseudoModule";
import type { PseudoModuleFactory, PseudoModuleFactoryArguments } from "./PseudoModule";
import { malloc, pollHandle, free, HEAP32, HEAP8, HEAPU32 } from "../../../Application";

const enum EventType {
    MESSAGE = 1,
    OPEN,
    ERROR,
    CLOSE,
}

type EventQuery = [
    // Event type
    EventType,
    // Message pointer (where message allocated)
    number,
    // Size of message
    number,
];

declare global {
    interface WebSocket {
        th: Array<EventQuery>;
    }
}

const sockets: Array<WebSocket> = new Array();

export const createWebSocketApiPseudoModule = ((...[, { decodeCString }]: PseudoModuleFactoryArguments): WebAssemblyPseudoModule => {
    return {
        moduleName: "3",
        moduleImports: {
            0: () => "https:" == location.protocol,

            1: (ptr: number) => {
                const url = decodeCString(ptr);

                const socket = new WebSocket(url);

                (new URL(url)).hostname != (new URL(socket.url)).hostname && (
                    document.getElementById("loading").style.display = "none",
                    document.getElementById("unsupported").style.display = "none",
                    document.getElementById("errorDialog").style.display = "block",
                    document.getElementById("canvas").style.display = "none"
                );

                socket.binaryType = "arraybuffer";
                socket.th = [];

                socket.onopen = function () {
                    socket.th.push([EventType.OPEN, 0, 0]);

                    pollHandle(socketId);
                };

                socket.onerror = function () {
                    socket.th.push([EventType.ERROR, 0, 0]);

                    pollHandle(socketId);
                };

                socket.onclose = function () {
                    socket.th.push([EventType.CLOSE, 0, 0]);

                    pollHandle(socketId);
                };

                socket.onmessage = function (e: MessageEvent) {
                    const data = new Uint8Array(e.data);
                    const size = data.length;

                    const ptr = malloc(size);
                    HEAP8.set(data, ptr);
                    socket.th.push([EventType.MESSAGE, ptr, size]);

                    pollHandle(socketId);
                };

                for (let i = 0; i < sockets.length; i++)
                    if (null == sockets[i])
                        return sockets[i] = socket, i;

                sockets.push(socket);

                const socketId = sockets.length - 1;

                return socketId;
            },

            2: (socketId: number) => {
                const socket = sockets[socketId];
                socket.onopen = socket.onclose = socket.onmessage = socket.onerror = function () { };

                for (let i = 0; i < socket.th.length; i++) free(socket.th[i][0]);

                socket.th = null;

                try {
                    socket.close();
                } catch (e) { }

                sockets[socketId] = null;
            },

            3: (socketId: number) => 1 == sockets[socketId].readyState,

            4: (socketId: number, ptr: number, size: number) => {
                const socket = sockets[socketId];

                if (1 != socket.readyState) return 0;

                try {
                    socket.send(HEAP8.subarray(ptr, ptr + size));
                } catch (e) {
                    return 0;
                }

                return 1;
            },

            5: (socketId: number, ptrAddr: number, sizeAddr: number) => {
                const socket = sockets[socketId];

                if (0 == socket.th.length) return 0;

                const query = socket.th.shift();

                HEAPU32[ptrAddr >> 2] = query[1];
                HEAP32[sizeAddr >> 2] = query[2];

                return query[0];
            },
        },
    } as const satisfies WebAssemblyPseudoModule;
}) satisfies PseudoModuleFactory;