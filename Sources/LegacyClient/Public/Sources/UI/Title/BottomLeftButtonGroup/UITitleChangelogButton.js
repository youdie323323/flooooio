"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Button_1 = require("../../Layout/Components/WellKnown/Button");
const Logo_1 = require("../../Layout/Components/WellKnown/Logo");
const scroll_unfurled_svg_1 = __importDefault(require("../Assets/scroll_unfurled.svg"));
const Container_1 = require("../../Layout/Components/WellKnown/Container");
const ExtensionCentering_1 = require("../../Layout/Extensions/ExtensionCentering");
const UICloseButton_1 = __importDefault(require("../../Shared/UICloseButton"));
const StaticText_1 = __importDefault(require("../../Layout/Components/WellKnown/StaticText"));
const _1 = require(".");
class UITitleChangelogButton extends (0, _1.createTitleBottomLeftToolTippedButton)(Button_1.Button, "Changelog", 6, "right") {
    constructor(layoutOptions) {
        super({
            ...layoutOptions,
            w: _1.BOTTOM_LEFT_TOOLTIPPED_BUTTON_SIZE,
            h: _1.BOTTOM_LEFT_TOOLTIPPED_BUTTON_SIZE,
        }, 3, 3, 1, [
            new Logo_1.SVGLogo({
                w: _1.BOTTOM_LEFT_TOOLTIPPED_BUTTON_SIZE,
                h: _1.BOTTOM_LEFT_TOOLTIPPED_BUTTON_SIZE,
            }, scroll_unfurled_svg_1.default),
        ], () => {
            this.changelogContainer.setVisible(!this.changelogContainer.desiredVisible, (this), true, 1 /* AnimationType.SLIDE */, {
                direction: "v",
                offsetSign: -1,
            });
        }, "#9bb56b", true);
        this.once("onInitialized", () => {
            this.changelogContainer = this.createChangelogContainer();
            // Initialize as hidden
            this.changelogContainer.setVisible(false, null, false);
            this.context.addComponent(this.changelogContainer);
        });
    }
    createChangelogContainer() {
        let changelogContainerCloser;
        let changelogContainerContentContainer;
        const changelogContainer = new Container_1.StaticPanelContainer(() => ({
            x: 72,
            y: 15 + changelogContainer.h,
            invertYCoordinate: true,
        }), true, "#9bb56b", 0.1).addChildren((changelogContainerCloser = new UICloseButton_1.default({
            x: 314 - 4,
            y: 5,
        }, 12, () => {
            changelogContainer.setVisible(false, changelogContainerCloser, true, 1 /* AnimationType.SLIDE */, {
                direction: "v",
                offsetSign: -1,
            });
        })), new Container_1.CoordinatedStaticSpace(15, 15, 313.5, 0), new StaticText_1.default({
            x: 118,
            y: 4,
        }, "Changelog", 16), (changelogContainerContentContainer = new Container_1.StaticScrollableContainer({
            x: 4,
            y: 40,
            w: 323,
            h: 220,
        }, 5.5, 75).addChildren(...(0, _1.dynamicJoinArray)(Array.from({ length: 50 }, () => new ((0, ExtensionCentering_1.Centering)(StaticText_1.default))({}, "Older changelog entries not available", 9.5, "#ffffff", "center")), () => new Container_1.StaticSpace(0, 10)))));
        return changelogContainer;
    }
}
exports.default = UITitleChangelogButton;
