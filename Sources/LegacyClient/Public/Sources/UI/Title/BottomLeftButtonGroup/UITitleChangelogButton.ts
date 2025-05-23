import { Button } from "../../Layout/Components/WellKnown/Button";
import { SVGLogo } from "../../Layout/Components/WellKnown/Logo";
import SCROLL_UNFURLED_SVG from "../Assets/scroll_unfurled.svg";
import { CoordinatedStaticSpace, StaticScrollableContainer, StaticSpace, type AutomaticallySizedLayoutOptions, StaticPanelContainer } from "../../Layout/Components/WellKnown/Container";
import type { DummySetVisibleToggleType, DummySetVisibleObserverType, ComponentCloser } from "../../Layout/Components/Component";
import { AnimationType } from "../../Layout/Components/Component";
import { Centering } from "../../Layout/Extensions/ExtensionCentering";
import UICloseButton from "../../Shared/UICloseButton";
import StaticText from "../../Layout/Components/WellKnown/StaticText";
import { createTitleBottomLeftToolTippedButton, BOTTOM_LEFT_TOOLTIPPED_BUTTON_SIZE, dynamicJoinArray } from ".";

export default class UITitleChangelogButton extends createTitleBottomLeftToolTippedButton(
    Button,

    "Changelog",
    6,
    "right",
) {
    private changelogContainer: StaticPanelContainer;

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

                    SCROLL_UNFURLED_SVG,
                ),
            ],

            () => {
                this.changelogContainer.setVisible(
                    <DummySetVisibleToggleType>!this.changelogContainer.desiredVisible,
                    <DummySetVisibleObserverType><unknown>(this),
                    true,
                    AnimationType.SLIDE,
                    {
                        direction: "v",
                        offsetSign: -1,
                    },
                );
            },

            "#9bb56b",

            true,
        );

        this.once("onInitialized", () => {
            this.changelogContainer = this.createChangelogContainer();

            // Initialize as hidden
            this.changelogContainer.setVisible(false, null, false);

            this.context.addComponent(this.changelogContainer);
        });
    }

    private createChangelogContainer(): StaticPanelContainer {
        let changelogContainerCloser: UICloseButton;

        let changelogContainerContentContainer: StaticScrollableContainer;

        const changelogContainer: StaticPanelContainer = new StaticPanelContainer(
            () => ({
                x: 72,
                y: 15 + changelogContainer.h,

                invertYCoordinate: true,
            }),

            true,

            "#9bb56b",
            0.1,
        ).addChildren(
            (changelogContainerCloser = new UICloseButton(
                {
                    x: 314 - 4,
                    y: 5,
                },
                12,

                () => {
                    changelogContainer.setVisible(
                        false,
                        <ComponentCloser><unknown>changelogContainerCloser,
                        true,
                        AnimationType.SLIDE,
                        {
                            direction: "v",
                            offsetSign: -1,
                        },
                    );
                },
            )),

            new CoordinatedStaticSpace(15, 15, 313.5, 0),

            new StaticText(
                {
                    x: 118,
                    y: 4,
                },

                "Changelog",
                16,
            ),

            (changelogContainerContentContainer = new StaticScrollableContainer(
                {
                    x: 4,
                    y: 40,

                    w: 323,
                    h: 220,
                },

                5.5,
                75,
            ).addChildren(
                ...dynamicJoinArray(
                    Array.from({ length: 50 }, () => new (Centering(StaticText))(
                        {},

                        "Older changelog entries not available",
                        9.5,
                        "#ffffff",
                        "center",
                    )),
                    () => new StaticSpace(0, 10),
                ),
            )),
        );

        return changelogContainer;
    }
}