export interface Entity {
    readonly id: number;
    x: number;
    y: number;
    angle: number;
    size: number;
    health: number;
    maxHealth: number;

    // Below not sending to server ↓

    magnitude: number;
}

export const onUpdateTick: symbol = Symbol.for("onUpdateTick");