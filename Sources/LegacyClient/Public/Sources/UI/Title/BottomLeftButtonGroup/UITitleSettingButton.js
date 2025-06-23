"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Button_1 = require("../../Layout/Components/WellKnown/Button");
const _1 = require(".");
const Container_1 = require("../../Layout/Components/WellKnown/Container");
const UICloseButton_1 = __importDefault(require("../../Shared/UICloseButton"));
const StaticText_1 = __importDefault(require("../../Layout/Components/WellKnown/StaticText"));
const UISettingButton_1 = __importDefault(require("../../Shared/UISettingButton"));
const SettingStorage_1 = __importDefault(require("../../../Utils/SettingStorage"));
const Toggle_1 = __importDefault(require("../../Layout/Components/WellKnown/Toggle"));
class UITitleSettingButton extends (0, _1.createTitleBottomLeftToolTippedButton)(UISettingButton_1.default, "Settings", 6, "right") {
    constructor(layoutOptions) {
        super(layoutOptions, _1.BOTTOM_LEFT_TOOLTIPPED_BUTTON_SIZE, () => {
            this.settingContainer.setVisible(!this.settingContainer.desiredVisible, (this), true, 1 /* AnimationType.SLIDE */, {
                // For some reason, the animation speed of the setting container in the original game is fast lol
                defaultDurationOverride: 150,
                direction: "v",
                offsetSign: -1,
            });
        });
        this.once("onInitialized", () => {
            this.creditContainer = this.createCreditContainer();
            this.settingContainer = this.createSettingContainer(this.creditContainer);
            { // Add credit container
                this.creditContainer.setVisible(false, null, false);
                this.context.addComponent(this.creditContainer);
            }
            { // Add setting container
                this.settingContainer.setVisible(false, null, false);
                this.context.addComponent(this.settingContainer);
            }
        });
    }
    createSettingContainer(creditContainer) {
        const makeSettingRow = (y, settingKey, description) => {
            const settingToggle = new Toggle_1.default({
                x: 5,
                y: y - 1,
                w: 17,
                h: 17,
            }, (t) => {
                settingToggle.setToggle(t);
                SettingStorage_1.default.set(settingKey, t);
            })
                // Load existed setting
                .setToggle(SettingStorage_1.default.get(settingKey));
            return [
                settingToggle,
                new StaticText_1.default({
                    x: 26 - .5,
                    y: y + 1 + .5,
                }, description, 11),
            ];
        };
        const makeSettingGameUnrelatedButton = (y, text, callback) => {
            return new Button_1.Button({
                x: 5,
                y,
                w: 138,
                h: 14,
            }, 2, 3, 1, [
                new StaticText_1.default(() => ({
                    x: 45,
                    y: 1,
                }), text, 11),
            ], callback, "#aaaaaa", true);
        };
        let settingContainerCloser;
        let creditsButton;
        const settingContainer = new Container_1.StaticPanelContainer({
            x: 72,
            y: 225 + .5,
            invertYCoordinate: true,
        }, true, "#aaaaaa", 0.1).addChildren((settingContainerCloser = new UICloseButton_1.default({
            x: 150 - 4,
            y: 2,
        }, 12, () => {
            settingContainer.setVisible(false, settingContainerCloser, true, 1 /* AnimationType.SLIDE */, {
                direction: "v",
                offsetSign: -1,
            });
        })), new StaticText_1.default({
            x: 44,
            y: 4,
        }, "Settings", 16), 
        // Keyboard movement
        ...makeSettingRow(40, "keyboard_control", "Keyboard movement"), 
        // Movement helper
        ...makeSettingRow(40 + 30, "movement_helper", "Movement helper"), (creditsButton = makeSettingGameUnrelatedButton(40 + 30 + 30, "Credits", () => {
            settingContainer.setVisible(false, creditsButton, true, 1 /* AnimationType.SLIDE */, {
                direction: "v",
                offsetSign: -1,
            });
            creditContainer.setVisible(true, creditsButton, true, 1 /* AnimationType.SLIDE */, {
                direction: "v",
                offsetSign: -1,
            });
        })), new Container_1.CoordinatedStaticSpace(15, 15, 150, 190 - 4));
        return settingContainer;
    }
    createCreditContainer() {
        let creditContainerCloser;
        const creditContainer = new Container_1.StaticPanelContainer({
            x: 72,
            y: 220,
            invertYCoordinate: true,
        }, true, "#aaaaaa", 0.1).addChildren((creditContainerCloser = new UICloseButton_1.default({
            x: 178 - 4,
            y: 5,
        }, 12, () => {
            creditContainer.setVisible(false, creditContainerCloser, true, 1 /* AnimationType.SLIDE */, {
                direction: "v",
                offsetSign: -1,
            });
        })), new StaticText_1.default({
            x: 62.5,
            y: 4,
        }, "Credits", 16), 
        // Yaaaaaaaaaaaaaaaaaaaaay
        new StaticText_1.default({
            x: 6 + .5,
            y: 35,
        }, "florr.io made by Matheus Valadares", 12, "#ffffff", "left", 130), new StaticText_1.default({
            x: 2 - .5,
            y: 77.5,
        }, "floooo.io made by Youdi3", 12), 
        // Icon credits
        new StaticText_1.default({
            x: 6,
            y: 100,
        }, "Some icons by Lorc & Skoll from game-icons.net", 10.75, "#ffffff", "left", 180), new StaticText_1.default({
            x: 6,
            y: 140,
        }, "Special thanks: Max Nest, k2r_n2iq and people who keep motivating me every time", 10.75, "#ffffff", "left", 180), new Container_1.CoordinatedStaticSpace(15, 15, 178, 180 + .5));
        return creditContainer;
    }
}
exports.default = UITitleSettingButton;
