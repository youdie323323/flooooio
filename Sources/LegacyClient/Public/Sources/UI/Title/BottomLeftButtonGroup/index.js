"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTitleBottomLeftToolTippedButton = exports.BOTTOM_LEFT_TOOLTIPPED_BUTTON_SIZE = void 0;
exports.dynamicJoinArray = dynamicJoinArray;
const ExtensionTooltip_1 = __importDefault(require("../../Layout/Extensions/ExtensionTooltip"));
const StaticText_1 = __importDefault(require("../../Layout/Components/WellKnown/StaticText"));
const Container_1 = require("../../Layout/Components/WellKnown/Container");
exports.BOTTOM_LEFT_TOOLTIPPED_BUTTON_SIZE = 35;
const createTitleBottomLeftToolTippedButton = (ctor, description, positionOffset, position) => {
    return (0, ExtensionTooltip_1.default)(ctor, [
        new StaticText_1.default({ y: 5 }, description, 11),
        new Container_1.CoordinatedStaticSpace(1, 1, 0, 22),
    ], positionOffset, position, true);
};
exports.createTitleBottomLeftToolTippedButton = createTitleBottomLeftToolTippedButton;
function dynamicJoinArray(array, separatorFn) {
    return array.flatMap((item, index) => index ? [separatorFn(), item] : [item]);
}
