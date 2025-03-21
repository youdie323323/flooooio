// ==UserScript==
// @name         Florr render grabber
// @namespace    http://tampermonkey.net/
// @version      2025-02-16
// @description  try to take over the world!
// @author       You
// @match        https://florr.io/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=florr.io
// @grant        none
// ==/UserScript==

"use strict";
(() => {
    var n = class {
        constructor(t) {
            this.context = t;
            this.pseudoCode = [];
            this.pathDefinitions = new Map();
            this.pathCounter = 0;
            this.pathInstanceToHash = new WeakMap();
        }

        generatePseudoCode() {
            const pathDefs = Array.from(this.pathDefinitions.values())
                .map(def => def.code)
                .join('\n');
    
            return [pathDefs, this.pseudoCode.join('\n')];
        }

        toCallableContextOverloadMethod(t) {
            return t.bind(this.context);
        }

        getPathVariableName() {
            return `path2d_${this.pathCounter++}`;
        }

        getCommandsHash(commands) {
            return commands.join('|');
        }

        processArgs(t, e) {
            e.forEach(r => {
                if (window.pathPseudoCode.has(r)) {
                    const commands = window.pathPseudoCode.get(r);
                    const commandsHash = this.getCommandsHash(commands);

                    this.pathInstanceToHash.set(r, commandsHash);

                    if (!this.pathDefinitions.has(commandsHash)) {
                        const varName = this.getPathVariableName();
                        this.pathDefinitions.set(commandsHash, {
                            name: varName,
                            code: `const ${varName} = (function(){
                                const path = new Path2D();
                                ${commands.join("\n")}
                                return path;
                            })();`,
                        });
                    }
                }
            });

            let o = e.map(r => {
                if (window.pathPseudoCode.has(r)) {
                    const hash = this.pathInstanceToHash.get(r);

                    return this.pathDefinitions.get(hash).name;
                }

                return JSON.stringify(r);
            }).join(", ");
    
            this.pseudoCode.push(`ctx.${t}(${o});`);

            return e.map(r => window.originalInstance.has(r) ? window.originalInstance.get(r) : r);
        }

        logSetter(t, e) {
            this.pseudoCode.push(`ctx.${t} = ${JSON.stringify(e)};`);
        }

        set fontKerning(t) {
            this.logSetter("fontKerning", t);
            this.context.fontKerning = t;
        }

        get fontKerning() {
            return this.context.fontKerning;
        }

        set fontStretch(t) {
            this.logSetter("fontStretch", t);
            this.context.fontStretch = t;
        }

        get fontStretch() {
            return this.context.fontStretch;
        }

        set fontVariantCaps(t) {
            this.logSetter("fontVariantCaps", t);
            this.context.fontVariantCaps = t;
        }

        get fontVariantCaps() {
            return this.context.fontVariantCaps;
        }

        set letterSpacing(t) {
            this.logSetter("letterSpacing", t);
            this.context.letterSpacing = t;
        }

        get letterSpacing() {
            return this.context.letterSpacing;
        }

        set textRendering(t) {
            this.logSetter("textRendering", t);
            this.context.textRendering = t;
        }

        get textRendering() {
            return this.context.textRendering;
        }

        set wordSpacing(t) {
            this.logSetter("wordSpacing", t);
            this.context.wordSpacing = t;
        }

        get wordSpacing() {
            return this.context.wordSpacing;
        }

        get canvas() {
            return this.context.canvas;
        }

        set direction(t) {
            this.logSetter("direction", t);
            this.context.direction = t;
        }

        get direction() {
            return this.context.direction;
        }

        set fillStyle(t) {
            this.logSetter("fillStyle", t);
            this.context.fillStyle = t;
        }

        get fillStyle() {
            return this.context.fillStyle;
        }

        set filter(t) {
            this.logSetter("filter", t);
            this.context.filter = t;
        }

        get filter() {
            return this.context.filter;
        }

        set font(t) {
            this.logSetter("font", t);
            this.context.font = t;
        }

        get font() {
            return this.context.font;
        }

        set globalAlpha(t) {
            this.logSetter("globalAlpha", t);
            this.context.globalAlpha = t;
        }

        get globalAlpha() {
            return this.context.globalAlpha;
        }

        set globalCompositeOperation(t) {
            this.logSetter("globalCompositeOperation", t);
            this.context.globalCompositeOperation = t;
        }

        get globalCompositeOperation() {
            return this.context.globalCompositeOperation;
        }

        set imageSmoothingEnabled(t) {
            this.logSetter("imageSmoothingEnabled", t);
            this.context.imageSmoothingEnabled = t;
        }

        get imageSmoothingEnabled() {
            return this.context.imageSmoothingEnabled;
        }

        set imageSmoothingQuality(t) {
            this.logSetter("imageSmoothingQuality", t);
            this.context.imageSmoothingQuality = t;
        }

        get imageSmoothingQuality() {
            return this.context.imageSmoothingQuality;
        }

        set lineCap(t) {
            this.logSetter("lineCap", t);
            this.context.lineCap = t;
        }

        get lineCap() {
            return this.context.lineCap;
        }

        set lineDashOffset(t) {
            this.logSetter("lineDashOffset", t);
            this.context.lineDashOffset = t;
        }

        get lineDashOffset() {
            return this.context.lineDashOffset;
        }

        set lineJoin(t) {
            this.logSetter("lineJoin", t);
            this.context.lineJoin = t;
        }

        get lineJoin() {
            return this.context.lineJoin;
        }

        set lineWidth(t) {
            this.logSetter("lineWidth", t);
            this.context.lineWidth = t;
        }

        get lineWidth() {
            return this.context.lineWidth;
        }

        set miterLimit(t) {
            this.logSetter("miterLimit", t);
            this.context.miterLimit = t;
        }

        get miterLimit() {
            return this.context.miterLimit;
        }

        set shadowBlur(t) {
            this.logSetter("shadowBlur", t);
            this.context.shadowBlur = t;
        }

        get shadowBlur() {
            return this.context.shadowBlur;
        }

        set shadowColor(t) {
            this.logSetter("shadowColor", t);
            this.context.shadowColor = t;
        }

        get shadowColor() {
            return this.context.shadowColor;
        }

        set shadowOffsetX(t) {
            this.logSetter("shadowOffsetX", t);
            this.context.shadowOffsetX = t;
        }

        get shadowOffsetX() {
            return this.context.shadowOffsetX;
        }

        set shadowOffsetY(t) {
            this.logSetter("shadowOffsetY", t);
            this.context.shadowOffsetY = t;
        }

        get shadowOffsetY() {
            return this.context.shadowOffsetY;
        }

        set strokeStyle(t) {
            this.logSetter("strokeStyle", t);
            this.context.strokeStyle = t;
        }

        get strokeStyle() {
            return this.context.strokeStyle;
        }

        set textAlign(t) {
            this.logSetter("textAlign", t);
            this.context.textAlign = t;
        }

        get textAlign() {
            return this.context.textAlign;
        }

        set textBaseline(t) {
            this.logSetter("textBaseline", t);
            this.context.textBaseline = t;
        }

        get textBaseline() {
            return this.context.textBaseline;
        }

        getContextAttributes(...t) {
            return this.context.getContextAttributes(...this.processArgs("getContextAttributes", t));
        }

        createConicGradient(...t) {
            return this.context.createConicGradient(...this.processArgs("createConicGradient", t));
        }

        roundRect(...t) {
            this.toCallableContextOverloadMethod(this.context.roundRect)(...this.processArgs("roundRect", t));
        }

        isContextLost(...t) {
            return this.context.isContextLost(...this.processArgs("isContextLost", t));
        }

        reset(...t) {
            this.context.reset(...this.processArgs("reset", t));
        }

        getTransform(...t) {
            return this.context.getTransform(...this.processArgs("getTransform", t));
        }

        arc(...t) {
            this.context.arc(...this.processArgs("arc", t));
        }

        arcTo(...t) {
            this.context.arcTo(...this.processArgs("arcTo", t));
        }

        beginPath(...t) {
            this.context.beginPath(...this.processArgs("beginPath", t));
        }

        bezierCurveTo(...t) {
            this.context.bezierCurveTo(...this.processArgs("bezierCurveTo", t));
        }

        clearRect(...t) {
            this.context.clearRect(...this.processArgs("clearRect", t));
        }

        clip(...t) {
            this.toCallableContextOverloadMethod(this.context.clip)(...this.processArgs("clip", t));
        }

        closePath(...t) {
            this.context.closePath(...this.processArgs("closePath", t));
        }

        createImageData(...t) {
            return this.toCallableContextOverloadMethod(this.context.createImageData)(...this.processArgs("createImageData", t));
        }

        createLinearGradient(...t) {
            return this.context.createLinearGradient(...this.processArgs("createLinearGradient", t));
        }

        createPattern(...t) {
            return this.context.createPattern(...this.processArgs("createPattern", t));
        }

        createRadialGradient(...t) {
            return this.context.createRadialGradient(...this.processArgs("createRadialGradient", t));
        }

        drawFocusIfNeeded(...t) {
            this.toCallableContextOverloadMethod(this.context.drawFocusIfNeeded)(...this.processArgs("drawFocusIfNeeded", t));
        }

        drawImage(...t) {
            this.toCallableContextOverloadMethod(this.context.drawImage)(...this.processArgs("drawImage", t));
        }

        ellipse(...t) {
            this.context.ellipse(...this.processArgs("ellipse", t));
        }

        fill(...t) {
            this.toCallableContextOverloadMethod(this.context.fill)(...this.processArgs("fill", t));
        }

        fillRect(...t) {
            this.context.fillRect(...this.processArgs("fillRect", t));
        }

        fillText(...t) {
            this.context.fillText(...this.processArgs("fillText", t));
        }

        getImageData(...t) {
            return this.context.getImageData(...this.processArgs("getImageData", t));
        }

        getLineDash(...t) {
            return this.context.getLineDash(...this.processArgs("getLineDash", t));
        }

        isPointInPath(...t) {
            return this.toCallableContextOverloadMethod(this.context.isPointInPath)(...this.processArgs("isPointInPath", t));
        }

        isPointInStroke(...t) {
            return this.toCallableContextOverloadMethod(this.context.isPointInStroke)(...this.processArgs("isPointInStroke", t));
        }

        lineTo(...t) {
            this.context.lineTo(...this.processArgs("lineTo", t));
        }

        measureText(...t) {
            return this.context.measureText(...this.processArgs("measureText", t));
        }

        moveTo(...t) {
            this.context.moveTo(...this.processArgs("moveTo", t));
        }

        putImageData(...t) {
            this.toCallableContextOverloadMethod(this.context.putImageData)(...this.processArgs("putImageData", t));
        }

        quadraticCurveTo(...t) {
            this.context.quadraticCurveTo(...this.processArgs("quadraticCurveTo", t));
        }

        rect(...t) {
            this.context.rect(...this.processArgs("rect", t));
        }

        resetTransform(...t) {
            this.context.resetTransform(...this.processArgs("resetTransform", t));
        }

        restore(...t) {
            this.context.restore(...this.processArgs("restore", t));
        }

        rotate(...t) {
            this.context.rotate(...this.processArgs("rotate", t));
        }

        save(...t) {
            this.context.save(...this.processArgs("save", t));
        }

        scale(...t) {
            this.context.scale(...this.processArgs("scale", t));
        }

        setLineDash(...t) {
            this.toCallableContextOverloadMethod(this.context.setLineDash)(...this.processArgs("setLineDash", t));
        }

        setTransform(...t) {
            this.toCallableContextOverloadMethod(this.context.setTransform)(...this.processArgs("setTransform", t));
        }

        stroke(...t) {
            this.toCallableContextOverloadMethod(this.context.stroke)(...this.processArgs("stroke", t));
        }

        strokeRect(...t) {
            this.context.strokeRect(...this.processArgs("strokeRect", t));
        }

        strokeText(...t) {
            this.context.strokeText(...this.processArgs("strokeText", t));
        }

        transform(...t) {
            this.context.transform(...this.processArgs("transform", t));
        }

        translate(...t) {
            this.context.translate(...this.processArgs("translate", t));
        }
    };

    window.pathPseudoCode = new WeakMap();
    window.originalInstance = new WeakMap();

    var g = window.Path2D;
    var x = window.OffscreenCanvas;
    Object.defineProperty(window, "Path2D", {
        value: function (...s) {
            let t = new g(...s);
            let e = new Proxy(t, {
                get(o, r, a) {
                    let i = o[r];
                    if (typeof i == "function") {
                        return function (...h) {
                            let c = window.pathPseudoCode.get(e);
                            let l = h.map(d => JSON.stringify(d)).join(", ");
                            c.push(`path.${String(r)}(${l});`);

                            return i.apply(o, h);
                        };
                    } else {
                        return i;
                    }
                },
            });

            window.pathPseudoCode.set(e, []);
            window.originalInstance.set(e, t);

            return e;
        },
    });

    function C(s) {
        return new Proxy(s, {
            get(t, e) {
                if (e === "getContext") {
                    return function (o, ...r) {
                        let a = t.getContext(o, ...r);
                        if (o === "2d") {
                            return new n(a);
                        } else {
                            return a;
                        }
                    };
                } else {
                    return Reflect.get(t, e);
                }
            },
        });
    }

    Object.defineProperty(window, "OffscreenCanvas", {
        value: function (s, t) {
            let e = new x(s, t);

            return C(e);
        },
    });

    var p = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (s, ...t) {
        let e = p.call(this, s, ...t);
        if (s === "2d") {
            return new n(e);
        } else {
            return e;
        }
    };
})();