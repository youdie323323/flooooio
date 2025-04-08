import { Rarity } from "../../../Native/Rarity";
import { PetalType } from "../../../Native/Entity/EntityType";
import Mob from "../../../Entity/Mob";
import type { FakeSetVisibleToggleType, FakeSetVisibleObserverType, ComponentCloser } from "../../Layout/Components/Component";
import { AnimationType } from "../../Layout/Components/Component";
import { Button } from "../../Layout/Components/WellKnown/Button";
import type { AutomaticallySizedLayoutOptions } from "../../Layout/Components/WellKnown/Container";
import { StaticPanelContainer, CoordinatedStaticSpace, StaticVContainer, StaticHContainer, StaticSpace } from "../../Layout/Components/WellKnown/Container";
import { SVGLogo } from "../../Layout/Components/WellKnown/Logo";
import { Centering } from "../../Layout/Extensions/ExtensionCentering";
import UICloseButton from "../../Shared/UICloseButton";
import UIDraggableMobIcon from "../../Shared/UIDraggableMobIcon";
import { createTitleBottomLeftToolTippedButton, BOTTOM_LEFT_TOOLTIPPED_BUTTON_SIZE, dynamicJoinArray } from ".";
import Text from "../../Layout/Components/WellKnown/Text";
import SWAP_BAG_SVG from "../Assets/swap_bag.svg";

export default class UITitleInventoryButton extends createTitleBottomLeftToolTippedButton(
    Button,

    "Inventory",
    6,
    "right",
) {
    private inventoryContainer: StaticPanelContainer;

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

                    SWAP_BAG_SVG,
                ),
            ],

            () => {
                this.inventoryContainer.setVisible(
                    <FakeSetVisibleToggleType>!this.inventoryContainer.desiredVisible,
                    <FakeSetVisibleObserverType><unknown>(this),
                    true,
                    AnimationType.SLIDE,
                    {
                        direction: "v",
                        offsetSign: -1,
                    },
                );
            },

            "#599dd8",

            true,
        );

        this.once("onInitialized", () => {
            this.inventoryContainer = this.createInventoryContainer();

            // Initialize as hidden
            this.inventoryContainer.setVisible(false, null, false);

            this.context.addComponent(this.inventoryContainer);
        });
    }

    private createInventoryContainer(): StaticPanelContainer {
        let inventoryContainerCloser: UICloseButton;

        const inventoryContainer: StaticPanelContainer = new StaticPanelContainer(
            () => ({
                x: 72,
                y: 15 + inventoryContainer.h,

                invertYCoordinate: true,
            }),

            true,

            "#5a9fdb",
            0.1,
        ).addChildren(
            (inventoryContainerCloser = new UICloseButton(
                {
                    x: 246 - 4,
                    y: 5,
                },
                12,

                () => {
                    inventoryContainer.setVisible(
                        false,
                        <ComponentCloser><unknown>inventoryContainerCloser,
                        true,
                        AnimationType.SLIDE,
                        {
                            direction: "v",
                            offsetSign: -1,
                        },
                    );
                },
            )),

            new CoordinatedStaticSpace(15, 15, 245.5, 0),

            new Text(
                {
                    x: 88,
                    y: 4,
                },
                "Inventory",
                16,
            ),

            new Text(
                {
                    x: 50,
                    y: 40,
                },
                "Click on a petal to equip it",
                11,
            ),

            new StaticVContainer(
                {
                    x: 5,
                    y: 60,
                },

                false,
            ).addChildren(
                ...dynamicJoinArray(
                    Array.from({ length: 2 }, () => new (Centering(StaticHContainer))({}).addChildren(
                        ...dynamicJoinArray(
                            Array.from({ length: 6 }, () => {
                                const icon: UIDraggableMobIcon = new UIDraggableMobIcon(
                                    {},

                                    new Mob(
                                        -1,
                                        0,
                                        0,
                                        0,
                                        0,
                                        0,
                                        PetalType.BASIC,
                                        Rarity.COMMON,
                                        false,
                                        false,
                                    ),

                                    1,
                                );

                                return icon;
                            }),
                            () => new StaticSpace(8, 0),
                        ),
                    )),
                    () => new StaticSpace(0, 8),
                ),
                new StaticSpace(0, 5),
            ),
        );

        return inventoryContainer;
    }
}