import ProxiedCanvasRenderingContext2D from "./ProxiedCanvasRenderingContext2D";

declare global {
    interface Window {
        pathReferences: WeakMap<Path2D, {
            pseudoCode: Array<string>;
            originalPath: Path2D;
        }>;
    }
}

window.pathReferences = new WeakMap();

const OriginalPath2D = window.Path2D;
const OriginalOffscreenCanvas = window.OffscreenCanvas;

Object.defineProperty(window, "Path2D", {
    value: function (...args: Array<any>) {
        const path = new OriginalPath2D(...args);

        const proxied = new Proxy(path, {
            get(target, prop, receiver) {
                const value = target[prop];

                if (typeof value === "function") {
                    return function (...args: Array<any>) {
                        const { pseudoCode } = window.pathReferences.get(proxied);

                        const formattedArgs = args.map((arg: any) => JSON.stringify(arg)).join(", ");
                        pseudoCode.push(`path.${String(prop)}(${formattedArgs});`);

                        return value.apply(target, args);
                    };
                }

                return value;
            },
        });

        window.pathReferences.set(proxied, {
            pseudoCode: [],
            // The reason store of original instances, canvas methods with path2d arguments only accept native-objects (mean cant be proxied)
            originalPath: path,
        });

        return proxied;
    },
});

function createProxiedOffscreenCanvas(original: OffscreenCanvas): OffscreenCanvas {
    return new Proxy(original, {
        get(target: OffscreenCanvas, prop: string | symbol) {
            if (prop === "getContext") {
                return function (contextType: "2d", options?: any) {
                    const ctx = target.getContext(contextType, options);
                    if (contextType === "2d") {
                        return new ProxiedCanvasRenderingContext2D(ctx as OffscreenCanvasRenderingContext2D);
                    }

                    return ctx;
                };
            }

            return Reflect.get(target, prop);
        },
    });
}

Object.defineProperty(window, "OffscreenCanvas", {
    value: function (width: number, height: number) {
        const canvas = new OriginalOffscreenCanvas(width, height);

        return createProxiedOffscreenCanvas(canvas);
    },
});

const originalGetContext = HTMLCanvasElement.prototype.getContext;
HTMLCanvasElement.prototype.getContext = function (contextType: string, ...args: Array<any>): any {
    const ctx = originalGetContext.call(this, contextType, ...args);
    if (contextType === "2d") {
        return new ProxiedCanvasRenderingContext2D(ctx as CanvasRenderingContext2D) as CanvasRenderingContext2D;
    }

    return ctx;
};