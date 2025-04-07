import type { Rarity } from "../../../../../Shared/Entity/Statics/EntityRarity";
import type { MobType, PetalType } from "../../../../../Shared/Entity/Statics/EntityType";
import Entity from "./Entity";
import MobRendererStarfish from "./Renderers/Mob/MobRendererStarfish";

export function generateDefaultStarfishLegDistance(): Array<number> {
    return Array(MobRendererStarfish.STARFISH_LEG_AMOUNT).fill(MobRendererStarfish.UNDESTROYED_LEG_DISTANCE);
}

// @UseRenderer(RendererMob)
export default class Mob extends Entity {
    /**
     * Starfish leg distance.
     */
    public legD: Array<number> = generateDefaultStarfishLegDistance();

    /**
     * Angle index of sandstorm hexagon.
     */
    public sandstormAngle: number = 0;

    constructor(
        id: number,
        x: number,
        y: number,
        angle: number,
        size: number,
        health: number,

        readonly type: MobType | PetalType,
        readonly rarity: Rarity,

        readonly isPet: boolean,

        readonly isFirstSegment: boolean,
    ) {
        super(id, x, y, angle, size, health);
    }
}