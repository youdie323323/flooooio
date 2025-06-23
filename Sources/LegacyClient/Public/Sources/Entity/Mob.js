"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDefaultStarfishLegDistance = generateDefaultStarfishLegDistance;
const Entity_1 = __importDefault(require("./Entity"));
const MobRendererStarfish_1 = __importDefault(require("./Renderers/Mob/MobRendererStarfish"));
function generateDefaultStarfishLegDistance() {
    return Array(MobRendererStarfish_1.default.STARFISH_LEG_AMOUNT).fill(MobRendererStarfish_1.default.UNDESTROYED_LEG_DISTANCE);
}
// @UseRenderer(RendererMob)
class Mob extends Entity_1.default {
    constructor(id, x, y, angle, size, health, type, rarity, isPet, isFirstSegment, connectingSegment) {
        super(id, x, y, angle, type === 19 /* MobType.WEB_PROJECTILE */
            ? 0
            : size, health);
        this.type = type;
        this.rarity = rarity;
        this.isPet = isPet;
        this.isFirstSegment = isFirstSegment;
        this.connectingSegment = connectingSegment;
        /**
         * Starfish leg distance.
         */
        this.legD = generateDefaultStarfishLegDistance();
        this.connectedSegments = new Set();
    }
    get beakAngle() {
        return Math.sin(this.totalT) * 0.1;
    }
    static traverseSegments(m) {
        const { connectingSegment } = m;
        if (connectingSegment && !connectingSegment.isDead) {
            return this.traverseSegments(connectingSegment);
        }
        return m;
    }
}
exports.default = Mob;
