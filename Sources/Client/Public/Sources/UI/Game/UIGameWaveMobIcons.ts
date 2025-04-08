import type Mob from "../../Entity/Mob";
import { isPetal } from "../../Entity/Petal";
import { AnimationType, type MaybePointerLike } from "../Layout/Components/Component";
import type { AutomaticallySizedLayoutOptions } from "../Layout/Components/WellKnown/Container";
import { StaticHContainer, StaticVContainer } from "../Layout/Components/WellKnown/Container";
import UIMobIcon from "../Shared/UIMobIcon";

interface MobIconMatch {
    type: boolean;
    rarity: boolean;
}

export default class UIGameWaveMobIcons extends StaticHContainer<StaticVContainer<UIMobIcon>> {
    private static readonly SPACING = 10;
    private static readonly BORDER_PADDING = 1;
    private static readonly VERTICAL_GAP = 6;

    constructor(layoutOptions: MaybePointerLike<AutomaticallySizedLayoutOptions>) {
        super(
            layoutOptions,
            true, // Lerp enabled
            UIMobIcon.ICON_SIZE + UIGameWaveMobIcons.SPACING + UIGameWaveMobIcons.BORDER_PADDING,
        );
    }

    private findVContainer(mobInstance: Mob, matchCriteria: MobIconMatch = { type: true, rarity: false }): StaticVContainer<UIMobIcon> | undefined {
        return this.getChildren().find(container =>
            container.getChildren().some(({ mobInstance: iconMobInstance }) =>
                this.isMobMatch(iconMobInstance, mobInstance, matchCriteria),
            ),
        );
    }

    private isMobMatch(mobA: Mob, mobB: Mob, { type, rarity }: MobIconMatch): boolean {
        return (
            (!type || mobA.type === mobB.type) &&
            (!rarity || mobA.rarity === mobB.rarity)
        );
    }

    private createMobIcon(mobInstance: Mob): UIMobIcon {
        const icon = new UIMobIcon({}, mobInstance);

        icon.setVisible(false, null, false);
        icon.setVisible(true, null, true, AnimationType.CARD);

        return icon;
    }

    private createVContainer(): StaticVContainer<UIMobIcon> {
        return new StaticVContainer<UIMobIcon>(
            {},

            true, // Lerp enabled

            UIGameWaveMobIcons.VERTICAL_GAP,
            true,
        );
    }

    private sortVContainerByRarity(container: StaticVContainer<UIMobIcon>): void {
        container.sortChildren(((a: UIMobIcon, b: UIMobIcon) =>
            a.mobInstance.rarity - b.mobInstance.rarity
        ) as Parameters<typeof container["sortChildren"]>[0]);
    }

    public addMobIcon(mobInstance: Mob): void {
        const vContainer = this.findVContainer(mobInstance) || this.createAndAddNewVContainer();
        const existingIcon = this.findExistingIcon(vContainer, mobInstance);

        if (existingIcon) {
            existingIcon.amountAccumulator++;
        } else {
            vContainer.addChild(this.createMobIcon(mobInstance));
        }

        this.sortVContainerByRarity(vContainer);
    }

    private createAndAddNewVContainer(): StaticVContainer<UIMobIcon> {
        const vContainer = this.createVContainer();

        this.addChild(vContainer);

        return vContainer;
    }

    private findExistingIcon(container: StaticVContainer<UIMobIcon>, mobInstance: Mob): UIMobIcon | undefined {
        return container.getChildren().find(icon =>
            this.isMobMatch(icon.mobInstance, mobInstance, { type: true, rarity: true }),
        );
    }

    public removeMobIcon(mobInstance: Mob): void {
        const vContainer = this.findVContainer(mobInstance, { type: true, rarity: true });
        if (!vContainer) return;

        const mobIcon = this.findExistingIcon(vContainer, mobInstance);
        if (!mobIcon) return;

        if (mobIcon.amountAccumulator > 1) {
            mobIcon.amountAccumulator--;

            return;
        }

        this.animateAndRemoveMobIcon(mobIcon, vContainer);
    }

    private animateAndRemoveMobIcon(mobIcon: UIMobIcon, vContainer: StaticVContainer<UIMobIcon>): void {
        mobIcon.once("onOutAnimationEnd", () => {
            vContainer.removeChild(mobIcon);
            this.removeEmptyContainer(vContainer);
        });

        mobIcon.setVisible(false, null, true, AnimationType.CARD);
        this.removeEmptyContainer(vContainer);
    }

    private removeEmptyContainer(vContainer: StaticVContainer<UIMobIcon>): void {
        if (vContainer.getChildren().length === 0) {
            this.removeChild(vContainer);
        }
    }

    public isIconableMobInstance({ type, isPet }: Mob): boolean {
        return !(isPetal(type) || isPet);
    }
}