import Entity from "./Entity";
import { MobType, PetalType } from "../../../Shared/EntityType";
import { Rarity } from "../../../Shared/rarity";

// @UseRenderer(RendererMob)
export default class Mob extends Entity {
    public static readonly STARFISH_LEG_AMOUNT = 5;

    /**
     * Current starfish leg distance.
     */
    public legD: number[] = Array(Mob.STARFISH_LEG_AMOUNT).fill(150);

    constructor(
        onlyDrawGeneralPart: boolean = false,

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
        super(onlyDrawGeneralPart, id, x, y, angle, size, health);
    }
}