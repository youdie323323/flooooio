import { Biome } from "../../../../../../Shared/Biome";
import type { ColorCode } from "../../../../../../Shared/Utils/Color";
import type { MaybePointerLike } from "../Layout/Components/Component";
import type { ButtonCallback } from "../Layout/Components/WellKnown/Button";
import { Button } from "../Layout/Components/WellKnown/Button";
import type { AutomaticallySizedLayoutOptions } from "../Layout/Components/WellKnown/Container";
import { StaticHContainer } from "../Layout/Components/WellKnown/Container";
import { SVGLogo } from "../Layout/Components/WellKnown/Logo";
import UISettingButton from "../Shared/UISettingButton";
import Text from "../Layout/Components/WellKnown/Text";

export default class UITitleBiomeSwitcher extends StaticHContainer {
    constructor(
        layoutOptions: MaybePointerLike<AutomaticallySizedLayoutOptions>,
    ) {
        super(layoutOptions);


    }

    private createBiomeSwitchButton(
        name: string,

        color: ColorCode,

        callback: ButtonCallback,
    ): Button {
        return new Button(
            {
                w: 42,
                h: 11,
            },

            3,

            3,
            1,

            [
                new Text(
                    {},

                    name,
                    10,
                ),
            ],

            callback,

            color,

            true,
        );
    }
}