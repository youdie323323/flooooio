interface EventHandler {
    target: EventTarget;
    eventName: string;
    callback: (event: Event) => void;
    useCapture: boolean;
}

interface PendingAction {
    action: Function;
    priority: number;
    args: Array<any>;
}

export default class EventManager {
    private activeCallbacks: number = 0;
    private isSetupComplete: boolean = false;
    private activeEventHandler: EventHandler | null = null;
    private registeredListeners: Array<EventHandler> = new Array();
    private pendingActions: Array<PendingAction> = new Array();
    private cleanupHandlers: Array<Function> = new Array();

    constructor() {
        this.initializeCleanup = this.initializeCleanup.bind(this);
    }

    private initializeCleanup(): void {
        for (let i = this.registeredListeners.length - 1; i >= 0; --i) {
            this.detachListener(i);
        }

        this.registeredListeners = new Array();
        this.pendingActions = new Array();
    }

    public setupCleanup(): void {
        if (!this.isSetupComplete) {
            this.cleanupHandlers.push(this.initializeCleanup);
            this.isSetupComplete = true;
        }
    }

    public scheduleAction(action: Function, priority: number, args: Array<any>): void {
        const isDuplicate = this.pendingActions.some(
            item => item.action === action && this.arraysEqual(item.args, args),
        );

        if (!isDuplicate) {
            this.pendingActions.push({
                action,
                priority,
                args,
            });

            this.pendingActions.sort((a, b) => b.priority - a.priority);
        }
    }

    private arraysEqual(arr1: Array<any>, arr2: Array<any>): boolean {
        if (arr1.length !== arr2.length) return false;

        return arr1.every((value, index) => value === arr2[index]);
    }

    public removePendingActionsByAction(action: Function): void {
        this.pendingActions = this.pendingActions.filter(item => item.action !== action);
    }

    public hasActiveEvent(): boolean {
        return this.activeCallbacks > 0 && this.activeEventHandler != null;
    }

    public runPendingActions(): void {
        if (this.hasActiveEvent()) {
            for (const item of this.pendingActions) {
                item.action.apply(null, item.args);

                this.pendingActions = this.pendingActions.filter(x => x !== item);
            }
        }
    }

    public clearListenersByTarget(target: EventTarget, eventName?: string): void {
        for (let i = 0; i < this.registeredListeners.length; i++) {
            const listener = this.registeredListeners[i];

            if (listener.target === target && (!eventName || eventName === listener.eventName)) {
                this.detachListener(i--);
            }
        }
    }

    private detachListener(index: number): void {
        const {
            target,
            eventName,
            callback,
            useCapture,
        } = this.registeredListeners[index];

        target.removeEventListener(
            eventName,
            callback,
            useCapture,
        );

        this.registeredListeners.splice(index, 1);
    }

    public addOrRemoveEventListener(handler: EventHandler & { ptrOrRemoveListener: number }): void {
        const wrappedCallback = (event: Event) => {
            ++this.activeCallbacks;

            this.activeEventHandler = handler;

            this.runPendingActions();

            handler.callback(event);

            this.runPendingActions();

            --this.activeCallbacks;
        };

        if (handler.ptrOrRemoveListener) {
            handler.target.addEventListener(handler.eventName, wrappedCallback, handler.useCapture);

            this.registeredListeners.push({
                target: handler.target,
                eventName: handler.eventName,
                callback: wrappedCallback,
                useCapture: handler.useCapture,
            });

            this.setupCleanup();
        } else {
            this.clearListenersByTarget(handler.target, handler.eventName);
        }
    }

    public describeTarget(target: any): string {
        if (!target) return "";
        if (target === window) return "#window";
        if (target === screen) return "#screen";

        return target.nodeName || "";
    }

    public fullscreenEnabled(): boolean {
        return document.fullscreenEnabled || (document as any).webkitFullscreenEnabled;
    }
}

export const eventManager = new EventManager;