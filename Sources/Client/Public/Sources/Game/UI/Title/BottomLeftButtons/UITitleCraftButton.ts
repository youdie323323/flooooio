import { Button } from "../../Layout/Components/WellKnown/Button";
import type { AutomaticallySizedLayoutOptions } from "../../Layout/Components/WellKnown/Container";
import { SVGLogo } from "../../Layout/Components/WellKnown/Logo";
import { makeTitleBottomLeftToolTippedButton, BOTTOM_LEFT_TOOLTIPPED_BUTTON_SIZE } from ".";
import MOLECULE_SVG from "../Assets/molecule.svg";

export default class UITitleCraftButton extends makeTitleBottomLeftToolTippedButton(
    Button,

    "Craft",
    6,
    "right",
) {
    constructor(
        layoutOptions: AutomaticallySizedLayoutOptions,
    ) {
        super(
            {
                ...layoutOptions,

                w: BOTTOM_LEFT_TOOLTIPPED_BUTTON_SIZE,
                h: BOTTOM_LEFT_TOOLTIPPED_BUTTON_SIZE,
            },

            3,

            3,
            1,

            [
                new SVGLogo(
                    {
                        w: BOTTOM_LEFT_TOOLTIPPED_BUTTON_SIZE,
                        h: BOTTOM_LEFT_TOOLTIPPED_BUTTON_SIZE,
                    },

                    MOLECULE_SVG,
                ),
            ],

            () => {
                console.log("ho");
            },

            "#db9d5a",

            true,
        );
    }
}