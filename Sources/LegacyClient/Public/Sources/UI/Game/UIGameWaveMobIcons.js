"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Petal_1 = require("../../Entity/Petal");
const Container_1 = require("../Layout/Components/WellKnown/Container");
const UIMobIcon_1 = __importDefault(require("../Shared/UIMobIcon"));
class UIGameWaveMobIcons extends Container_1.StaticHContainer {
    static { this.SPACING = 10; }
    static { this.BORDER_PADDING = 1; }
    static { this.VERTICAL_GAP = 6; }
    static { this.ICON_SIZE = 30; }
    constructor(layoutOptions) {
        const { ICON_SIZE, SPACING, BORDER_PADDING } = UIGameWaveMobIcons;
        super(layoutOptions, true, // Lerp enabled
        ICON_SIZE + SPACING + BORDER_PADDING);
    }
    findVContainer(mobInstance, matchCriteria = { type: true, rarity: false }) {
        return this.getChildren().find(container => container.getChildren().some(({ mob: iconMobInstance }) => this.isMobMatch(iconMobInstance, mobInstance, matchCriteria)));
    }
    isMobMatch(mobA, mobB, { type, rarity }) {
        return ((!type || mobA.type === mobB.type) &&
            (!rarity || mobA.rarity === mobB.rarity));
    }
    createMobIcon(mob) {
        const { ICON_SIZE } = UIGameWaveMobIcons;
        const icon = new UIMobIcon_1.default({
            w: ICON_SIZE,
            h: ICON_SIZE,
        }, mob);
        icon.setVisible(false, null, false);
        icon.setVisible(true, null, true, 3 /* AnimationType.CARD */);
        return icon;
    }
    createVContainer() {
        const { VERTICAL_GAP } = UIGameWaveMobIcons;
        return new Container_1.StaticVContainer({}, true, // Lerp enabled
        VERTICAL_GAP, true);
    }
    sortVContainerByRarity(container) {
        container.sortChildren(((a, b) => a.mob.rarity - b.mob.rarity));
    }
    addMobIcon(mob) {
        const vContainer = this.findVContainer(mob) || this.createAndAddNewVContainer();
        const existingIcon = this.findExistingIcon(vContainer, mob);
        if (existingIcon) {
            existingIcon.amount++;
        }
        else {
            vContainer.addChild(this.createMobIcon(mob));
        }
        this.sortVContainerByRarity(vContainer);
    }
    createAndAddNewVContainer() {
        const vContainer = this.createVContainer();
        this.addChild(vContainer);
        return vContainer;
    }
    findExistingIcon(container, mobInstance) {
        return container.getChildren().find(icon => this.isMobMatch(icon.mob, mobInstance, { type: true, rarity: true }));
    }
    removeMobIcon(mobInstance) {
        const vContainer = this.findVContainer(mobInstance, { type: true, rarity: true });
        if (!vContainer)
            return;
        const mobIcon = this.findExistingIcon(vContainer, mobInstance);
        if (!mobIcon)
            return;
        if (mobIcon.amount > 1) {
            mobIcon.amount--;
            return;
        }
        this.animateAndRemoveMobIcon(mobIcon, vContainer);
    }
    animateAndRemoveMobIcon(icon, vContainer) {
        icon.once("onOutAnimationEnd", () => {
            vContainer.removeChild(icon);
            this.removeEmptyContainer(vContainer);
        });
        icon.setVisible(false, null, true, 3 /* AnimationType.CARD */);
        this.removeEmptyContainer(vContainer);
    }
    removeEmptyContainer(vContainer) {
        if (vContainer.getChildren().length === 0) {
            this.removeChild(vContainer);
        }
    }
    isIconableMobInstance({ type, isPet }) {
        return !((0, Petal_1.isPetal)(type) || isPet || type === 18 /* MobType.MISSILE_PROJECTILE */);
    }
}
exports.default = UIGameWaveMobIcons;
