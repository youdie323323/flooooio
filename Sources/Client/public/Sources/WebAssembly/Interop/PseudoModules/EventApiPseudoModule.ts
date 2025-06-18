
import { getWebAssemblyFunction, HEAP16, HEAP32, HEAPF64, malloc, decodeCString } from "../../../Application";
import { eventManager } from "./EventApiPseudoModuleEventManager";
import type WebAssemblyPseudoModule from "./PseudoModule";
import type { PseudoModuleFactory, PseudoModuleFactoryArguments } from "./PseudoModule";

const enum GlobalEventTargetType {
    DOCUMENT,
    WINDOW,
}

const PSEUDO_GLOBAL_EVENT_TARGETS = [document, window];

type EventTargetType = GlobalEventTargetType | number /* Pointer */;

function getEventTarget(eventTargetType: EventTargetType): EventTarget | Element {
    return eventTargetType > 1
        ? document.querySelector(decodeCString(eventTargetType))
        : PSEUDO_GLOBAL_EVENT_TARGETS[eventTargetType];
}

function getElementBounds(target: EventTarget | Element): DOMRect {
    const isGlobalTarget = PSEUDO_GLOBAL_EVENT_TARGETS.includes(target as any);

    return isGlobalTarget
        ? {
            left: 0,
            top: 0,
        } as DOMRect
        : (target as Element).getBoundingClientRect();
}

const enum EventType {
    MOUSE_DOWN = 5,
    MOUSE_ENTER = 33,
    MOUSE_LEAVE = 34,
    MOUSE_MOVE = 8,
    MOUSE_UP = 6,

    SCREEN_RESIZE = 10,
}

function writeMouseEventToMemory(
    ptr: number,
    event: MouseEvent,
    target: EventTarget | Element,
) {
    HEAPF64[ptr >> 3] = event.timeStamp;

    ptr >>= 2;

    HEAP32[ptr + 2] = event.screenX;
    HEAP32[ptr + 3] = event.screenY;

    HEAP32[ptr + 4] = event.clientX;
    HEAP32[ptr + 5] = event.clientY;

    HEAP32[ptr + 6] = +event.ctrlKey;
    HEAP32[ptr + 7] = +event.shiftKey;
    HEAP32[ptr + 8] = +event.altKey;
    HEAP32[ptr + 9] = +event.metaKey;

    HEAP16[2 * ptr + 20] = event.button;
    HEAP16[2 * ptr + 21] = event.buttons;

    HEAP32[ptr + 11] = event.movementX;
    HEAP32[ptr + 12] = event.movementY;

    const rect = getElementBounds(target);

    HEAP32[ptr + 13] = event.clientX - rect.left;
    HEAP32[ptr + 14] = event.clientY - rect.top;
}

let mouseEventPtr: number | null = null;

function addMouseEventListener(
    eventTargetType: EventTargetType,
    useCapture: boolean,
    ptrOrRemoveListener: number,
    eventType: EventType,
    eventName: string,
) {
    mouseEventPtr ??= malloc(72);

    const target = getEventTarget(eventTargetType);

    eventManager.addOrRemoveEventListener({
        target,
        eventName,
        ptrOrRemoveListener,
        callback(e) {
            e = e || event;

            writeMouseEventToMemory(mouseEventPtr, e as MouseEvent, target);

            // Here, using pointerOremoveListener as pointer is no problem, because removing listener wont require callback
            getWebAssemblyFunction(ptrOrRemoveListener)(eventType, mouseEventPtr) &&
                e.preventDefault();
        },
        useCapture,
    });
}

let screenEventPtr: number | null = null;

function addScreenEventListener(
    eventTargetType: EventTargetType,
    useCapture: boolean,
    ptrOrRemoveListener: number,
    eventType: EventType,
    eventName: string,
) {
    screenEventPtr ??= malloc(36);

    const target = getEventTarget(eventTargetType);

    eventManager.addOrRemoveEventListener({
        target,
        eventName,
        ptrOrRemoveListener,
        callback(e) {
            e = e || event;

            if (e.target == target) {
                const body = document.body;
                if (body) {
                    HEAP32[screenEventPtr >> 2] = (<UIEvent>e).detail;

                    HEAP32[screenEventPtr + 4 >> 2] = body.clientWidth;
                    HEAP32[screenEventPtr + 8 >> 2] = body.clientHeight;

                    HEAP32[screenEventPtr + 12 >> 2] = innerWidth;
                    HEAP32[screenEventPtr + 16 >> 2] = innerHeight;

                    HEAP32[screenEventPtr + 20 >> 2] = outerWidth;
                    HEAP32[screenEventPtr + 24 >> 2] = outerHeight;

                    HEAP32[screenEventPtr + 28 >> 2] = pageXOffset;
                    HEAP32[screenEventPtr + 32 >> 2] = pageYOffset;

                    // Here, using pointerOremoveListener as pointer is no problem, because removing listener wont require callback
                    getWebAssemblyFunction(ptrOrRemoveListener)(eventType, screenEventPtr) &&
                        e.preventDefault();
                }
            }
        },
        useCapture,
    });
}

export const createEventApiPseudoModule = ((...[]: PseudoModuleFactoryArguments): WebAssemblyPseudoModule => {
    return {
        moduleName: "1",
        moduleImports: {
            0: (eventTargetType: EventTargetType, useCapture: boolean, ptrOrRemoveListener: number) => {
                // Ja(a, b, c, d, 5, "mousedown", e);

                addMouseEventListener(eventTargetType, useCapture, ptrOrRemoveListener, EventType.MOUSE_DOWN, "mousedown");
            },

            1: (eventTargetType: EventTargetType, useCapture: boolean, ptrOrRemoveListener: number) => {
                // Ja(a, b, c, d, 33, "mouseenter", e);

                addMouseEventListener(eventTargetType, useCapture, ptrOrRemoveListener, EventType.MOUSE_ENTER, "mouseenter");
            },

            2: (eventTargetType: EventTargetType, useCapture: boolean, ptrOrRemoveListener: number) => {
                // Ja(a, b, c, d, 34, "mouseleave", e);

                addMouseEventListener(eventTargetType, useCapture, ptrOrRemoveListener, EventType.MOUSE_LEAVE, "mouseleave");
            },

            3: (eventTargetType: EventTargetType, useCapture: boolean, ptrOrRemoveListener: number) => {
                // Ja(a, b, c, d, 8, "mousemove", e);

                addMouseEventListener(eventTargetType, useCapture, ptrOrRemoveListener, EventType.MOUSE_MOVE, "mousemove");
            },

            4: (eventTargetType: EventTargetType, useCapture: boolean, ptrOrRemoveListener: number) => {
                // Ja(a, b, c, d, 6, "mouseup", e);

                addMouseEventListener(eventTargetType, useCapture, ptrOrRemoveListener, EventType.MOUSE_UP, "mouseup");
            },

            5: (eventTargetType: EventTargetType, useCapture: boolean, ptrOrRemoveListener: number) => {
                // bd(a, b, c, d, 10, "resize", e);

                addScreenEventListener(eventTargetType, useCapture, ptrOrRemoveListener, EventType.SCREEN_RESIZE, "resize");
            },
        },
    } as const satisfies WebAssemblyPseudoModule;
}) satisfies PseudoModuleFactory;