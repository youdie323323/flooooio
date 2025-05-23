import type { ButtonCallback } from "../../Layout/Components/WellKnown/Button";
import { Button } from "../../Layout/Components/WellKnown/Button";
import { createTitleBottomLeftToolTippedButton, BOTTOM_LEFT_TOOLTIPPED_BUTTON_SIZE } from ".";
import { CoordinatedStaticSpace, type AutomaticallySizedLayoutOptions, StaticPanelContainer } from "../../Layout/Components/WellKnown/Container";
import type { DummySetVisibleToggleType, DummySetVisibleObserverType, ComponentCloser } from "../../Layout/Components/Component";
import { AnimationType } from "../../Layout/Components/Component";
import UICloseButton from "../../Shared/UICloseButton";
import StaticText from "../../Layout/Components/WellKnown/StaticText";
import UISettingButton from "../../Shared/UISettingButton";
import type { FlooooIoDefaultSettingKeys } from "../../../Utils/SettingStorage";
import SettingStorage from "../../../Utils/SettingStorage";
import Toggle from "../../Layout/Components/WellKnown/Toggle";

export default class UITitleSettingButton extends createTitleBottomLeftToolTippedButton(
    UISettingButton,

    "Settings",
    6,
    "right",
) {
    private creditContainer: StaticPanelContainer;
    private settingContainer: StaticPanelContainer;

    constructor(
        layoutOptions: AutomaticallySizedLayoutOptions,
    ) {
        super(
            layoutOptions,

            BOTTOM_LEFT_TOOLTIPPED_BUTTON_SIZE,

            () => {
                this.settingContainer.setVisible(
                    <DummySetVisibleToggleType>!this.settingContainer.desiredVisible,
                    <DummySetVisibleObserverType><unknown>(this),
                    true,
                    AnimationType.SLIDE,
                    {
                        // For some reason, the animation speed of the setting container in the original game is fast lol
                        defaultDurationOverride: 150,

                        direction: "v",
                        offsetSign: -1,
                    },
                );
            },
        );

        this.once("onInitialized", () => {
            this.creditContainer = this.createCreditContainer();

            this.settingContainer = this.createSettingContainer(this.creditContainer);

            { // Add credit container
                this.creditContainer.setVisible(false, null, false);

                this.context.addComponent(this.creditContainer);
            }

            { // Add setting container
                this.settingContainer.setVisible(false, null, false);

                this.context.addComponent(this.settingContainer);
            }
        });
    }

    private createSettingContainer(creditContainer: ReturnType<typeof UITitleSettingButton["prototype"]["createCreditContainer"]>): StaticPanelContainer {
        const makeSettingRow = (y: number, settingKey: FlooooIoDefaultSettingKeys, description: string): [
            Toggle,
            StaticText,
        ] => {
            const settingToggle = new Toggle(
                {
                    x: 5,
                    y: y - 1,
                    w: 17,
                    h: 17,
                },

                (t: boolean): void => {
                    settingToggle.setToggle(t);

                    SettingStorage.set(settingKey, t);
                },
            )
                // Load existed setting
                .setToggle(SettingStorage.get(settingKey));

            return [
                settingToggle,

                new StaticText(
                    {
                        x: 26 - .5,
                        y: y + 1 + .5,
                    },
                    description,
                    11,
                ),
            ];
        };

        const makeSettingGameUnrelatedButton = (
            y: number,

            text: string,

            callback: ButtonCallback,
        ): Button => {
            return new Button(
                {
                    x: 5,
                    y,

                    w: 138,
                    h: 14,
                },

                2,

                3,
                1,

                [
                    new StaticText(
                        () => ({
                            x: 45,
                            y: 1,
                        }),

                        text,
                        11,
                    ),
                ],

                callback,

                "#aaaaaa",

                true,
            );
        };

        let settingContainerCloser: UICloseButton;

        let creditsButton: Button;

        const settingContainer = new StaticPanelContainer(
            {
                x: 72,
                y: 225 + .5,

                invertYCoordinate: true,
            },

            true,

            "#aaaaaa",
            0.1,
        ).addChildren(
            (settingContainerCloser = new UICloseButton(
                {
                    x: 150 - 4,
                    y: 2,
                },

                12,

                () => {
                    settingContainer.setVisible(
                        false,
                        <ComponentCloser><unknown>settingContainerCloser,
                        true,
                        AnimationType.SLIDE,
                        {
                            direction: "v",
                            offsetSign: -1,
                        },
                    );
                },
            )),

            new StaticText(
                {
                    x: 44,
                    y: 4,
                },

                "Settings",
                16,
            ),

            // Keyboard movement
            ...makeSettingRow(40, "keyboard_control", "Keyboard movement"),

            // Movement helper
            ...makeSettingRow(40 + 30, "movement_helper", "Movement helper"),

            (creditsButton = makeSettingGameUnrelatedButton(40 + 30 + 30, "Credits", () => {
                settingContainer.setVisible(
                    false,
                    <ComponentCloser><unknown>creditsButton,
                    true,
                    AnimationType.SLIDE,
                    {
                        direction: "v",
                        offsetSign: -1,
                    },
                );

                creditContainer.setVisible(
                    <DummySetVisibleToggleType>true,
                    <DummySetVisibleObserverType><unknown>creditsButton,
                    true,
                    AnimationType.SLIDE,
                    {
                        direction: "v",
                        offsetSign: -1,
                    },
                );
            })),

            new CoordinatedStaticSpace(15, 15, 150, 190 - 4),
        );

        return settingContainer;
    }

    private createCreditContainer(): StaticPanelContainer {
        let creditContainerCloser: UICloseButton;

        const creditContainer = new StaticPanelContainer(
            {
                x: 72,
                y: 220,

                invertYCoordinate: true,
            },

            true,

            "#aaaaaa",
            0.1,
        ).addChildren(
            (creditContainerCloser = new UICloseButton(
                {
                    x: 178 - 4,
                    y: 5,
                },
                12,

                () => {
                    creditContainer.setVisible(
                        false,
                        <ComponentCloser><unknown>creditContainerCloser,
                        true,
                        AnimationType.SLIDE,
                        {
                            direction: "v",
                            offsetSign: -1,
                        },
                    );
                },
            )),

            new StaticText(
                {
                    x: 62.5,
                    y: 4,
                },

                "Credits",
                16,
            ),

            // Yaaaaaaaaaaaaaaaaaaaaay
            new StaticText(
                {
                    x: 6 + .5,
                    y: 35,
                },

                "florr.io made by Matheus Valadares",
                12,
                "#ffffff",
                "left",
                130,
            ),
            new StaticText(
                {
                    x: 2 - .5,
                    y: 77.5,
                },

                "floooo.io made by Youdi3",
                12,
            ),

            // Icon credits
            new StaticText(
                {
                    x: 6,
                    y: 100,
                },

                "Some icons by Lorc & Skoll from game-icons.net",
                10.75,
                "#ffffff",
                "left",
                180,
            ),

            new StaticText(
                {
                    x: 6,
                    y: 140,
                },

                "Special thanks: Max Nest, k2r_n2iq and people who keep motivating me every time",
                10.75,
                "#ffffff",
                "left",
                180,
            ),

            new CoordinatedStaticSpace(15, 15, 178, 180 + .5),
        );

        return creditContainer;
    }
}