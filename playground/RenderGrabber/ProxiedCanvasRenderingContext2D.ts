type MethodKeys<T> = Extract<keyof T, { [K in keyof T]: T[K] extends Function ? K : never }[keyof T]>;

type OverloadProps<TOverload> = Pick<TOverload, keyof TOverload>;

type OverloadUnionRecursive<TOverload, TPartialOverload = unknown> = TOverload extends (
    ...args: infer TArgs
) => infer TReturn
    ? // Prevent infinite recursion by stopping recursion when TPartialOverload
    // has accumulated all of the TOverload signatures
    TPartialOverload extends TOverload
    ? never
    :
    | OverloadUnionRecursive<
        TPartialOverload & TOverload,
        TPartialOverload & ((...args: TArgs) => TReturn) & OverloadProps<TOverload>
    >
    | ((...args: TArgs) => TReturn)
    : never;

type OverloadUnion<TOverload extends (...args: any[]) => any> = Exclude<
    OverloadUnionRecursive<
        // The "() => never" signature must be hoisted to the "front" of the
        // intersection, for two reasons: a) because recursion stops when it is
        // encountered, and b) it seems to prevent the collapse of subsequent
        // "compatible" signatures (eg. "() => void" into "(a?: 1) => void"),
        // which gives a direct conversion to a union
        (() => never) & TOverload
    >,
    TOverload extends () => never ? never : () => never
>;

// Inferring a union of parameter tuples or return types is now possible
type OverloadParameters<T extends (...args: any[]) => any> = Parameters<OverloadUnion<T>>;
type OverloadReturnType<T extends (...args: any[]) => any> = ReturnType<OverloadUnion<T>>;

export type GetContextMethodParameters<T extends MethodKeys<CanvasRenderingContext2D>> = OverloadParameters<CanvasRenderingContext2D[T]>;

export default class ProxiedCanvasRenderingContext2D implements CanvasRenderingContext2D {
    private pseudoCode: string[] = [];

    constructor(private context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) { }

    public generatePseudoCode(): string {
        return this.pseudoCode.join("\n");
    }

    private toCallableContextOverloadMethod<T extends (...args: any[]) => any>(
        m: T
    ): (...args: OverloadParameters<T>) => OverloadReturnType<T> {
        return m.bind(this.context);
    }

    private processArgs<
        T extends MethodKeys<CanvasRenderingContext2D>,
        U extends GetContextMethodParameters<T> = GetContextMethodParameters<T>,
    >(methodName: T, args: U): U {
        const formattedArgs = args.map(arg => window.path2DInformation.has(arg) ?
            `(function(){
                const path = new Path2D();
                ${window.path2DInformation.get(arg).pseudoCode.join("\n")}
                return path;
            })()` :
            JSON.stringify(arg)
        ).join(", ");

        this.pseudoCode.push(`ctx.${methodName}(${formattedArgs});`);

        return args.map(arg => {
            // Arg is proxied path2d, proceed to get original instance
            if (window.path2DInformation.has(arg)) {
                return window.path2DInformation.get(arg).originalInstance;
            }

            return arg;
        }) as U;
    }

    private logSetter(prop: string, value: any) {
        this.pseudoCode.push(`ctx.${prop} = ${JSON.stringify(value)};`);
    }

    set fontKerning(value) {
        this.logSetter("fontKerning", value);

        this.context.fontKerning = value;
    }
    get fontKerning() {
        return this.context.fontKerning;
    }

    set fontStretch(value) {
        this.logSetter("fontStretch", value);

        this.context.fontStretch = value;
    }
    get fontStretch() {
        return this.context.fontStretch;
    }

    set fontVariantCaps(value) {
        this.logSetter("fontVariantCaps", value);

        this.context.fontVariantCaps = value;
    }
    get fontVariantCaps() {
        return this.context.fontVariantCaps;
    }

    set letterSpacing(value) {
        this.logSetter("letterSpacing", value);

        this.context.letterSpacing = value;
    }
    get letterSpacing() {
        return this.context.letterSpacing;
    }

    set textRendering(value) {
        this.logSetter("textRendering", value);

        this.context.textRendering = value;
    }
    get textRendering() {
        return this.context.textRendering;
    }

    set wordSpacing(value) {
        this.logSetter("wordSpacing", value);

        this.context.wordSpacing = value;
    }
    get wordSpacing() {
        return this.context.wordSpacing;
    }

    get canvas() {
        return <HTMLCanvasElement>this.context.canvas;
    }

    set direction(value) {
        this.logSetter("direction", value);

        this.context.direction = value;
    }
    get direction() {
        return this.context.direction;
    }

    set fillStyle(value) {
        this.logSetter("fillStyle", value);

        this.context.fillStyle = value;
    }
    get fillStyle() {
        return this.context.fillStyle;
    }

    set filter(value) {
        this.logSetter("filter", value);

        this.context.filter = value;
    }
    get filter() {
        return this.context.filter;
    }

    set font(value) {
        this.logSetter("font", value);

        this.context.font = value;
    }
    get font() {
        return this.context.font;
    }

    set globalAlpha(value) {
        this.logSetter("globalAlpha", value);

        this.context.globalAlpha = value;
    }
    get globalAlpha() {
        return this.context.globalAlpha;
    }

    set globalCompositeOperation(value) {
        this.logSetter("globalCompositeOperation", value);

        this.context.globalCompositeOperation = value;
    }
    get globalCompositeOperation() {
        return this.context.globalCompositeOperation;
    }

    set imageSmoothingEnabled(value) {
        this.logSetter("imageSmoothingEnabled", value);

        this.context.imageSmoothingEnabled = value;
    }
    get imageSmoothingEnabled() {
        return this.context.imageSmoothingEnabled;
    }

    set imageSmoothingQuality(value) {
        this.logSetter("imageSmoothingQuality", value);

        this.context.imageSmoothingQuality = value;
    }
    get imageSmoothingQuality() {
        return this.context.imageSmoothingQuality;
    }

    set lineCap(value) {
        this.logSetter("lineCap", value);

        this.context.lineCap = value;
    }
    get lineCap() {
        return this.context.lineCap;
    }

    set lineDashOffset(value) {
        this.logSetter("lineDashOffset", value);

        this.context.lineDashOffset = value;
    }
    get lineDashOffset() {
        return this.context.lineDashOffset;
    }

    set lineJoin(value) {
        this.logSetter("lineJoin", value);

        this.context.lineJoin = value;
    }
    get lineJoin() {
        return this.context.lineJoin;
    }

    set lineWidth(value) {
        this.logSetter("lineWidth", value);

        this.context.lineWidth = value;
    }
    get lineWidth() {
        return this.context.lineWidth;
    }

    set miterLimit(value) {
        this.logSetter("miterLimit", value);

        this.context.miterLimit = value;
    }
    get miterLimit() {
        return this.context.miterLimit;
    }

    set shadowBlur(value) {
        this.logSetter("shadowBlur", value);

        this.context.shadowBlur = value;
    }
    get shadowBlur() {
        return this.context.shadowBlur;
    }

    set shadowColor(value) {
        this.logSetter("shadowColor", value);

        this.context.shadowColor = value;
    }
    get shadowColor() {
        return this.context.shadowColor;
    }

    set shadowOffsetX(value) {
        this.logSetter("shadowOffsetX", value);

        this.context.shadowOffsetX = value;
    }
    get shadowOffsetX() {
        return this.context.shadowOffsetX;
    }

    set shadowOffsetY(value) {
        this.logSetter("shadowOffsetY", value);

        this.context.shadowOffsetY = value;
    }
    get shadowOffsetY() {
        return this.context.shadowOffsetY;
    }

    set strokeStyle(value) {
        this.logSetter("strokeStyle", value);

        this.context.strokeStyle = value;
    }
    get strokeStyle() {
        return this.context.strokeStyle;
    }

    set textAlign(value) {
        this.logSetter("textAlign", value);

        this.context.textAlign = value;
    }
    get textAlign() {
        return this.context.textAlign;
    }

    set textBaseline(value) {
        this.logSetter("textBaseline", value);

        this.context.textBaseline = value;
    }
    get textBaseline() {
        return this.context.textBaseline;
    }

    getContextAttributes(...args: GetContextMethodParameters<"getContextAttributes">) {
        // apwuifhwa98h!J!UIPHGFUGFHa moment
        return this.context["getContextAttributes"](...this.processArgs("getContextAttributes", args));
    }

    createConicGradient(...args: GetContextMethodParameters<"createConicGradient">) {
        return this.context.createConicGradient(...this.processArgs("createConicGradient", args));
    }

    roundRect(...args: GetContextMethodParameters<"roundRect">) {
        this.toCallableContextOverloadMethod(this.context.roundRect)(...this.processArgs("roundRect", args));
    }

    isContextLost(...args: GetContextMethodParameters<"isContextLost">) {
        return this.context.isContextLost(...this.processArgs("isContextLost", args));
    }

    reset(...args: GetContextMethodParameters<"reset">) {
        this.context.reset(...this.processArgs("reset", args));
    }

    getTransform(...args: GetContextMethodParameters<"getTransform">) {
        return this.context.getTransform(...this.processArgs("getTransform", args));
    }

    arc(...args: GetContextMethodParameters<"arc">) {
        this.context.arc(...this.processArgs("arc", args));
    }

    arcTo(...args: GetContextMethodParameters<"arcTo">) {
        this.context.arcTo(...this.processArgs("arcTo", args));
    }

    beginPath(...args: GetContextMethodParameters<"beginPath">) {
        this.context.beginPath(...this.processArgs("beginPath", args));
    }

    bezierCurveTo(...args: GetContextMethodParameters<"bezierCurveTo">) {
        this.context.bezierCurveTo(...this.processArgs("bezierCurveTo", args));
    }

    clearRect(...args: GetContextMethodParameters<"clearRect">) {
        this.context.clearRect(...this.processArgs("clearRect", args));
    }

    clip(...args: GetContextMethodParameters<"clip">) {
        this.toCallableContextOverloadMethod(this.context.clip)(...this.processArgs("clip", args));
    }

    closePath(...args: GetContextMethodParameters<"closePath">) {
        this.context.closePath(...this.processArgs("closePath", args));
    }

    createImageData(...args: GetContextMethodParameters<"createImageData">) {
        return this.toCallableContextOverloadMethod(this.context.createImageData)(...this.processArgs("createImageData", args));
    }

    createLinearGradient(...args: GetContextMethodParameters<"createLinearGradient">) {
        return this.context.createLinearGradient(...this.processArgs("createLinearGradient", args));
    }

    createPattern(...args: GetContextMethodParameters<"createPattern">) {
        return this.context.createPattern(...this.processArgs("createPattern", args));
    }

    createRadialGradient(...args: GetContextMethodParameters<"createRadialGradient">) {
        return this.context.createRadialGradient(...this.processArgs("createRadialGradient", args));
    }

    drawFocusIfNeeded(...args: GetContextMethodParameters<"drawFocusIfNeeded">) {
        // apwuifhwa98h!J!UIPHGFUGFHa js prototype belike moment
        this.toCallableContextOverloadMethod(this.context["drawFocusIfNeeded"])(...this.processArgs("drawFocusIfNeeded", args));
    }

    drawImage(...args: GetContextMethodParameters<"drawImage">) {
        this.toCallableContextOverloadMethod(this.context.drawImage)(...this.processArgs("drawImage", args));
    }

    ellipse(...args: GetContextMethodParameters<"ellipse">) {
        this.context.ellipse(...this.processArgs("ellipse", args));
    }

    fill(...args: GetContextMethodParameters<"fill">) {
        this.toCallableContextOverloadMethod(this.context.fill)(...this.processArgs("fill", args));
    }

    fillRect(...args: GetContextMethodParameters<"fillRect">) {
        this.context.fillRect(...this.processArgs("fillRect", args));
    }

    fillText(...args: GetContextMethodParameters<"fillText">) {
        this.context.fillText(...this.processArgs("fillText", args));
    }

    getImageData(...args: GetContextMethodParameters<"getImageData">) {
        return this.context.getImageData(...this.processArgs("getImageData", args));
    }

    getLineDash(...args: GetContextMethodParameters<"getLineDash">) {
        return this.context.getLineDash(...this.processArgs("getLineDash", args));
    }

    isPointInPath(...args: GetContextMethodParameters<"isPointInPath">) {
        return this.toCallableContextOverloadMethod(this.context.isPointInPath)(...this.processArgs("isPointInPath", args));
    }

    isPointInStroke(...args: GetContextMethodParameters<"isPointInStroke">) {
        return this.toCallableContextOverloadMethod(this.context.isPointInStroke)(...this.processArgs("isPointInStroke", args));
    }

    lineTo(...args: GetContextMethodParameters<"lineTo">) {
        this.context.lineTo(...this.processArgs("lineTo", args));
    }

    measureText(...args: GetContextMethodParameters<"measureText">) {
        return this.context.measureText(...this.processArgs("measureText", args));
    }

    moveTo(...args: GetContextMethodParameters<"moveTo">) {
        this.context.moveTo(...this.processArgs("moveTo", args));
    }

    putImageData(...args: GetContextMethodParameters<"putImageData">) {
        this.toCallableContextOverloadMethod(this.context.putImageData)(...this.processArgs("putImageData", args));
    }

    quadraticCurveTo(...args: GetContextMethodParameters<"quadraticCurveTo">) {
        this.context.quadraticCurveTo(...this.processArgs("quadraticCurveTo", args));
    }

    rect(...args: GetContextMethodParameters<"quadraticCurveTo">) {
        this.context.rect(...this.processArgs("rect", args));
    }

    resetTransform(...args: GetContextMethodParameters<"resetTransform">) {
        this.context.resetTransform(...this.processArgs("resetTransform", args));
    }

    restore(...args: GetContextMethodParameters<"restore">) {
        this.context.restore(...this.processArgs("restore", args));
    }

    rotate(...args: GetContextMethodParameters<"rotate">) {
        this.context.rotate(...this.processArgs("rotate", args));
    }

    save(...args: GetContextMethodParameters<"save">) {
        this.context.save(...this.processArgs("save", args));
    }

    scale(...args: GetContextMethodParameters<"scale">) {
        this.context.scale(...this.processArgs("scale", args));
    }

    setLineDash(...args: GetContextMethodParameters<"setLineDash">) {
        this.toCallableContextOverloadMethod(this.context.setLineDash)(...this.processArgs("setLineDash", args));
    }

    setTransform(...args: GetContextMethodParameters<"setTransform">) {
        this.toCallableContextOverloadMethod(this.context.setTransform)(...this.processArgs("setTransform", args));
    }

    stroke(...args: GetContextMethodParameters<"stroke">) {
        this.toCallableContextOverloadMethod(this.context.stroke)(...this.processArgs("stroke", args));
    }

    strokeRect(...args: GetContextMethodParameters<"strokeRect">) {
        this.context.strokeRect(...this.processArgs("strokeRect", args));
    }

    strokeText(...args: GetContextMethodParameters<"strokeText">) {
        this.context.strokeText(...this.processArgs("strokeText", args));
    }

    transform(...args: GetContextMethodParameters<"transform">) {
        this.context.transform(...this.processArgs("transform", args));
    }

    translate(...args: GetContextMethodParameters<"translate">) {
        this.context.translate(...this.processArgs("translate", args));
    }
}