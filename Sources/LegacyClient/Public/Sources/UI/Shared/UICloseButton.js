"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Button_1 = require("../Layout/Components/WellKnown/Button");
const Logo_1 = require("../Layout/Components/WellKnown/Logo");
const close_icon_svg_1 = __importDefault(require("./Assets/close_icon.svg"));
// TODO: this should be DynamicLayoutable
class UICloseButton extends Button_1.Button {
    constructor(layoutOptions, size, callback) {
        super({
            ...layoutOptions,
            w: size,
            h: size,
        }, 2, 2.5, 1, [
            new Logo_1.SVGLogo({
                w: size,
                h: size,
            }, close_icon_svg_1.default, 0.95),
        ], callback, "#bb5555", true);
    }
}
exports.default = UICloseButton;
