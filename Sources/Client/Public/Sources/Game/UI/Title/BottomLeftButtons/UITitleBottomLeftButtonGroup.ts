import type { MaybePointerLike } from "../../Layout/Components/Component";
import type { AutomaticallySizedLayoutOptions } from "../../Layout/Components/WellKnown/Container";
import { StaticSpace, StaticVContainer } from "../../Layout/Components/WellKnown/Container";
import UITitleDiscordCommunityButton from "./UITitleDiscordCommunityButton";
import UITitleInventoryButton from "./UITitleInventoryButton";
import UITitleCraftButton from "./UITitleCraftButton";
import UITitleChangelogButton from "./UITitleChangelogButton";
import UITitleSettingButton from "./UITitleSettingButton";

export default class UITitleBottomLeftButtonGroup extends StaticVContainer {
    private static readonly GAP_BETWEEN_BUTTONS: number = 10;

    constructor(
        layoutOptions: MaybePointerLike<AutomaticallySizedLayoutOptions>,
    ) {
        super(layoutOptions);

        const { GAP_BETWEEN_BUTTONS } = UITitleBottomLeftButtonGroup;

        this.addChildren(
            new UITitleDiscordCommunityButton({}),
            new StaticSpace(0, GAP_BETWEEN_BUTTONS),
            new UITitleInventoryButton({}),
            new StaticSpace(0, GAP_BETWEEN_BUTTONS),
            new UITitleCraftButton({}),
            new StaticSpace(0, GAP_BETWEEN_BUTTONS),
            new UITitleChangelogButton({}),
            new StaticSpace(0, GAP_BETWEEN_BUTTONS),
            new UITitleSettingButton({}),
        );
    }
}