import type Mob from "../../Entity/Mob";
import { isPetal } from "../../Entity/Petal";
import { MobType } from "../../Native/Entity/EntityType";
import { AnimationType, type MaybePointerLike } from "../Layout/Components/Component";
import type { AutomaticallySizedLayoutOptions } from "../Layout/Components/WellKnown/Container";
import { StaticHContainer, StaticVContainer } from "../Layout/Components/WellKnown/Container";
import UIMobIcon from "../Shared/UIMobIcon";

interface MobIconMatch {
    type: boolean;
    rarity: boolean;
}

export default class UIGameWaveMobIcons extends StaticHContainer<StaticVContainer<UIMobIcon>> {
    private static readonly SPACING = 10 as const;
    private static readonly BORDER_PADDING = 1 as const;
    private static readonly VERTICAL_GAP = 6 as const;
    private static readonly ICON_SIZE = 30 as const;

    constructor(layoutOptions: MaybePointerLike<AutomaticallySizedLayoutOptions>) {
        const { ICON_SIZE, SPACING, BORDER_PADDING } = UIGameWaveMobIcons;

        super(
            layoutOptions,
            true, // Lerp enabled
            ICON_SIZE + SPACING + BORDER_PADDING,
        );
    }

    private findVContainer(mobInstance: Mob, matchCriteria: MobIconMatch = { type: true, rarity: false }): StaticVContainer<UIMobIcon> | undefined {
        return this.getChildren().find(container =>
            container.getChildren().some(({ mob: iconMobInstance }) =>
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

    private createMobIcon(mob: Mob): UIMobIcon {
        const { ICON_SIZE } = UIGameWaveMobIcons;

        const icon = new UIMobIcon(
            {
                w: ICON_SIZE,
                h: ICON_SIZE,
            },

            mob,
        );

        icon.setVisible(false, null, false);
        icon.setVisible(true, null, true, AnimationType.CARD);

        return icon;
    }

    private createVContainer(): StaticVContainer<UIMobIcon> {
        const { VERTICAL_GAP } = UIGameWaveMobIcons;

        return new StaticVContainer<UIMobIcon>(
            {},

            true, // Lerp enabled

            VERTICAL_GAP,
            true,
        );
    }

    private sortVContainerByRarity(container: StaticVContainer<UIMobIcon>): void {
        container.sortChildren(((a: UIMobIcon, b: UIMobIcon) =>
            a.mob.rarity - b.mob.rarity
        ) as Parameters<typeof container["sortChildren"]>[0]);
    }

    public addMobIcon(mob: Mob): void {
        const vContainer = this.findVContainer(mob) || this.createAndAddNewVContainer();
        const existingIcon = this.findExistingIcon(vContainer, mob);

        if (existingIcon) {
            existingIcon.amount++;
        } else {
            vContainer.addChild(this.createMobIcon(mob));
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
            this.isMobMatch(icon.mob, mobInstance, { type: true, rarity: true }),
        );
    }

    public removeMobIcon(mobInstance: Mob): void {
        const vContainer = this.findVContainer(mobInstance, { type: true, rarity: true });
        if (!vContainer) return;

        const mobIcon = this.findExistingIcon(vContainer, mobInstance);
        if (!mobIcon) return;

        if (mobIcon.amount > 1) {
            mobIcon.amount--;

            return;
        }

        this.animateAndRemoveMobIcon(mobIcon, vContainer);
    }

    private animateAndRemoveMobIcon(icon: UIMobIcon, vContainer: StaticVContainer<UIMobIcon>): void {
        icon.once("onOutAnimationEnd", () => {
            vContainer.removeChild(icon);

            this.removeEmptyContainer(vContainer);
        });

        icon.setVisible(false, null, true, AnimationType.CARD);
        
        this.removeEmptyContainer(vContainer);
    }

    private removeEmptyContainer(vContainer: StaticVContainer<UIMobIcon>): void {
        if (vContainer.getChildren().length === 0) {
            this.removeChild(vContainer);
        }
    }

    public isIconableMobInstance({ type, isPet }: Mob): boolean {
        return !(isPetal(type) || isPet || type === MobType.MISSILE_PROJECTILE);
    }
}