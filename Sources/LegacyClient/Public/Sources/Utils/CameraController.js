"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Interpolator_1 = __importDefault(require("./Interpolator"));
class CameraController {
    constructor(canvas) {
        this.canvas = canvas;
        this._zoom = new Interpolator_1.default({
            easingType: "easeOutExpo",
            duration: 500,
            initValue: 1,
        });
    }
    set zoom(o) {
        this._zoom.value = o;
    }
    get zoom() {
        return this._zoom.getInterpolatedValue();
    }
}
exports.default = CameraController;
