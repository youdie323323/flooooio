import type { Components, MaybePointerLike } from "../Layout/Components/Component";
import type { AutomaticallySizedLayoutOptions } from "../Layout/Components/WellKnown/Container";
import { StaticSpace, StaticVContainer, StaticHContainer } from "../Layout/Components/WellKnown/Container";
import UIPetalPlaceholder from "../Shared/UIPetalPlaceholder";
import StaticText from "../Layout/Components/WellKnown/StaticText";
import { Centering } from "../Layout/Extensions/ExtensionCentering";

export default class UIGameInventory extends StaticVContainer {
    constructor(
        layoutOptions: MaybePointerLike<AutomaticallySizedLayoutOptions>,
    ) {
        super(
            layoutOptions,

            false,
        );

        const createRow = (placeholderSize: number, spaceWidth: number, count: number, isBottom: boolean): StaticHContainer => {
            const row = new (Centering(StaticHContainer))({});

            for (let i = 0; i < count; i++) {
                row.addChild(
                    isBottom
                        ? new StaticVContainer({}, false)
                            .addChildren(
                                new (Centering(UIPetalPlaceholder))({}, placeholderSize),
                                new StaticSpace(0, 5),
                                new (Centering(StaticText))({}, `[${(i + 1) % 10}]`, 8),
                            )
                        : new UIPetalPlaceholder({}, placeholderSize),
                );

                // Add space if not last placeholder
                if (i < count - 1) {
                    row.addChild(new StaticSpace(spaceWidth, 0));
                }
            }

            return row;
        };

        const surfaceRow = createRow(30, 12, 10, false);
        const bottomRow = createRow(22, 8, 10, true);

        this.addChildren(
            surfaceRow,
            new StaticSpace(0, 12),
            bottomRow,
        );
    }
}