
import { getWebAssemblyFunction, HEAP16, HEAP32, HEAPF64, malloc, decodeCString } from "../../../Application";
import { eventManager } from "./EventApiPseudoModuleEventManager";
import type WebAssemblyPseudoModule from "./PseudoModule";
import type { PseudoModuleFactory, PseudoModuleFactoryArguments } from "./PseudoModule";

// Event handling state
let currentEvent: Event | null = null;

const eventListeners = new Map<number, (e: Event) => void>();
const eventTargets = new Set<EventTarget>();

const enum ZigEventType {
    DRAG,
    FOCUS,
    INPUT,
    KEY,
    MOUSE,
    POINTER,
    RESIZE,
    SCROLL,
    TOUCH,
    WHEEL,
}

const ZIG_EVENT_TYPE_TO_EVENT_TYPE = {
    [ZigEventType.DRAG]: "drag",
    [ZigEventType.FOCUS]: "focus",
    [ZigEventType.INPUT]: "input",
    [ZigEventType.KEY]: "key",
    [ZigEventType.MOUSE]: "mouse",
    [ZigEventType.POINTER]: "pointer",
    [ZigEventType.RESIZE]: "resize",
    [ZigEventType.SCROLL]: "scroll",
    [ZigEventType.TOUCH]: "touch",
    [ZigEventType.WHEEL]: "wheel",
} as const satisfies Record<ZigEventType, string>;

const enum GlobalEventTargetType {
    DOCUMENT,
    WINDOW,
}

const PSEUDO_GLOBAL_EVENT_TARGETS = [document, window];

type TargetableValue = GlobalEventTargetType | number;

function resolveEventTarget(targetIdentifier: TargetableValue): EventTarget | Element {
    const identifier = targetIdentifier > 2
        ? decodeCString(targetIdentifier)
        : targetIdentifier;

    return PSEUDO_GLOBAL_EVENT_TARGETS[identifier] ||
        document.querySelector(identifier as string);
}

function getElementBoundingRect(target: EventTarget | Element): DOMRect {
    const isGlobalTarget = PSEUDO_GLOBAL_EVENT_TARGETS.includes(target as any);

    return isGlobalTarget
        ? {
            left: 0,
            top: 0,
        } as DOMRect
        : (target as Element).getBoundingClientRect();
}

function writeMouseEventToMemory(
    memoryPtr: number,
    event: MouseEvent,
    target: EventTarget | Element,
) {
    HEAPF64[memoryPtr >> 3] = event.timeStamp;

    memoryPtr >>= 2;

    HEAP32[memoryPtr + 2] = event.screenX;
    HEAP32[memoryPtr + 3] = event.screenY;

    HEAP32[memoryPtr + 4] = event.clientX;
    HEAP32[memoryPtr + 5] = event.clientY;

    HEAP32[memoryPtr + 6] = +event.ctrlKey;
    HEAP32[memoryPtr + 7] = +event.shiftKey;
    HEAP32[memoryPtr + 8] = +event.altKey;
    HEAP32[memoryPtr + 9] = +event.metaKey;

    HEAP16[2 * memoryPtr + 20] = event.button;
    HEAP16[2 * memoryPtr + 21] = event.buttons;

    HEAP32[memoryPtr + 11] = event.movementX;
    HEAP32[memoryPtr + 12] = event.movementY;

    const rect = getElementBoundingRect(target);
    HEAP32[memoryPtr + 13] = event.clientX - rect.left;
    HEAP32[memoryPtr + 14] = event.clientY - rect.top;
}

let mouseEventMemoryPtr: number | null = null;

function addMouseEventListener(
    targetIdentifier: TargetableValue,
    element: Element,
    options: boolean | AddEventListenerOptions,
    enable: number,
    eventIdentifier: number,
    eventName: string,
) {
    mouseEventMemoryPtr ??= malloc(72);

    const target = resolveEventTarget(targetIdentifier);

    eventManager.addEventListener({
        target,
        eventName,
        enable,
        callback: function (e) {
            e = e || event;

            writeMouseEventToMemory(mouseEventMemoryPtr, e as MouseEvent, target);

            getWebAssemblyFunction(enable)(eventIdentifier, mouseEventMemoryPtr, element) && e.preventDefault();
        },
        options,
    });
}

export const createEventApiPseudoModule = ((...[, {
    getWebAssemblyFunction,
    decodeCString: readCString,
}]: PseudoModuleFactoryArguments): WebAssemblyPseudoModule => {
    return {
        moduleName: "1",
        moduleImports: {
            0: (globalEventTargetType: GlobalEventTargetType, eventType: ZigEventType, listenerId: number) => {
                const target = PSEUDO_GLOBAL_EVENT_TARGETS[globalEventTargetType];

                const eventName = ZIG_EVENT_TYPE_TO_EVENT_TYPE[eventType];

                const wasmListener = getWebAssemblyFunction(listenerId);

                const listener = (e: Event) => {
                    currentEvent = e;

                    wasmListener({});

                    currentEvent = null;
                };

                eventListeners.set(listenerId, listener);
                target.addEventListener(eventName, listener);

                eventTargets.add(target);
            },

            1: (ptr: number, eventType: ZigEventType, listenerId: number) => {
                const target = document.getElementById(readCString(ptr));

                const eventName = ZIG_EVENT_TYPE_TO_EVENT_TYPE[eventType];

                const wasmListener = getWebAssemblyFunction(listenerId);

                const listener = (e: Event) => {
                    currentEvent = e;

                    wasmListener({});

                    currentEvent = null;
                };

                eventListeners.set(listenerId, listener);
                target.addEventListener(eventName, listener);

                eventTargets.add(target);
            },

            // Remove event listener
            2: (listenerId: number) => {
                const listener = eventListeners.get(listenerId);
                if (listener) {
                    // Remove from all possible targets since we dont track which target it was added to
                    eventTargets.forEach(target => {
                        target.removeEventListener("*", listener);
                    });

                    eventListeners.delete(listenerId);
                }
            },

            // preventDefault
            3: () => {
                currentEvent?.preventDefault();
            },

            // stopPropagation
            4: () => {
                currentEvent?.stopPropagation();
            },

            // stopImmediatePropagation
            5: () => {
                currentEvent?.stopImmediatePropagation();
            },
        },
    } as const satisfies WebAssemblyPseudoModule;
}) satisfies PseudoModuleFactory;