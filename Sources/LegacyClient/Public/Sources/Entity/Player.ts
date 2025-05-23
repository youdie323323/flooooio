import { decodeMood } from "../Native/Entity/Player/PlayerMood";
import { deltaTime } from "../../../Main";
import Entity from "./Entity";

// @UseRenderer(RendererFlower)
export default class Player extends Entity {
    public angryT: number;
    public sadT: number;

    public wasEliminated: boolean;

    /**
     * Player is dev flower or not.
     */
    public isDev: boolean;

    constructor(
        id: number,

        x: number,
        y: number,
        
        angle: number,

        size: number,

        health: number,

        public mood: number,

        public name: string,
    ) {
        super(id, x, y, angle, size, health);

        this.angryT = 0;
        this.sadT = 0;

        this.wasEliminated = false;

        this.isDev = false;
    }

    override update() {
        super.update();

        if (this.isDead) {
            this.sadT = 1;
            this.angryT = 0;
        } else {
            const interpolationRate = deltaTime / 100;

            const [isAngry, isSad] = decodeMood(this.mood);

            this.angryT = Math.min(1, Math.max(0, this.angryT + (isAngry ? interpolationRate : -interpolationRate)));
            this.sadT = Math.min(1, Math.max(0, this.sadT + (!isAngry && isSad ? interpolationRate : -interpolationRate)));
        }
    }
}