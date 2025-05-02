import type WebAssemblyPseudoModule from "./WebAssemblyPseudoModule";
import type { PseudoModuleFactory, PseudoModuleFactoryArguments } from "./WebAssemblyPseudoModule";

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

const swapKeyValue = <K extends PropertyKey, V extends PropertyKey>(
    object: Record<K, V>,
): Record<V, K> =>
    Object.entries(object)
        .reduce((swapped, [key, value]) => (
            { ...swapped, [value as PropertyKey]: key }
        ), {} as Record<V, K>);

const EVENT_TYPE_TO_ZIG_EVENT_TYPE = swapKeyValue(ZIG_EVENT_TYPE_TO_EVENT_TYPE);

const enum ZigMouseButton {
    NONE = 0,
    PRIMARY = 1,
    SECONDARY = 2,
    MIDDLE = 4,
}

interface ZigEvent {
    type: ZigEventType;
    body: Partial<Record<string, any>>;
}

// Helper to convert DOM event to WASM event structure
function createWasmEvent(e: Event): ZigEvent {
    const event: ZigEvent = {
        type: EVENT_TYPE_TO_ZIG_EVENT_TYPE[e.type],
        body: {} as any,
    } satisfies ZigEvent;

    switch (event.type) {
        case ZigEventType.DRAG:
            if (e instanceof DragEvent) {
                event.body.drag = {
                    clientX: e.clientX,
                    clientY: e.clientY,
                    isDataTransfer: e.dataTransfer ? 1 : 0,
                    modifiers: getModifiers(e),
                    buttons: e.buttons,
                    button: getMouseButton(e.button),
                };
            }

            break;

        case ZigEventType.INPUT:
            if (e instanceof InputEvent) {
                const target = e.target as HTMLInputElement;
                event.body.input = {
                    value: target.value,
                    len: target.value.length,
                };
            }

            break;

        case ZigEventType.KEY:
            if (e instanceof KeyboardEvent) {
                event.body.key = {
                    key: e.key.slice(0, 15),
                    len: Math.min(e.key.length, 15),
                    modifiers: getModifiers(e),
                    repeat: e.repeat ? 1 : 0,
                };
            }

            break;
    }

    return event;
}

function getModifiers(e: MouseEvent | KeyboardEvent): number {
    let modifiers = 0;

    if (e.shiftKey) modifiers |= 1;
    if (e.ctrlKey) modifiers |= 2;
    if (e.altKey) modifiers |= 4;
    if (e.metaKey) modifiers |= 8;

    return modifiers;
}

function getMouseButton(button: number): ZigMouseButton {
    switch (button) {
        case 0: return ZigMouseButton.PRIMARY;

        case 1: return ZigMouseButton.MIDDLE;

        case 2: return ZigMouseButton.SECONDARY;

        default: return ZigMouseButton.NONE;
    }
}

export const createEventApiPseudoModule = ((...[{ table }, { decodeString }]: PseudoModuleFactoryArguments): WebAssemblyPseudoModule => {
    return {
        moduleName: "1",
        moduleImports: {
            0: (globalEventTargetType: number, eventType: ZigEventType, listenerId: number) => {
                const target = getGlobalEventTarget(globalEventTargetType);

                const eventName = ZIG_EVENT_TYPE_TO_EVENT_TYPE[eventType];

                const wasmListener = table.get(listenerId);

                const listener = (e: Event) => {
                    currentEvent = e;

                    wasmListener(createWasmEvent(e));

                    currentEvent = null;
                };

                eventListeners.set(listenerId, listener);
                target.addEventListener(eventName, listener);

                eventTargets.add(target);
            },

            1: (ptr: number, len: number, eventType: ZigEventType, listenerId: number) => {
                const targetId = decodeString(ptr, len);
                const target = document.getElementById(targetId);

                const eventName = ZIG_EVENT_TYPE_TO_EVENT_TYPE[eventType];

                const wasmListener = table.get(listenerId);

                const listener = (e: Event) => {
                    currentEvent = e;

                    wasmListener(createWasmEvent(e));

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

// Helper functions
function getGlobalEventTarget(identifier: number): EventTarget {
    switch (identifier) {
        case 0: return window;

        case 1: return document.head;

        case 2: return document.body;

        default: throw new Error("Invalid event target identifier");
    }
}