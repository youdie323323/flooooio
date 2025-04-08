import type { ButtonCallback } from "../Layout/Components/WellKnown/Button";
import { Button } from "../Layout/Components/WellKnown/Button";
import { SVGLogo } from "../Layout/Components/WellKnown/Logo";
import CLOSE_ICON_SVG from "./Assets/close_icon.svg";
import type { SquareSizeLayoutOptions } from "../Layout/Components/WellKnown/Container";

// TODO: this should be DynamicLayoutable
export default class UICloseButton extends Button {
    constructor(
        layoutOptions: SquareSizeLayoutOptions,
        
        size: number,
        
        callback: ButtonCallback,
    ) {
        super(
            {
                ...layoutOptions,

                w: size,
                h: size,
            },

            2,

            2.5,
            1,

            [
                new SVGLogo(
                    {
                        w: size,
                        h: size,
                    },
                    
                    CLOSE_ICON_SVG,
                    0.95,
                ),
            ],

            callback,

            "#bb5555",
            true,
        );
    }
}