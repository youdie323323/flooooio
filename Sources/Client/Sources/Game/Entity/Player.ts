import { decodeMood } from "../../../../Shared/Mood";
import { deltaTime } from "../../../Main";
import Entity from "./Entity";

// @UseRenderer(RendererFlower)
export default class Player extends Entity {
    angryT: number;
    sadT: number;

    /**
     * The player is completely removed from server (not likely death).
     */
    isRemoved: boolean;

    /**
     * Player is dev flower or not.
     */
    isDev: boolean;

    constructor(
        onlyDrawGeneralPart: boolean = false,

        id: number,
        x: number,
        y: number,
        angle: number,
        size: number,
        health: number,

        public mood: number,

        readonly nickname: string,
    ) {
        super(onlyDrawGeneralPart, id, x, y, angle, size, health);

        this.angryT = 0;
        this.sadT = 0;

        this.isRemoved = false;

        this.isDev = false;
    }

    override update() {
        super.update();

        if (this.isDead) {
            this.sadT = 1;
            this.angryT = 0;
        } else {
            const interpolationRate = deltaTime / 100;

            const { 0: isAngry, 1: isSad } = decodeMood(this.mood);

            this.angryT = Math.min(1, Math.max(0, this.angryT + (isAngry ? interpolationRate : -interpolationRate)));
            this.sadT = Math.min(1, Math.max(0, this.sadT + (!isAngry && isSad ? interpolationRate : -interpolationRate)));
        }
    }
}