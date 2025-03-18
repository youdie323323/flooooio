import type { Components, MaybePointerLike } from "../Component";
import { Component } from "../Component";
import type { ColorCode } from "../../../../../../../Shared/Utils/Color";
import { darkend } from "../../../../../../../Shared/Utils/Color";
import type { PartialSizeLayoutOptions } from "./Container";
import { StaticHContainer, StaticPanelContainer } from "./Container";

/**
 * Abstract button class.
 * 
 * @remarks
 * When think of a normal button, can think of it as a combination of a StaticPanelContainer and a Text component.
 */
export class Button extends StaticPanelContainer {
    private isPressed: boolean = false;
    private isHovered: boolean = false;

    private isValid: boolean = true;

    /**
     * @param buttonComponents - Components to be added to button visibility, which are not "added"
     */
    constructor(
        layoutOptions: MaybePointerLike<PartialSizeLayoutOptions>,

        rectRadii: MaybePointerLike<number> = 1,

        strokeWidthLimit: MaybePointerLike<number> = 2,
        strokeWidthCoef: MaybePointerLike<number> = 1,

        protected readonly buttonComponents: Array<Components>,

        protected readonly callback: () => void,

        protected readonly buttonColor: MaybePointerLike<ColorCode>,
        protected readonly validate: MaybePointerLike<boolean>,
    ) {
        super(
            layoutOptions,

            () => this.getButtonColor(),

            rectRadii,

            strokeWidthLimit,
            strokeWidthCoef,
        );

        this.once("onInitialized", () => {
            this.context.addComponent(
                this.addChild(
                    new StaticHContainer(
                        {
                            x: 0,
                            y: 0,
                        },
                    ).addChildren(...this.buttonComponents),
                ),
            );
        });

        this.on("onFocus", () => {
            if (!this.isValid) {
                return;
            }

            this.context.canvas.style.cursor = "pointer";

            this.isHovered = true;
        });

        this.on("onBlur", () => {
            if (!this.isValid) {
                return;
            }

            this.context.canvas.style.cursor = "default";

            this.isHovered = false;
            this.isPressed = false;
        });

        this.on("onClick", () => {
            if (!this.isValid) {
                return;
            }

            this.callback();
        });

        this.on("onMouseDown", () => {
            if (!this.isValid) {
                return;
            }

            this.isPressed = true;
        });

        this.on("onMouseUp", () => {
            if (!this.isValid) {
                return;
            }

            this.isPressed = false;
        });
    }

    override render(ctx: CanvasRenderingContext2D): void {
        if (!this.isRenderable) return;

        super.render(ctx);

        this.isValid = Component.computePointerLike(this.validate);
        if (!this.isValid) {
            this.isHovered = false;
            this.isPressed = false;
        }
    }

    private getButtonColor(): ColorCode {
        if (!this.isValid) {
            return "#aaaaa9";
        }

        const computedColor = Component.computePointerLike(this.buttonColor);

        if (this.isPressed) {
            return darkend(computedColor, 0.1);
        } else if (this.isHovered) {
            return darkend(computedColor, -0.1);
        }

        return computedColor;
    }
}