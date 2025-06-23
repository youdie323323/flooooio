"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Container_1 = require("../Layout/Components/WellKnown/Container");
const UIPetalPlaceholder_1 = __importDefault(require("../Shared/UIPetalPlaceholder"));
const StaticText_1 = __importDefault(require("../Layout/Components/WellKnown/StaticText"));
const ExtensionCentering_1 = require("../Layout/Extensions/ExtensionCentering");
class UIGameInventory extends Container_1.StaticVContainer {
    constructor(layoutOptions) {
        super(layoutOptions, false);
        const createRow = (placeholderSize, spaceWidth, count, isBottom) => {
            const row = new ((0, ExtensionCentering_1.Centering)(Container_1.StaticHContainer))({});
            for (let i = 0; i < count; i++) {
                row.addChild(isBottom
                    ? new Container_1.StaticVContainer({}, false)
                        .addChildren(new ((0, ExtensionCentering_1.Centering)(UIPetalPlaceholder_1.default))({}, placeholderSize), new Container_1.StaticSpace(0, 5), new ((0, ExtensionCentering_1.Centering)(StaticText_1.default))({}, `[${(i + 1) % 10}]`, 8))
                    : new UIPetalPlaceholder_1.default({}, placeholderSize));
                // Add space if not last placeholder
                if (i < count - 1) {
                    row.addChild(new Container_1.StaticSpace(spaceWidth, 0));
                }
            }
            return row;
        };
        const surfaceRow = createRow(30, 12, 10, false);
        const bottomRow = createRow(22, 8, 10, true);
        this.addChildren(surfaceRow, new Container_1.StaticSpace(0, 12), bottomRow);
    }
}
exports.default = UIGameInventory;
