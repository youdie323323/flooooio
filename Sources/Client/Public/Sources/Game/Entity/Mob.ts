import type { Rarity } from "../../../../../Shared/Entity/Statics/EntityRarity";
import type { MobType, PetalType } from "../../../../../Shared/Entity/Statics/EntityType";
import Entity from "./Entity";

// @UseRenderer(RendererMob)
export default class Mob extends Entity {
    public static readonly STARFISH_LEG_AMOUNT = 5;

    /**
     * Starfish leg distance.
     */
    public legD: Array<number> = Array(Mob.STARFISH_LEG_AMOUNT).fill(150);

    /**
     * Angle index of sandstorm hexagon.
     */
    public sandstormAngleIndex: number = 0;

    // Menu statics
    public moveSpeed: number;
    public angleSpeed: number;

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