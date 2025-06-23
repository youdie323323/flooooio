"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Container_1 = require("../Layout/Components/WellKnown/Container");
const UIGameOtherPlayerStatus_1 = __importDefault(require("./UIGameOtherPlayerStatus"));
const UIGameSelfPlayerStatus_1 = __importDefault(require("./UIGameSelfPlayerStatus"));
class UIGamePlayerStatuses extends Container_1.StaticVContainer {
    constructor(layoutOptions) {
        super(layoutOptions);
        this.statuses = new Map();
        this.addChild(this.otherPlayerStatuses = new Container_1.StaticVContainer({}, false, 45));
    }
    addPlayer(player, isSelf) {
        if (isSelf) {
            const status = new UIGameSelfPlayerStatus_1.default({}, player);
            this.prependChild(new Container_1.StaticSpace(0, 45));
            this.prependChild(status);
            this.statuses.set(player, status);
        }
        else {
            const status = new UIGameOtherPlayerStatus_1.default({}, player);
            this.otherPlayerStatuses.addChild(status);
            this.statuses.set(player, status);
        }
    }
    removePlayer(player, isSelf) {
        const status = this.statuses.get(player);
        if (status) {
            if (isSelf) {
                this.removeChild(status);
            }
            else {
                this.otherPlayerStatuses.removeChild(status);
            }
        }
    }
    destroy() {
        super.destroy();
        this.statuses.clear();
        this.statuses = null;
    }
}
exports.default = UIGamePlayerStatuses;
