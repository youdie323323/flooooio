
import { getWebAssemblyFunction, HEAP16, HEAP32, HEAPF64, malloc, decodeCString } from "../../../Application";
import { eventManager } from "./EventApiPseudoModuleEventManager";
import type WebAssemblyPseudoModule from "./PseudoModule";
import type { PseudoModuleFactory, PseudoModuleFactoryArguments } from "./PseudoModule";

const enum GlobalEventTargetType {
    DOCUMENT,
    WINDOW,
}

const PSEUDO_GLOBAL_EVENT_TARGETS = [document, window];

type EventTargetIdentifier = GlobalEventTargetType | number /* Pointer */;

function getEventTarget(targetIdentifier: EventTargetIdentifier): EventTarget | Element {
    return targetIdentifier > 1
        ? document.querySelector(decodeCString(targetIdentifier))
        : PSEUDO_GLOBAL_EVENT_TARGETS[targetIdentifier];
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

const enum MouseEventIdentifier {
    DOWN = 5,
    ENTER = 33,
    LEAVE = 34,
    MOVE = 8,
    UP = 6,
}

let mouseEventPtr: number | null = null;

function addMouseEventListener(
    targetIdentifier: EventTargetIdentifier,
    useCapture: boolean,
    pointerOrRemoveListener: number,
    eventIdentifier: MouseEventIdentifier,
    eventName: string,
) {
    mouseEventPtr ??= malloc(72);

    const target = getEventTarget(targetIdentifier);

    eventManager.addOrRemoveEventListener({
        target,
        eventName,
        pointerOrRemoveListener,
        callback(e) {
            e = e || event;

            writeMouseEventToMemory(mouseEventPtr, e as MouseEvent, target);

            // Here, using pointerOremoveListener as pointer is no problem, because removing listener wont require callback
            getWebAssemblyFunction(pointerOrRemoveListener)(eventIdentifier, mouseEventPtr) &&
                e.preventDefault();
        },
        useCapture,
    });
}

export const createEventApiPseudoModule = ((...[]: PseudoModuleFactoryArguments): WebAssemblyPseudoModule => {
    return {
        moduleName: "1",
        moduleImports: {
            0: (targetIdentifier: EventTargetIdentifier, useCapture: boolean, pointerOrRemoveListener: number) => {
                // Ja(a, b, c, d, 5, "mousedown", e);

                addMouseEventListener(targetIdentifier, useCapture, pointerOrRemoveListener, MouseEventIdentifier.DOWN, "mousedown");
            },
            
            1: (targetIdentifier: EventTargetIdentifier, useCapture: boolean, pointerOrRemoveListener: number) => {
                // Ja(a, b, c, d, 33, "mouseenter", e);

                addMouseEventListener(targetIdentifier, useCapture, pointerOrRemoveListener, MouseEventIdentifier.ENTER, "mouseenter");
            },

            2: (targetIdentifier: EventTargetIdentifier, useCapture: boolean, pointerOrRemoveListener: number) => {
                // Ja(a, b, c, d, 34, "mouseleave", e);

                addMouseEventListener(targetIdentifier, useCapture, pointerOrRemoveListener, MouseEventIdentifier.LEAVE, "mouseleave");
            },

            3: (targetIdentifier: EventTargetIdentifier, useCapture: boolean, pointerOrRemoveListener: number) => {
                // Ja(a, b, c, d, 8, "mousemove", e);

                addMouseEventListener(targetIdentifier, useCapture, pointerOrRemoveListener, MouseEventIdentifier.MOVE, "mousemove");
            },

            4: (targetIdentifier: EventTargetIdentifier, useCapture: boolean, pointerOrRemoveListener: number) => {
                // Ja(a, b, c, d, 6, "mouseup", e);

                addMouseEventListener(targetIdentifier, useCapture, pointerOrRemoveListener, MouseEventIdentifier.UP, "mouseup");
            },
        },
    } as const satisfies WebAssemblyPseudoModule;
}) satisfies PseudoModuleFactory;