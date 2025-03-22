import { isPetal } from "../../../../../../Shared/Entity/Dynamics/Mob/Petal/Petal";
import type Mob from "../../Entity/Mob";
import { AnimationType, type MaybePointerLike } from "../Layout/Components/Component";
import type { AutomaticallySizedLayoutOptions} from "../Layout/Components/WellKnown/Container";
import { StaticHContainer, StaticVContainer } from "../Layout/Components/WellKnown/Container";
import UIMobIcon from "../Shared/UIMobIcon";

export default class UIGameWaveEnemyIcons extends StaticHContainer<StaticVContainer<UIMobIcon>> {
    constructor(layoutOptions: MaybePointerLike<AutomaticallySizedLayoutOptions>) {
        super(
            layoutOptions,

            // Lerp enabled
            true,
            false,
            UIMobIcon.ICON_SIZE + 10 + 1,
        );
    }

    public addMobIcon(mobInstance: Mob): void {
        const vContainerToAdd =
            this.getChildren()
                .find(
                    container =>
                        container.getChildren().find(
                            c =>
                                c.mobInstance.type === mobInstance.type,
                        ),
                );

        const createMobIcon = (): UIMobIcon => {
            const icon = new UIMobIcon(
                {
                    x: 0,
                    y: 0,
                },

                mobInstance,
            );

            // Animation on appear
            icon.setVisible(false, false);
            icon.setVisible(true, true, AnimationType.CARD, {});

            return icon;
        };

        if (vContainerToAdd) {
            const existingMobIcon = vContainerToAdd.getChildren()
                .find(
                    c =>
                        c.mobInstance.type === mobInstance.type &&
                        c.mobInstance.rarity === mobInstance.rarity,
                );

            if (existingMobIcon) {
                existingMobIcon.mobAmountAccumulator++;
            } else {
                vContainerToAdd.addChild(createMobIcon());
            }

            vContainerToAdd.sortChildren(
                (({ mobInstance: mobA }: UIMobIcon, { mobInstance: mobB }: UIMobIcon) => mobA.rarity - mobB.rarity) as
                Parameters<typeof vContainerToAdd["sortChildren"]>[0],
            );
        } else {
            const vContainer = new StaticVContainer<UIMobIcon>(
                {
                    x: 0,
                    y: 0,
                },

                // Lerp enabled
                true,
                
                false,
                6,
                true,
            );

            vContainer.addChild(createMobIcon());

            this.addChild(vContainer);
        }
    }

    public removeMobIcon(mobInstance: Mob): void {
        const vContainerToRemoveFrom = this.getChildren()
            .find(
                container => container.getChildren().some(
                    c =>
                        c.mobInstance.type === mobInstance.type &&
                        c.mobInstance.rarity === mobInstance.rarity,
                ),
            );

        if (!vContainerToRemoveFrom) return;

        const mobIcon = vContainerToRemoveFrom.getChildren()
            .find(
                c =>
                    c.mobInstance.type === mobInstance.type &&
                    c.mobInstance.rarity === mobInstance.rarity,
            );

        if (!mobIcon) return;

        const checksumVContainer = (): void => {
            if (vContainerToRemoveFrom.getChildren().length === 0) {
                this.removeChild(vContainerToRemoveFrom);
            }
        };

        if (mobIcon.mobAmountAccumulator > 1) {
            mobIcon.mobAmountAccumulator--;
        } else {
            mobIcon.once("onAnimationHide", () => {
                vContainerToRemoveFrom.removeChild(mobIcon);

                checksumVContainer();
            });

            mobIcon.setVisible(false, true, AnimationType.CARD, {});
        }

        checksumVContainer();
    }

    public isIconableMobInstance({ type, isPet }: Mob): boolean {
        return !(
            isPetal(type) ||
            isPet
        );
    }
}