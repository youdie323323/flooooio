import type { Rarity } from "../Native/Rarity";
import type { MobType, PetalType } from "../Native/Entity/EntityType";
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

    public connectedSegments: Set<Mob> = new Set();

    constructor(
        id: number,

        x: number,
        y: number,

        angle: number,

        size: number,

        health: number,

        public readonly type: MobType | PetalType,
        public readonly rarity: Rarity,

        public readonly isPet: boolean,

        public readonly isFirstSegment: boolean,

        public connectingSegment: Mob | null,
    ) {
        super(id, x, y, angle, size, health);
    }

    public get beakAngle(): number {
        return Math.sin(this.totalT) * 0.1;
    }

    public static traverseSegments(m: Mob): Mob {
        const { connectingSegment } = m;
        if (connectingSegment && !connectingSegment.isDead) {
            return this.traverseSegments(connectingSegment);
        }

        return m;
    }
}