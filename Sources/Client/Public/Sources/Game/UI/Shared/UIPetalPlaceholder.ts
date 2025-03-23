import { type MaybePointerLike } from "../Layout/Components/Component";
import type { SquareSizeLayoutOptions } from "../Layout/Components/WellKnown/Container";
import { StaticPanelContainer } from "../Layout/Components/WellKnown/Container";
import Mob from "../../Entity/Mob";

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

            "#ddf2e7",

            0.25,

            2.5,
            1,
        );
    }
}