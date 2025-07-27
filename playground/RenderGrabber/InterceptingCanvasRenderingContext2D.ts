type MethodKeys<T> = Extract<keyof T, { [K in keyof T]: T[K] extends Function ? K : never }[keyof T]>;

type ContextProperties = Exclude<keyof CanvasRenderingContext2D, MethodKeys<CanvasRenderingContext2D>>;

type PropertyValues = {
    [K in ContextProperties]: CanvasRenderingContext2D[K]
}[ContextProperties];

type AnyFunction = (...args: Array<any>) => any;

type OverloadProps<Overload> = Pick<Overload, keyof Overload>;

type OverloadUnionRecursive<Overload, PartialOverload = unknown> = Overload extends (
    ...args: infer Args
) => infer Return
    ? // Prevent infinite recursion by stopping recursion when TPartialOverload
    // has accumulated all of the TOverload signatures
    PartialOverload extends Overload ? never :
    | OverloadUnionRecursive<
        PartialOverload & Overload,
        PartialOverload & ((...args: Args) => Return) & OverloadProps<Overload>
    >
    | ((...args: Args) => Return)
    : never;

type OverloadUnion<Overload extends AnyFunction> = Exclude<
    OverloadUnionRecursive<
        // The "() => never" signature must be hoisted to the "front" of the
        // intersection, for two reasons: a) because recursion stops when it is
        // encountered, and b) it seems to prevent the collapse of subsequent
        // "compatible" signatures (eg. "() => void" into "(a?: 1) => void"),
        // which gives a direct conversion to a union
        (() => never) & Overload
    >,
    Overload extends () => never ? never : () => never
>;

// Inferring a union of parameter tuples or return types is now possible
type OverloadParameters<T extends AnyFunction> = Parameters<OverloadUnion<T>>;
type OverloadReturnType<T extends AnyFunction> = ReturnType<OverloadUnion<T>>;

type CallableOverloadMethod<T extends AnyFunction> = (...args: OverloadParameters<T>) => OverloadReturnType<T>;

type GetContextMethodParameters<T extends MethodKeys<CanvasRenderingContext2D>> = OverloadParameters<CanvasRenderingContext2D[T]>;

export default class InterceptingCanvasRenderingContext2D implements CanvasRenderingContext2D {
    private pseudoCode: Array<string> = new Array();

    constructor(private backingCtx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) { }

    private toCallableContextOverloadMethod<T extends AnyFunction>(method: T): CallableOverloadMethod<T> {
        return method.bind(this.backingCtx);
    }

    private toProcessedArguments<
        T extends MethodKeys<CanvasRenderingContext2D>,
        U extends GetContextMethodParameters<T> = GetContextMethodParameters<T>,
    >(methodName: T, args: U): U {
        const formattedArgs = args.map((arg: any) => {
            if (window.pathReferences.has(arg)) {
                return `(function(){
                            const path = new Path2D();

                            ${window.pathReferences.get(arg).pseudoCode.join("\n")}

                            return path;
                        })()`;
            }

            return JSON.stringify(arg);
        }).join(", ");

        this.pseudoCode.push(`ctx.${methodName}(${formattedArgs});`);

        return args.map((arg: any) => {
            // Arg is proxied path2d, proceed to get original instance
            if (window.pathReferences.has(arg))
                return window.pathReferences.get(arg).originalPath;

            return arg;
        }) as U;
    }

    private pushSetProperty(property: string, value: PropertyValues) {
        this.pseudoCode.push(`ctx.${property} = ${JSON.stringify(value)};`);
    }

    public generatePseudoCode(): string {
        return this.pseudoCode.join("\n");
    }

    public set fontKerning(value) {
        this.pushSetProperty("fontKerning", value);

        this.backingCtx.fontKerning = value;
    }

    get fontKerning() {
        return this.backingCtx.fontKerning;
    }

    public set fontStretch(value) {
        this.pushSetProperty("fontStretch", value);

        this.backingCtx.fontStretch = value;
    }

    public get fontStretch() {
        return this.backingCtx.fontStretch;
    }

    public set fontVariantCaps(value) {
        this.pushSetProperty("fontVariantCaps", value);

        this.backingCtx.fontVariantCaps = value;
    }

    public get fontVariantCaps() {
        return this.backingCtx.fontVariantCaps;
    }

    public set letterSpacing(value) {
        this.pushSetProperty("letterSpacing", value);

        this.backingCtx.letterSpacing = value;
    }

    public get letterSpacing() {
        return this.backingCtx.letterSpacing;
    }

    public set textRendering(value) {
        this.pushSetProperty("textRendering", value);

        this.backingCtx.textRendering = value;
    }

    public get textRendering() {
        return this.backingCtx.textRendering;
    }

    public set wordSpacing(value) {
        this.pushSetProperty("wordSpacing", value);

        this.backingCtx.wordSpacing = value;
    }

    public get wordSpacing() {
        return this.backingCtx.wordSpacing;
    }

    public get canvas() {
        return <HTMLCanvasElement>(this.backingCtx.canvas);
    }

    public set direction(value) {
        this.pushSetProperty("direction", value);

        this.backingCtx.direction = value;
    }

    public get direction() {
        return this.backingCtx.direction;
    }

    public set fillStyle(value) {
        this.pushSetProperty("fillStyle", value);

        this.backingCtx.fillStyle = value;
    }

    public get fillStyle() {
        return this.backingCtx.fillStyle;
    }

    public set filter(value) {
        this.pushSetProperty("filter", value);

        this.backingCtx.filter = value;
    }

    public get filter() {
        return this.backingCtx.filter;
    }

    public set font(value) {
        this.pushSetProperty("font", value);

        this.backingCtx.font = value;
    }

    public get font() {
        return this.backingCtx.font;
    }

    public set globalAlpha(value) {
        this.pushSetProperty("globalAlpha", value);

        this.backingCtx.globalAlpha = value;
    }

    public get globalAlpha() {
        return this.backingCtx.globalAlpha;
    }

    public set globalCompositeOperation(value) {
        this.pushSetProperty("globalCompositeOperation", value);

        this.backingCtx.globalCompositeOperation = value;
    }

    public get globalCompositeOperation() {
        return this.backingCtx.globalCompositeOperation;
    }

    public set imageSmoothingEnabled(value) {
        this.pushSetProperty("imageSmoothingEnabled", value);

        this.backingCtx.imageSmoothingEnabled = value;
    }

    public get imageSmoothingEnabled() {
        return this.backingCtx.imageSmoothingEnabled;
    }

    public set imageSmoothingQuality(value) {
        this.pushSetProperty("imageSmoothingQuality", value);

        this.backingCtx.imageSmoothingQuality = value;
    }

    public get imageSmoothingQuality() {
        return this.backingCtx.imageSmoothingQuality;
    }

    public set lineCap(value) {
        this.pushSetProperty("lineCap", value);

        this.backingCtx.lineCap = value;
    }

    public get lineCap() {
        return this.backingCtx.lineCap;
    }

    public set lineDashOffset(value) {
        this.pushSetProperty("lineDashOffset", value);

        this.backingCtx.lineDashOffset = value;
    }

    public get lineDashOffset() {
        return this.backingCtx.lineDashOffset;
    }

    public set lineJoin(value) {
        this.pushSetProperty("lineJoin", value);

        this.backingCtx.lineJoin = value;
    }

    public get lineJoin() {
        return this.backingCtx.lineJoin;
    }

    public set lineWidth(value) {
        this.pushSetProperty("lineWidth", value);

        this.backingCtx.lineWidth = value;
    }

    public get lineWidth() {
        return this.backingCtx.lineWidth;
    }

    public set miterLimit(value) {
        this.pushSetProperty("miterLimit", value);

        this.backingCtx.miterLimit = value;
    }

    public get miterLimit() {
        return this.backingCtx.miterLimit;
    }

    public set shadowBlur(value) {
        this.pushSetProperty("shadowBlur", value);

        this.backingCtx.shadowBlur = value;
    }

    public get shadowBlur() {
        return this.backingCtx.shadowBlur;
    }

    public set shadowColor(value) {
        this.pushSetProperty("shadowColor", value);

        this.backingCtx.shadowColor = value;
    }

    public get shadowColor() {
        return this.backingCtx.shadowColor;
    }

    public set shadowOffsetX(value) {
        this.pushSetProperty("shadowOffsetX", value);

        this.backingCtx.shadowOffsetX = value;
    }

    public get shadowOffsetX() {
        return this.backingCtx.shadowOffsetX;
    }

    public set shadowOffsetY(value) {
        this.pushSetProperty("shadowOffsetY", value);

        this.backingCtx.shadowOffsetY = value;
    }

    public get shadowOffsetY() {
        return this.backingCtx.shadowOffsetY;
    }

    public set strokeStyle(value) {
        this.pushSetProperty("strokeStyle", value);

        this.backingCtx.strokeStyle = value;
    }

    public get strokeStyle() {
        return this.backingCtx.strokeStyle;
    }

    public set textAlign(value) {
        this.pushSetProperty("textAlign", value);

        this.backingCtx.textAlign = value;
    }

    public get textAlign() {
        return this.backingCtx.textAlign;
    }

    public set textBaseline(value) {
        this.pushSetProperty("textBaseline", value);

        this.backingCtx.textBaseline = value;
    }

    public get textBaseline() {
        return this.backingCtx.textBaseline;
    }

    public getContextAttributes(...args: GetContextMethodParameters<"getContextAttributes">) {
        return (
            this.backingCtx as CanvasRenderingContext2D
        ).getContextAttributes(...this.toProcessedArguments("getContextAttributes", args));
    }

    public createConicGradient(...args: GetContextMethodParameters<"createConicGradient">) {
        return this.backingCtx.createConicGradient(...this.toProcessedArguments("createConicGradient", args));
    }

    public roundRect(...args: GetContextMethodParameters<"roundRect">) {
        this.toCallableContextOverloadMethod(this.backingCtx.roundRect)(...this.toProcessedArguments("roundRect", args));
    }

    public isContextLost(...args: GetContextMethodParameters<"isContextLost">) {
        return this.backingCtx.isContextLost(...this.toProcessedArguments("isContextLost", args));
    }

    public reset(...args: GetContextMethodParameters<"reset">) {
        this.backingCtx.reset(...this.toProcessedArguments("reset", args));
    }

    public getTransform(...args: GetContextMethodParameters<"getTransform">) {
        return this.backingCtx.getTransform(...this.toProcessedArguments("getTransform", args));
    }

    public arc(...args: GetContextMethodParameters<"arc">) {
        this.backingCtx.arc(...this.toProcessedArguments("arc", args));
    }

    public arcTo(...args: GetContextMethodParameters<"arcTo">) {
        this.backingCtx.arcTo(...this.toProcessedArguments("arcTo", args));
    }

    public beginPath(...args: GetContextMethodParameters<"beginPath">) {
        this.backingCtx.beginPath(...this.toProcessedArguments("beginPath", args));
    }

    public bezierCurveTo(...args: GetContextMethodParameters<"bezierCurveTo">) {
        this.backingCtx.bezierCurveTo(...this.toProcessedArguments("bezierCurveTo", args));
    }

    public clearRect(...args: GetContextMethodParameters<"clearRect">) {
        this.backingCtx.clearRect(...this.toProcessedArguments("clearRect", args));
    }

    public clip(...args: GetContextMethodParameters<"clip">) {
        this.toCallableContextOverloadMethod(this.backingCtx.clip)(...this.toProcessedArguments("clip", args));
    }

    public closePath(...args: GetContextMethodParameters<"closePath">) {
        this.backingCtx.closePath(...this.toProcessedArguments("closePath", args));
    }

    public createImageData(...args: GetContextMethodParameters<"createImageData">) {
        return this.toCallableContextOverloadMethod(this.backingCtx.createImageData)(...this.toProcessedArguments("createImageData", args));
    }

    public createLinearGradient(...args: GetContextMethodParameters<"createLinearGradient">) {
        return this.backingCtx.createLinearGradient(...this.toProcessedArguments("createLinearGradient", args));
    }

    public createPattern(...args: GetContextMethodParameters<"createPattern">) {
        return this.backingCtx.createPattern(...this.toProcessedArguments("createPattern", args));
    }

    public createRadialGradient(...args: GetContextMethodParameters<"createRadialGradient">) {
        return this.backingCtx.createRadialGradient(...this.toProcessedArguments("createRadialGradient", args));
    }

    public drawFocusIfNeeded(...args: GetContextMethodParameters<"drawFocusIfNeeded">) {
        this.toCallableContextOverloadMethod(
            (this.backingCtx as CanvasRenderingContext2D).drawFocusIfNeeded,
        )(...this.toProcessedArguments("drawFocusIfNeeded", args));
    }

    public drawImage(...args: GetContextMethodParameters<"drawImage">) {
        this.toCallableContextOverloadMethod(this.backingCtx.drawImage)(...this.toProcessedArguments("drawImage", args));
    }

    public ellipse(...args: GetContextMethodParameters<"ellipse">) {
        this.backingCtx.ellipse(...this.toProcessedArguments("ellipse", args));
    }

    public fill(...args: GetContextMethodParameters<"fill">) {
        this.toCallableContextOverloadMethod(this.backingCtx.fill)(...this.toProcessedArguments("fill", args));
    }

    public fillRect(...args: GetContextMethodParameters<"fillRect">) {
        this.backingCtx.fillRect(...this.toProcessedArguments("fillRect", args));
    }

    public fillText(...args: GetContextMethodParameters<"fillText">) {
        this.backingCtx.fillText(...this.toProcessedArguments("fillText", args));
    }

    public getImageData(...args: GetContextMethodParameters<"getImageData">) {
        return this.backingCtx.getImageData(...this.toProcessedArguments("getImageData", args));
    }

    public getLineDash(...args: GetContextMethodParameters<"getLineDash">) {
        return this.backingCtx.getLineDash(...this.toProcessedArguments("getLineDash", args));
    }

    public isPointInPath(...args: GetContextMethodParameters<"isPointInPath">) {
        return this.toCallableContextOverloadMethod(this.backingCtx.isPointInPath)(...this.toProcessedArguments("isPointInPath", args));
    }

    public isPointInStroke(...args: GetContextMethodParameters<"isPointInStroke">) {
        return this.toCallableContextOverloadMethod(this.backingCtx.isPointInStroke)(...this.toProcessedArguments("isPointInStroke", args));
    }

    public lineTo(...args: GetContextMethodParameters<"lineTo">) {
        this.backingCtx.lineTo(...this.toProcessedArguments("lineTo", args));
    }

    public measureText(...args: GetContextMethodParameters<"measureText">) {
        return this.backingCtx.measureText(...this.toProcessedArguments("measureText", args));
    }

    public moveTo(...args: GetContextMethodParameters<"moveTo">) {
        this.backingCtx.moveTo(...this.toProcessedArguments("moveTo", args));
    }

    public putImageData(...args: GetContextMethodParameters<"putImageData">) {
        this.toCallableContextOverloadMethod(this.backingCtx.putImageData)(...this.toProcessedArguments("putImageData", args));
    }

    public quadraticCurveTo(...args: GetContextMethodParameters<"quadraticCurveTo">) {
        this.backingCtx.quadraticCurveTo(...this.toProcessedArguments("quadraticCurveTo", args));
    }

    public rect(...args: GetContextMethodParameters<"quadraticCurveTo">) {
        this.backingCtx.rect(...this.toProcessedArguments("rect", args));
    }

    public resetTransform(...args: GetContextMethodParameters<"resetTransform">) {
        this.backingCtx.resetTransform(...this.toProcessedArguments("resetTransform", args));
    }

    public restore(...args: GetContextMethodParameters<"restore">) {
        this.backingCtx.restore(...this.toProcessedArguments("restore", args));
    }

    public rotate(...args: GetContextMethodParameters<"rotate">) {
        this.backingCtx.rotate(...this.toProcessedArguments("rotate", args));
    }

    public save(...args: GetContextMethodParameters<"save">) {
        this.backingCtx.save(...this.toProcessedArguments("save", args));
    }

    public scale(...args: GetContextMethodParameters<"scale">) {
        this.backingCtx.scale(...this.toProcessedArguments("scale", args));
    }

    public setLineDash(...args: GetContextMethodParameters<"setLineDash">) {
        this.toCallableContextOverloadMethod(this.backingCtx.setLineDash)(...this.toProcessedArguments("setLineDash", args));
    }

    public setTransform(...args: GetContextMethodParameters<"setTransform">) {
        this.toCallableContextOverloadMethod(this.backingCtx.setTransform)(...this.toProcessedArguments("setTransform", args));
    }

    public stroke(...args: GetContextMethodParameters<"stroke">) {
        this.toCallableContextOverloadMethod(this.backingCtx.stroke)(...this.toProcessedArguments("stroke", args));
    }

    public strokeRect(...args: GetContextMethodParameters<"strokeRect">) {
        this.backingCtx.strokeRect(...this.toProcessedArguments("strokeRect", args));
    }

    public strokeText(...args: GetContextMethodParameters<"strokeText">) {
        this.backingCtx.strokeText(...this.toProcessedArguments("strokeText", args));
    }

    public transform(...args: GetContextMethodParameters<"transform">) {
        this.backingCtx.transform(...this.toProcessedArguments("transform", args));
    }

    public translate(...args: GetContextMethodParameters<"translate">) {
        this.backingCtx.translate(...this.toProcessedArguments("translate", args));
    }
}