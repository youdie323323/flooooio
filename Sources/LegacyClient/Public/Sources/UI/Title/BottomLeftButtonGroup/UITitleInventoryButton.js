"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Mob_1 = __importDefault(require("../../../Entity/Mob"));
const Button_1 = require("../../Layout/Components/WellKnown/Button");
const Container_1 = require("../../Layout/Components/WellKnown/Container");
const Logo_1 = require("../../Layout/Components/WellKnown/Logo");
const ExtensionCentering_1 = require("../../Layout/Extensions/ExtensionCentering");
const UICloseButton_1 = __importDefault(require("../../Shared/UICloseButton"));
const UIDraggableMobIcon_1 = __importDefault(require("../../Shared/UIDraggableMobIcon"));
const _1 = require(".");
const StaticText_1 = __importDefault(require("../../Layout/Components/WellKnown/StaticText"));
const swap_bag_svg_1 = __importDefault(require("../Assets/swap_bag.svg"));
class UITitleInventoryButton extends (0, _1.createTitleBottomLeftToolTippedButton)(Button_1.Button, "Inventory", 6, "right") {
    constructor(layoutOptions) {
        super({
            ...layoutOptions,
            w: _1.BOTTOM_LEFT_TOOLTIPPED_BUTTON_SIZE,
            h: _1.BOTTOM_LEFT_TOOLTIPPED_BUTTON_SIZE,
        }, 3, 3, 1, [
            new Logo_1.SVGLogo({
                w: _1.BOTTOM_LEFT_TOOLTIPPED_BUTTON_SIZE,
                h: _1.BOTTOM_LEFT_TOOLTIPPED_BUTTON_SIZE,
            }, swap_bag_svg_1.default),
        ], () => {
            this.inventoryContainer.setVisible(!this.inventoryContainer.desiredVisible, (this), true, 1 /* AnimationType.SLIDE */, {
                direction: "v",
                offsetSign: -1,
            });
        }, "#599dd8", true);
        this.once("onInitialized", () => {
            this.inventoryContainer = this.createInventoryContainer();
            // Initialize as hidden
            this.inventoryContainer.setVisible(false, null, false);
            this.context.addComponent(this.inventoryContainer);
        });
    }
    createInventoryContainer() {
        let inventoryContainerCloser;
        const inventoryContainer = new Container_1.StaticPanelContainer(() => ({
            x: 72,
            y: 15 + inventoryContainer.h,
            invertYCoordinate: true,
        }), true, "#5a9fdb", 0.1).addChildren((inventoryContainerCloser = new UICloseButton_1.default({
            x: 246 - 4,
            y: 5,
        }, 12, () => {
            inventoryContainer.setVisible(false, inventoryContainerCloser, true, 1 /* AnimationType.SLIDE */, {
                direction: "v",
                offsetSign: -1,
            });
        })), new Container_1.CoordinatedStaticSpace(15, 15, 245.5, 0), new StaticText_1.default({
            x: 88,
            y: 4,
        }, "Inventory", 16), new StaticText_1.default({
            x: 50,
            y: 40,
        }, "Click on a petal to equip it", 11), new Container_1.StaticVContainer({
            x: 5,
            y: 60,
        }, false).addChildren(...(0, _1.dynamicJoinArray)(Array.from({ length: 2 }, () => new ((0, ExtensionCentering_1.Centering)(Container_1.StaticHContainer))({}).addChildren(...(0, _1.dynamicJoinArray)(Array.from({ length: 6 }, () => {
            const icon = new UIDraggableMobIcon_1.default({
                w: 30,
                h: 30,
            }, new Mob_1.default(-1, 0, 0, 0, 0, 0, 20 /* PetalType.BASIC */, 0 /* Rarity.COMMON */, false, false, null), 1);
            return icon;
        }), () => new Container_1.StaticSpace(8, 0)))), () => new Container_1.StaticSpace(0, 8)), new Container_1.StaticSpace(0, 5)));
        return inventoryContainer;
    }
}
exports.default = UITitleInventoryButton;
