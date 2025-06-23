"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Button_1 = require("../../Layout/Components/WellKnown/Button");
const Logo_1 = require("../../Layout/Components/WellKnown/Logo");
const _1 = require(".");
const discord_icon_svg_1 = __importDefault(require("../Assets/discord_icon.svg"));
class UITitleDiscordCommunityButton extends (0, _1.createTitleBottomLeftToolTippedButton)(Button_1.Button, "Join our Discord community!", 6, "right") {
    constructor(layoutOptions) {
        super({
            ...layoutOptions,
            w: _1.BOTTOM_LEFT_TOOLTIPPED_BUTTON_SIZE,
            h: _1.BOTTOM_LEFT_TOOLTIPPED_BUTTON_SIZE,
        }, 3, 3, 1, [
            new Logo_1.SVGLogo({
                w: _1.BOTTOM_LEFT_TOOLTIPPED_BUTTON_SIZE,
                h: _1.BOTTOM_LEFT_TOOLTIPPED_BUTTON_SIZE,
            }, discord_icon_svg_1.default, 0.7),
        ], () => {
            const windowProxy = window.open("unko");
            windowProxy.document.write("まだ実装されてないわボケー");
        }, "#5865f2", true);
    }
}
exports.default = UITitleDiscordCommunityButton;
