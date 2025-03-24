import { type MaybePointerLike } from "../Layout/Components/Component";
import type { SquareSizeLayoutOptions } from "../Layout/Components/WellKnown/Container";
import { StaticPanelContainer } from "../Layout/Components/WellKnown/Container";

export default class UIPetalPlaceholder extends StaticPanelContainer {
    constructor(
        layoutOptions: MaybePointerLike<SquareSizeLayoutOptions>,

        size: number,
    ) {
        super(
            {
                ...layoutOptions,

                w: size,
                h: size,
            },

            false,

            "#ddf2e7",

            0.25,

            4,
            0.085,
        );
    }
}