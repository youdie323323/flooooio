"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const Gauge_1 = __importStar(require("../Layout/Components/WellKnown/Gauge"));
const RendererRenderingLink_1 = require("../../Entity/Renderers/RendererRenderingLink");
class UIGameOtherPlayerStatus extends Gauge_1.default {
    static { this.OTHER_PLAYER_SIZE_COEF = 0.8; }
    static { this.PLAYER_PROXY_HANDLER = {
        get(target, property, receiver) {
            if (property === "size")
                return 20 * UIGameOtherPlayerStatus.OTHER_PLAYER_SIZE_COEF;
            return Reflect.get(target, property, receiver);
        },
        // Disable write
        set: function () {
            return false;
        },
    }; }
    constructor(layoutOptions, player) {
        const { OTHER_PLAYER_SIZE_COEF } = UIGameOtherPlayerStatus;
        super({
            ...layoutOptions,
            w: 135 * OTHER_PLAYER_SIZE_COEF,
            h: 22 * OTHER_PLAYER_SIZE_COEF,
        }, (0, Gauge_1.healthGaugeSources)(player), 14, () => player.name);
        this.player = player;
        this.player = new Proxy(this.player, UIGameOtherPlayerStatus.PLAYER_PROXY_HANDLER);
    }
    render(ctx) {
        super.render(ctx);
        const { player } = this;
        // The coordinate cancel each other out
        ctx.translate(-player.x, -player.y);
        ctx.translate(-16, this.h / 2);
        (0, RendererRenderingLink_1.renderEntity)({
            ctx,
            entity: player,
            isSpecimen: true,
        });
    }
    destroy() {
        super.destroy();
        this.player = null;
    }
}
exports.default = UIGameOtherPlayerStatus;
