"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Container_1 = require("../Layout/Components/WellKnown/Container");
const UIPetalPlaceholder_1 = __importDefault(require("../Shared/UIPetalPlaceholder"));
const ExtensionCentering_1 = require("../Layout/Extensions/ExtensionCentering");
class UITitleInventory extends Container_1.StaticVContainer {
    constructor(layoutOptions) {
        super(layoutOptions, false);
        const createRow = (placeholderSize, spaceWidth, count) => {
            const row = new ((0, ExtensionCentering_1.Centering)(Container_1.StaticHContainer))({});
            for (let i = 0; i < count; i++) {
                row.addChild(new UIPetalPlaceholder_1.default({}, placeholderSize));
                // Add space if not last placeholder
                if (i < count - 1) {
                    row.addChild(new Container_1.StaticSpace(spaceWidth, 0));
                }
            }
            return row;
        };
        const surfaceRow = createRow(35, 9, 10);
        const bottomRow = createRow(26, 7, 10);
        this.addChildren(surfaceRow, new Container_1.StaticSpace(0, 8), bottomRow);
    }
}
exports.default = UITitleInventory;
