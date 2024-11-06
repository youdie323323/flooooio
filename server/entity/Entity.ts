export interface Entity {
    readonly id: number;
    x: number;
    y: number;
    magnitude: number;
    angle: number;
    size: number;
    health: number;
    maxHealth: number;
}

export const onUpdateTick: symbol = Symbol.for("onUpdateTick");