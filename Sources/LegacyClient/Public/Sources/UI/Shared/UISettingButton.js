"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Button_1 = require("../Layout/Components/WellKnown/Button");
const Logo_1 = require("../Layout/Components/WellKnown/Logo");
const gear_icon_svg_1 = __importDefault(require("./Assets/gear_icon.svg"));
const easeOutQuad = (x) => Math.sqrt(1 - Math.pow(x - 1, 2));
class UISettingButton extends Button_1.Button {
    static { this.RETURN_DURATION = 250; }
    constructor(layoutOptions, size, callback) {
        super({
            ...layoutOptions,
            w: size,
            h: size,
        }, 3, 3, 1, [
            new Logo_1.SVGLogo({
                w: size,
                h: size,
            }, gear_icon_svg_1.default, 0.8, () => this.currentGearRotation),
        ], callback, "#aaaaaa", true);
        this.currentGearRotation = 0;
        this.rotationStartTime = 0;
        this.initialRotation = 0;
        this.isReturning = false;
        this.isClicked = false;
        const startAdvanceRotation = () => {
            this.isReturning = false;
            if (this.gearRotationInterval)
                clearInterval(this.gearRotationInterval);
            this.gearRotationInterval = setInterval(() => {
                this.currentGearRotation += 0.004;
            }, 1);
        };
        const startAdvanceReturn = () => {
            if (this.isClicked)
                return;
            if (this.gearRotationInterval)
                clearInterval(this.gearRotationInterval);
            this.isReturning = true;
            this.initialRotation = this.currentGearRotation;
            this.rotationStartTime = Date.now();
        };
        this.on("onFocus", startAdvanceRotation);
        this.on("onBlur", startAdvanceReturn);
        this.on("onClick", () => {
            this.isClicked = true;
        });
        this.on("onClickedOutside", () => {
            this.isClicked = false;
            startAdvanceReturn();
        });
    }
    render(ctx) {
        super.render(ctx);
        if (this.isReturning) {
            const elapsed = Date.now() - this.rotationStartTime;
            const progress = Math.min(elapsed / UISettingButton.RETURN_DURATION, 1);
            if (progress < 1) {
                this.currentGearRotation = this.initialRotation * (1 - easeOutQuad(progress));
            }
            else {
                this.currentGearRotation = 0;
                this.isReturning = false;
            }
        }
    }
}
exports.default = UISettingButton;
