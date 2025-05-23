interface EventHandler {
    target: EventTarget;
    eventName: string;
    callback: (event: Event) => void;
    options: boolean | AddEventListenerOptions;
}

interface DeferredAction {
    action: Function;
    priority: number;
    args: Array<any>;
}

export default class EventManager {
    private activeCallbacks: number = 0;
    private isSetupComplete: boolean = false;
    private currentEvent: EventHandler | null = null;
    private eventListeners: Array<EventHandler> = new Array();
    private deferredActions: Array<DeferredAction> = new Array();
    private cleanupCallbacks: Array<Function> = new Array();

    constructor() {
        this.cleanup = this.cleanup.bind(this);
    }

    private cleanup(): void {
        for (let i = this.eventListeners.length - 1; i >= 0; --i) {
            this.removeEventListener(i);
        }

        this.eventListeners = new Array();
        this.deferredActions = new Array();
    }

    public setupCleanup(): void {
        if (!this.isSetupComplete) {
            this.cleanupCallbacks.push(this.cleanup);
            this.isSetupComplete = true;
        }
    }

    public addDeferredAction(action: Function, priority: number, args: Array<any>): void {
        const isDuplicate = this.deferredActions.some(
            item => item.action === action && this.areArraysEqual(item.args, args),
        );

        if (!isDuplicate) {
            this.deferredActions.push({
                action,
                priority,
                args,
            });

            this.deferredActions.sort((a, b) => b.priority - a.priority);
        }
    }

    private areArraysEqual(arr1: Array<any>, arr2: Array<any>): boolean {
        if (arr1.length !== arr2.length) return false;

        return arr1.every((value, index) => value === arr2[index]);
    }

    public removeDeferredActionsByFunction(action: Function): void {
        this.deferredActions = this.deferredActions.filter(item => item.action !== action);
    }

    public isProcessingEvent(): boolean {
        return this.activeCallbacks > 0 && this.currentEvent != null;
    }

    public executeDeferredActions(): void {
        if (this.isProcessingEvent()) {
            for (const item of this.deferredActions) {
                item.action.apply(null, item.args);

                this.deferredActions = this.deferredActions.filter(x => x !== item);
            }
        }
    }

    public removeEventListenersByTarget(target: EventTarget, eventName?: string): void {
        for (let i = 0; i < this.eventListeners.length; i++) {
            const listener = this.eventListeners[i];

            if (listener.target === target && (!eventName || eventName === listener.eventName)) {
                this.removeEventListener(i--);
            }
        }
    }

    private removeEventListener(index: number): void {
        const {
            target,
            eventName,
            callback,
            options,
        } = this.eventListeners[index];

        target.removeEventListener(
            eventName,
            callback,
            options,
        );

        this.eventListeners.splice(index, 1);
    }

    public addEventListener(handler: EventHandler & { enable: number | boolean }): void {
        const wrappedCallback = (event: Event) => {
            ++this.activeCallbacks;

            this.currentEvent = handler;

            this.executeDeferredActions();

            handler.callback(event);

            this.executeDeferredActions();

            --this.activeCallbacks;
        };

        if (handler.enable) {
            handler.target.addEventListener(handler.eventName, wrappedCallback, handler.options);

            this.eventListeners.push({
                target: handler.target,
                eventName: handler.eventName,
                callback: wrappedCallback,
                options: handler.options,
            });

            this.setupCleanup();
        } else {
            this.removeEventListenersByTarget(handler.target, handler.eventName);
        }
    }

    public getTargetDescription(target: any): string {
        if (!target) return "";
        if (target === window) return "#window";
        if (target === screen) return "#screen";

        return target.nodeName || "";
    }

    public isFullscreenEnabled(): boolean {
        return document.fullscreenEnabled || (document as any).webkitFullscreenEnabled;
    }
}

export const eventManager = new EventManager;