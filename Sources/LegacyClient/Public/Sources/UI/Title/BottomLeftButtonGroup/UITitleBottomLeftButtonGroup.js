"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Container_1 = require("../../Layout/Components/WellKnown/Container");
const UITitleDiscordCommunityButton_1 = __importDefault(require("./UITitleDiscordCommunityButton"));
const UITitleInventoryButton_1 = __importDefault(require("./UITitleInventoryButton"));
const UITitleCraftButton_1 = __importDefault(require("./UITitleCraftButton"));
const UITitleChangelogButton_1 = __importDefault(require("./UITitleChangelogButton"));
const UITitleSettingButton_1 = __importDefault(require("./UITitleSettingButton"));
class UITitleBottomLeftButtonGroup extends Container_1.StaticVContainer {
    static { this.GAP_BETWEEN_BUTTONS = 10; }
    constructor(layoutOptions) {
        super(layoutOptions);
        const { GAP_BETWEEN_BUTTONS } = UITitleBottomLeftButtonGroup;
        this.addChildren(new UITitleDiscordCommunityButton_1.default({}), new Container_1.StaticSpace(0, GAP_BETWEEN_BUTTONS), new UITitleInventoryButton_1.default({}), new Container_1.StaticSpace(0, GAP_BETWEEN_BUTTONS), new UITitleCraftButton_1.default({}), new Container_1.StaticSpace(0, GAP_BETWEEN_BUTTONS), new UITitleChangelogButton_1.default({}), new Container_1.StaticSpace(0, GAP_BETWEEN_BUTTONS), new UITitleSettingButton_1.default({}));
    }
}
exports.default = UITitleBottomLeftButtonGroup;
