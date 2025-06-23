"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Container_1 = require("../Layout/Components/WellKnown/Container");
class UIPetalPlaceholder extends Container_1.StaticPanelContainer {
    constructor(layoutOptions, size) {
        super({
            ...layoutOptions,
            w: size,
            h: size,
        }, false, "#ddf2e7", 0.25, 4, 0.085);
    }
    render(ctx) {
        ctx.globalAlpha = 0.9;
        super.render(ctx);
        if (this.embeddedPetal) {
        }
    }
}
exports.default = UIPetalPlaceholder;
