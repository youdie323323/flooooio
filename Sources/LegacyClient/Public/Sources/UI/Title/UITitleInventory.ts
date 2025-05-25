import type { Components, MaybePointerLike } from "../Layout/Components/Component";
import type { AutomaticallySizedLayoutOptions } from "../Layout/Components/WellKnown/Container";
import { StaticSpace, StaticVContainer, StaticHContainer } from "../Layout/Components/WellKnown/Container";
import UIPetalPlaceholder from "../Shared/UIPetalPlaceholder";
import StaticText from "../Layout/Components/WellKnown/StaticText";
import { Centering } from "../Layout/Extensions/ExtensionCentering";

export default class UITitleInventory extends StaticVContainer {
    constructor(
        layoutOptions: MaybePointerLike<AutomaticallySizedLayoutOptions>,
    ) {
        super(
            layoutOptions,

            false,
        );

        const createRow = (placeholderSize: number, spaceWidth: number, count: number): StaticHContainer => {
            const row = new (Centering(StaticHContainer))({});

            for (let i = 0; i < count; i++) {
                row.addChild(new UIPetalPlaceholder({}, placeholderSize));

                // Add space if not last placeholder
                if (i < count - 1) {
                    row.addChild(new StaticSpace(spaceWidth, 0));
                }
            }

            return row;
        };

        const surfaceRow = createRow(35, 9, 10);
        const bottomRow = createRow(26, 7, 10);

        this.addChildren(
            surfaceRow,
            new StaticSpace(0, 8),
            bottomRow,
        );
    }
}