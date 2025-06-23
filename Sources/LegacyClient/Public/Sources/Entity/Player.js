"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const PlayerMood_1 = require("../Native/Entity/Player/PlayerMood");
const Application_1 = require("../../../Application");
const Entity_1 = __importDefault(require("./Entity"));
// @UseRenderer(RendererFlower)
class Player extends Entity_1.default {
    constructor(id, x, y, angle, size, health, mood, name) {
        super(id, x, y, angle, size, health);
        this.mood = mood;
        this.name = name;
        this.angryT = 0;
        this.sadT = 0;
        this.wasEliminated = false;
        this.isDev = false;
    }
    update() {
        super.update();
        if (this.isDead) {
            this.sadT = 1;
            this.angryT = 0;
        }
        else {
            const interpolationRate = Application_1.deltaTime / 100;
            let [isAngry, isSad] = (0, PlayerMood_1.decodeMood)(this.mood);
            if (this.isPoison) {
                isAngry = false;
                isSad = true;
            }
            this.angryT = Math.min(1, Math.max(0, this.angryT + (isAngry ? interpolationRate : -interpolationRate)));
            this.sadT = Math.min(1, Math.max(0, this.sadT + (!isAngry && isSad ? interpolationRate : -interpolationRate)));
        }
    }
}
exports.default = Player;
