import Entity from "./Entity";
import { MobType, PetalType } from "../../../Shared/EntityType";
import { Rarity } from "../../../Shared/rarity";

export default class Mob extends Entity {
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