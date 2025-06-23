"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const Player_1 = __importDefault(require("../../Entity/Player"));
const RendererRenderingLink_1 = require("../../Entity/Renderers/RendererRenderingLink");
const Color_1 = require("../../Utils/Color");
const Component_1 = require("../Layout/Components/Component");
const ComponentDynamicLayoutable_1 = require("../Layout/Components/ComponentDynamicLayoutable");
const StaticText_1 = require("../Layout/Components/WellKnown/StaticText");
const Layout_1 = __importDefault(require("../Layout/Layout"));
const UITitle_1 = __importDefault(require("./UITitle"));
class UITitlePlayerProfile extends ComponentDynamicLayoutable_1.AbstractDynamicLayoutable {
    static { _a = Component_1.OBSTRUCTION_AFFECTABLE; }
    static { this.dummyPlayer = new Player_1.default(-1, 
    // The coordinate will transform, so we can just send transform value here
    0, -28, 10, 15, 0, PlayerMood_1.MoodFlags.NORMAL, ""); }
    constructor(layoutOptions, id, name, readyState, isEmpty) {
        super();
        this.layoutOptions = layoutOptions;
        this.id = id;
        this.name = name;
        this.readyState = readyState;
        this.isEmpty = isEmpty;
        this[_a] = false;
    }
    layout(lc) {
        return Layout_1.default.layout(Component_1.Component.computePointerLike(this.layoutOptions), lc);
    }
    getCacheKey(lc) {
        const { CACHE_KEY_DELIMITER } = Component_1.Component;
        return super.getCacheKey(lc) +
            CACHE_KEY_DELIMITER +
            Object.values(Component_1.Component.computePointerLike(this.layoutOptions)).join(CACHE_KEY_DELIMITER);
    }
    invalidateLayoutCache() {
        this.layoutCache.invalidate();
    }
    render(ctx) {
        super.render(ctx);
        ctx.save();
        ctx.translate(this.x, this.y);
        { // Frame
            ctx.save();
            ctx.lineWidth = 4;
            ctx.strokeStyle = "black";
            ctx.globalAlpha = Color_1.DARKENED_BASE;
            ctx.beginPath();
            ctx.roundRect(0, 0, this.w, this.h, 0.5);
            ctx.stroke();
            ctx.closePath();
            ctx.restore();
        }
        ctx.translate(this.w / 2, this.h / 2);
        if (Component_1.Component.computePointerLike(this.isEmpty)) {
            ctx.lineJoin = "round";
            ctx.lineCap = "round";
            ctx.textBaseline = "middle";
            ctx.textAlign = "center";
            ctx.fillStyle = "white";
            (0, StaticText_1.setGameFont)(ctx, 10);
            ctx.strokeText("Empty", 0, 0);
            ctx.fillText("Empty", 0, 0);
        }
        else {
            {
                const computedName = Component_1.Component.computePointerLike(this.name);
                ctx.save();
                ctx.lineJoin = "round";
                ctx.lineCap = "round";
                ctx.textBaseline = "middle";
                ctx.textAlign = "center";
                ctx.fillStyle = "white";
                (0, StaticText_1.setGameFont)(ctx, 10);
                this.drawTextWithScale(ctx, computedName, 0, 0, this.w * 0.9);
                ctx.restore();
            }
            const computedId = Component_1.Component.computePointerLike(this.id);
            if (this.context instanceof UITitle_1.default &&
                computedId === this.context.waveRoomSelfId) {
                ctx.save();
                ctx.translate(0, 12);
                ctx.lineJoin = "round";
                ctx.lineCap = "round";
                ctx.textBaseline = "middle";
                ctx.textAlign = "center";
                ctx.fillStyle = "white";
                (0, StaticText_1.setGameFont)(ctx, 8);
                ctx.strokeText("(you)", 0, 0);
                ctx.fillText("(you)", 0, 0);
                ctx.restore();
            }
            const computedReadyState = Component_1.Component.computePointerLike(this.readyState);
            if (computedReadyState === 1 /* WaveRoomPlayerReadyState.READY */) {
                ctx.save();
                ctx.translate(0, 32);
                ctx.lineJoin = "round";
                ctx.lineCap = "round";
                ctx.textBaseline = "middle";
                ctx.textAlign = "center";
                ctx.fillStyle = "#70fc68";
                (0, StaticText_1.setGameFont)(ctx, 11);
                ctx.strokeText("Ready", 0, 0);
                ctx.fillText("Ready", 0, 0);
                ctx.restore();
            }
            (0, RendererRenderingLink_1.renderEntity)({
                ctx,
                entity: UITitlePlayerProfile.dummyPlayer,
                isSpecimen: true,
            });
        }
        ctx.restore();
    }
    destroy() {
        // To remove binded component completely, we need to access current context
        // But super.destory remove reference to context, so post-processing
        super.destroy();
    }
    drawTextWithScale(ctx, text, x, y, maxWidth) {
        const metrics = ctx.measureText(text);
        const actualWidth = metrics.width;
        ctx.save();
        if (actualWidth > maxWidth) {
            const scale = maxWidth / actualWidth;
            ctx.translate(x, y);
            ctx.scale(scale, 1);
            ctx.translate(-x, -y);
            ctx.strokeText(text, x, y);
            ctx.fillText(text, x, y);
        }
        else {
            ctx.strokeText(text, x, y);
            ctx.fillText(text, x, y);
        }
        ctx.restore();
    }
}
exports.default = UITitlePlayerProfile;
