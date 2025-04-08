import { Button } from "../../Layout/Components/WellKnown/Button";
import type { AutomaticallySizedLayoutOptions } from "../../Layout/Components/WellKnown/Container";
import { SVGLogo } from "../../Layout/Components/WellKnown/Logo";
import { createTitleBottomLeftToolTippedButton, BOTTOM_LEFT_TOOLTIPPED_BUTTON_SIZE } from ".";
import DISCORD_ICON_SVG from "../Assets/discord_icon.svg";

export default class UITitleDiscordCommunityButton extends createTitleBottomLeftToolTippedButton(
    Button,

    "Join our Discord community!",
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

                    DISCORD_ICON_SVG,
                    0.7,
                ),
            ],

            () => {
                const windowProxy = window.open("unko");
                windowProxy.document.write('まだ実装されてないわボケー');
            },

            "#5865f2",

            true,
        );
    }
}