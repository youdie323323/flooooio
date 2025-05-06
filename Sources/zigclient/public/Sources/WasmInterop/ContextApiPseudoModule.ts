import type WebAssemblyPseudoModule from "./WebAssemblyPseudoModule";
import { Canvg, presets } from "canvg";
import type { PseudoModuleFactory, PseudoModuleFactoryArguments } from "./WebAssemblyPseudoModule";
import { HEAPU16, HEAPU32, table } from "../Application";

const contexts: Array<CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D> = new Array();
const destroyedContextIds: Array<number> = new Array();

const paths: Array<Path2D> = new Array();
const destroyedPathIds: Array<number> = new Array();

const LINE_DASH_REAL_LINE: Iterable<number> = [];

type Uint1 = 0 | 1;

interface CanvasLostRestoreMethod {
    // Context lost
    Jj: () => void;
    // Context restore
    Kj: () => void;
}

declare global {
    interface HTMLCanvasElement extends CanvasLostRestoreMethod { }
    interface OffscreenCanvas extends CanvasLostRestoreMethod { }
}

function toHexCharCode(nibble: number) {
    switch (nibble) {
        case 0:
            return 48;

        case 1:
            return 49;

        case 2:
            return 50;

        case 3:
            return 51;

        case 4:
            return 52;

        case 5:
            return 53;

        case 6:
            return 54;

        case 7:
            return 55;

        case 8:
            return 56;

        case 9:
            return 57;

        case 10:
            return 65;

        case 11:
            return 66;

        case 12:
            return 67;

        case 13:
            return 68;

        case 14:
            return 69;

        case 15:
            return 70;

        default:
            return 63;
    }
}

const PRESET_OFFSCREEN = presets.offscreen();

export const createContextApiPseudoModule = ((...[, { decodeString }]: PseudoModuleFactoryArguments): WebAssemblyPseudoModule => {
    return {
        moduleName: "0",
        moduleImports: {
            // Begin canvas api

            0: (w: number, h: number, isDiscardable: Uint1): number => {
                const canvas = new OffscreenCanvas(w, h);

                const ctx = canvas.getContext("2d", {
                    storage:
                        isDiscardable
                            ? "discardable"
                            : "persistent",
                }) as OffscreenCanvasRenderingContext2D | null;
                if (!ctx) throw new Error("Failed to get 2D context");

                let contextId: number;

                if (0 < destroyedContextIds.length) {
                    contextId = destroyedContextIds.pop();

                    contexts[contextId] = ctx;
                } else {
                    contextId = contexts.length;

                    contexts.push(ctx);
                }

                canvas.Jj = function () { };
                canvas.Kj = function () { };

                return contextId;
            },

            1: (ptr: number, len: number, alpha: Uint1): number => {
                const canvas = document.getElementById(decodeString(ptr, len)) as HTMLCanvasElement | null;
                if (!canvas) return -1;

                const ctx = canvas.getContext("2d", {
                    alpha: !!alpha,
                });
                if (!ctx) throw new Error("Failed to get 2D context");

                contexts.push(ctx);

                return contexts.length - 1;
            },

            2: (contextId: number, ptr: number, len: number): void =>
                Canvg.fromString(
                    contexts[contextId],
                    decodeString(ptr, len),
                    PRESET_OFFSCREEN,
                ).render(),

            3: (contextId: number): void => {
                const canvas = contexts[contextId].canvas;

                destroyedContextIds.push(contextId);

                delete canvas.Jj;
                delete canvas.Kj;

                canvas.width = canvas.height = 0;

                contexts[contextId] = null;
            },

            4: (contextId: number): void => {
                contexts[contextId].save();
            },

            5: (contextId: number): void => {
                contexts[contextId].restore();
            },

            6: (contextId: number): void => {
                contexts[contextId].setTransform(1, 0, 0, 1, 0, 0);
            },

            7: (contextId: number, a: number, b: number, c: number, d: number, e: number, f: number): void => {
                contexts[contextId].setTransform(a, b, c, d, e, f);
            },

            8: (contextId: number): void => {
                contexts[contextId].fill();
            },

            9: (contextId: number, pathId: number, isNonZero: number): void => {
                contexts[contextId].fill(paths[pathId], isNonZero ? "nonzero" : "evenodd");
            },

            10: (contextId: number): void => {
                contexts[contextId].stroke();
            },

            11: (contextId: number, pathId: number): void => {
                contexts[contextId].stroke(paths[pathId]);
            },

            12: (contextId: number): void => {
                contexts[contextId].clip();
            },

            13: (contextId: number, pathId: number): void => {
                contexts[contextId].clip(paths[pathId]);
            },

            14: (contextId: number): void => {
                contexts[contextId].beginPath();
            },

            15: (contextId: number): void => {
                contexts[contextId].closePath();
            },

            16: (contextId: number, x: number, y: number, w: number, h: number): void => {
                contexts[contextId].rect(x, y, w, h);
            },

            17: (contextId: number): void => {
                const context = contexts[contextId];
                const canvas = context.canvas;

                context.clearRect(0, 0, canvas.width, canvas.height);
            },

            18: (contextId: number, x: number, y: number, w: number, h: number): void => {
                contexts[contextId].clearRect(x, y, w, h);
            },

            // Draw a pixel
            19: (contextId: number): void => {
                contexts[contextId].fillRect(0, 0, 1, 1);
            },

            20: (contextId: number, w: number, h: number): void => {
                contexts[contextId].strokeRect(0, 0, w, h);
            },

            21: (contextId: number, r: number, g: number, b: number) => {
                contexts[contextId].fillStyle = String.fromCharCode(
                    35,
                    toHexCharCode(r >> 4 & 15),
                    toHexCharCode(r & 15),
                    toHexCharCode(g >> 4 & 15),
                    toHexCharCode(g & 15),
                    toHexCharCode(b >> 4 & 15),
                    toHexCharCode(b & 15),
                );
            },

            22: (contextId: number, r: number, g: number, b: number) => {
                contexts[contextId].strokeStyle = String.fromCharCode(
                    35,
                    toHexCharCode(r >> 4 & 15),
                    toHexCharCode(r & 15),
                    toHexCharCode(g >> 4 & 15),
                    toHexCharCode(g & 15),
                    toHexCharCode(b >> 4 & 15),
                    toHexCharCode(b & 15),
                );
            },

            23: (contextId: number, alpha: number) => {
                contexts[contextId].globalAlpha = alpha;
            },

            24: (contextId: number, x: number, y: number): void => {
                contexts[contextId].moveTo(x, y);
            },

            25: (contextId: number, x: number, y: number): void => {
                contexts[contextId].lineTo(x, y);
            },

            26: (contextId: number, x: number, y: number): void => {
                contexts[contextId].translate(x, y);
            },

            27: (contextId: number, x: number, y: number): void => {
                contexts[contextId].scale(x, y);
            },

            28: (contextId: number, angle: number): void => {
                contexts[contextId].rotate(angle);
            },

            29: (contextId: number, cpx: number, cpy: number, x: number, y: number): void => {
                contexts[contextId].quadraticCurveTo(cpx, cpy, x, y);
            },

            30: (contextId: number, cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void => {
                contexts[contextId].bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
            },

            31: (contextId: number, x: number, y: number, radius: number, startAngle: number, endAngle: number, counterclockwise: Uint1): void => {
                contexts[contextId].arc(x, y, radius, startAngle, endAngle, !!counterclockwise);
            },

            32: (contextId: number, x: number, y: number, radiusX: number, radiusY: number, rotation: number, startAngle: number, endAngle: number, counterclockwise: Uint1): void => {
                contexts[contextId].ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, !!counterclockwise);
            },

            33: (contextId: number, w: number): void => {
                contexts[contextId].lineWidth = w;
            },

            34: (dstContextId: number, srcContextId: number, dx: number, dy: number) => {
                contexts[dstContextId].drawImage(contexts[srcContextId].canvas, dx, dy);
            },

            35: (dstContextId: number, srcContextId: number, dx: number, dy: number) => {
                contexts[dstContextId].drawImage(contexts[srcContextId].canvas, dx, dy, 1, 1);
            },

            36: (dstContextId: number, srcContextId: number, dx: number, dy: number, dw: number, dh: number) => {
                contexts[dstContextId].drawImage(contexts[srcContextId].canvas, dx, dy, dw, dh);
            },

            37: (contextId: number, ptr: number, len: number, x: number, y: number): void => {
                contexts[contextId].fillText(decodeString(ptr, len), x, y);
            },

            38: (contextId: number, ptr: number, len: number, x: number, y: number): void => {
                contexts[contextId].strokeText(decodeString(ptr, len), x, y);
            },

            39: (contextId: number, pixel: number) => {
                contexts[contextId].font = "700 " + pixel + "px Game, Microsoft YaHei, sans-serif";
            },

            40: (contextId: number) => {
                contexts[contextId].textAlign = "center";
            },

            41: (contextId: number, ptr: number, len: number): void => {
                contexts[contextId].textAlign = decodeString(ptr, len) as CanvasTextAlign;
            },

            42: (contextId: number) => {
                contexts[contextId].lineCap = "butt";
            },

            43: (contextId: number) => {
                contexts[contextId].lineCap = "round";
            },

            44: (contextId: number) => {
                contexts[contextId].lineCap = "square";
            },

            45: (contextId: number) => {
                contexts[contextId].lineJoin = "round";
            },

            46: (contextId: number) => {
                contexts[contextId].lineJoin = "miter";
            },

            47: (contextId: number, miterLimit: number) => {
                contexts[contextId].miterLimit = miterLimit;
            },

            48: (contextId: number) => {
                contexts[contextId].setLineDash(LINE_DASH_REAL_LINE);
            },

            49: (contextId: number, lineDashOffset: number) => {
                contexts[contextId].lineDashOffset = lineDashOffset;
            },

            50: (contextId: number) => {
                contexts[contextId].globalCompositeOperation = "source-over";
            },

            51: (contextId: number) => {
                contexts[contextId].globalCompositeOperation = "destination-in";
            },

            52: (contextId: number) => {
                contexts[contextId].globalCompositeOperation = "copy";
            },

            53: (contextId: number) => {
                contexts[contextId].globalCompositeOperation = "lighter";
            },

            54: (contextId: number) => {
                contexts[contextId].globalCompositeOperation = "multiply";
            },

            55: (contextId: number, smoothing: Uint1) => {
                contexts[contextId].imageSmoothingEnabled = !!smoothing;
            },

            56: (contextId: number, w: number, h: number) => {
                const canvas = contexts[contextId].canvas;

                canvas.width = w;
                canvas.height = h;
            },

            57: (contextId: number, wPtr: number, hPtr: number) => {
                const canvas = contexts[contextId].canvas;

                HEAPU16[wPtr >> 1] = canvas.width;
                HEAPU16[hPtr >> 1] = canvas.height;
            },

            // End canvas api

            // Begin path2d api

            58: (pathIdToRelease: number) => {
                destroyedPathIds.push(pathIdToRelease);

                paths[pathIdToRelease] = null;
            },

            59: () => {
                const newPath = new Path2D;
                if (0 < destroyedPathIds.length) {
                    const reusePathId = destroyedPathIds.pop();

                    paths[reusePathId] = newPath;

                    return reusePathId;
                }

                paths.push(newPath);

                return paths.length - 1;
            },

            60: (pathId: number, x: number, y: number) => {
                paths[pathId].moveTo(x, y);
            },

            61: (pathId: number, x: number, y: number) => {
                paths[pathId].lineTo(x, y);
            },

            62: (pathId: number, cpx: number, cpy: number, x: number, y: number) => {
                paths[pathId].quadraticCurveTo(cpx, cpy, x, y);
            },

            63: (pathId: number, cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number) => {
                paths[pathId].bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
            },

            64: (pathId: number) => {
                paths[pathId].closePath();
            },

            // End path2d api

            65: (callbackPtr: number) => requestAnimationFrame(table.get(callbackPtr)),
        },
    } as const satisfies WebAssemblyPseudoModule;
}) satisfies PseudoModuleFactory;