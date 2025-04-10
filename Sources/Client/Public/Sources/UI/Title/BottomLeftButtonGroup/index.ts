import type { TooltipAnchorPosition } from "../../Layout/Extensions/ExtensionTooltip";
import Tooltip from "../../Layout/Extensions/ExtensionTooltip";
import Text from "../../Layout/Components/WellKnown/Text";
import type UISettingButton from "../../Shared/UISettingButton";
import type { Button } from "../../Layout/Components/WellKnown/Button";
import { CoordinatedStaticSpace } from "../../Layout/Components/WellKnown/Container";

export const BOTTOM_LEFT_TOOLTIPPED_BUTTON_SIZE = 35;

export const createTitleBottomLeftToolTippedButton = <T extends typeof Button | typeof UISettingButton>(
    ctor: T,

    description: string,
    positionOffset: number,
    position: TooltipAnchorPosition,
) => {
    return Tooltip(
        ctor,

        [
            new Text(
                { y: 5 },
                
                description,
                11,
            ),
            new CoordinatedStaticSpace(1, 1, 0, 22),
        ],
        positionOffset,
        position,
        true,
    );
};

export function dynamicJoinArray<T, S>(array: T[], separatorFn: () => S): (T | S)[] {
    return array.flatMap((item, index) => index ? [separatorFn(), item] : [item]);
}
