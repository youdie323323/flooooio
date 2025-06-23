"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Button = void 0;
const Color_1 = require("../../../../Utils/Color");
const Component_1 = require("../Component");
const Container_1 = require("./Container");
class Button extends Container_1.StaticPanelContainer {
    static { this.INVALID_COLOR = "#aaaaa9"; }
    /**
     * @param buttonComponents - Components to be added to button visibility, which are not "added"
     */
    constructor(layoutOptions, rectRadii = 1, strokeWidthLimit = 2, strokeWidthCoef = 1, buttonComponents, callback, buttonColor, validate) {
        super(layoutOptions, false, () => this.computeButtonColor(), rectRadii, strokeWidthLimit, strokeWidthCoef);
        this.callback = callback;
        this.buttonColor = buttonColor;
        this.validate = validate;
        this.isPressed = false;
        this.isHovered = false;
        this.isValid = true;
        this.once("onInitialized", () => {
            this.addChild(new Container_1.StaticHContainer({}).addChildren(...buttonComponents));
            buttonComponents = null;
        });
        this.on("onFocus", () => {
            if (!this.isValid) {
                return;
            }
            this.context.canvas.style.cursor = "pointer";
            this.isHovered = true;
        });
        this.on("onBlur", () => {
            if (!this.isValid) {
                return;
            }
            this.context.canvas.style.cursor = "default";
            this.isHovered = false;
            this.isPressed = false;
        });
        this.on("onClick", () => {
            if (!this.isValid) {
                return;
            }
            this.callback();
        });
        this.on("onDown", () => {
            if (!this.isValid) {
                return;
            }
            this.isPressed = true;
        });
        this.on("onUp", () => {
            if (!this.isValid) {
                return;
            }
            this.isPressed = false;
        });
    }
    render(ctx) {
        super.render(ctx);
        this.isValid = Component_1.Component.computePointerLike(this.validate);
        if (!this.isValid) {
            this.isHovered = false;
            this.isPressed = false;
        }
    }
    computeButtonColor() {
        if (!this.isValid)
            return Button.INVALID_COLOR;
        const computedColor = Component_1.Component.computePointerLike(this.buttonColor);
        if (this.isPressed) {
            return (0, Color_1.darkened)(computedColor, 0.1);
        }
        else if (this.isHovered) {
            return (0, Color_1.lightened)(computedColor, 0.1);
        }
        return computedColor;
    }
}
exports.Button = Button;
