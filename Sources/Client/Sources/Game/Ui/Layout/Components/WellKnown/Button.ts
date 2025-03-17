import type { Components, Clickable, DynamicLayoutablePointer, Interactive, SetVisibleParameters, AnimationSlideDirection } from "../Component";
import { AnimationType , Component } from "../Component";
import ExtensionBase from "../../Extensions/Extension";
import type { ColorCode } from "../../../../../../../Shared/Utils/Color";
import { darkend } from "../../../../../../../Shared/Utils/Color";
import type { LayoutContext, LayoutOptions, LayoutResult } from "../../Layout";
import Layout from "../../Layout";
import type { AddableStaticContainer } from "./Container";
import { StaticHContainer, StaticPanelContainer } from "./Container";

/**
 * Abstract button class.
 * 
 * @remarks
 * When think of a normal button, can think of it as a combination of a StaticPanelContainer and a Text component.
 */
export class Button extends ExtensionBase(Component) implements Interactive, Clickable {
    private isPressed: boolean = false;
    private isHovered: boolean = false;

    private isValid: boolean = true;

    private bindedButtonContainer: AddableStaticContainer;

    /**
     * @param layout - Layout options for just like collision
     * @param buttonComponents - Components to be added to button visibility, which are not "added"
     */
    constructor(
        private layout: LayoutOptions,

        private buttonComponents: Array<Components>,

        private callback: () => void,

        private color: DynamicLayoutablePointer<ColorCode>,
        private validate: DynamicLayoutablePointer<boolean>,
    ) {
        super();

        this.once("onInitialized", () => {
            this.context.addComponent(this.bindedButtonContainer = this.context.createAddableContainer(
                new StaticPanelContainer(
                    () => ({
                        x: this.x,
                        y: this.y,
                    }),
                    () => this.getButtonColor(),
                ),
                [
                    this.context.createAddableContainer(
                        new StaticHContainer(
                            {
                                x: 0,
                                y: 0,
                            },
                        ),
                        this.buttonComponents,
                    ),
                ],
            ));
        });
    }

    override calculateLayout(lc: LayoutContext): LayoutResult {
        return Layout.layout(this.layout, lc);
    }

    override render(ctx: CanvasRenderingContext2D): void {
        if (!this.isRenderable) return;

        super.render(ctx);

        this.update();

        this.isValid = this.computeDynamicLayoutable(this.validate);
        if (!this.isValid) {
            this.isHovered = false;
            this.isPressed = false;
        }
    }

    override setVisible(...args: SetVisibleParameters[0]): void;
    override setVisible(...args: SetVisibleParameters[1]): void;
    override setVisible(...args: SetVisibleParameters[2]): void;
    override setVisible(
        toggle: boolean,
        shouldAnimate: boolean,
        animationType?: AnimationType,
        animationSlideDirection?: AnimationSlideDirection,
    ): void {
        if (shouldAnimate === true) {
            switch (animationType) {
                case AnimationType.Zoom: {
                    super.setVisible(toggle, shouldAnimate, animationType);

                    break;
                }

                case AnimationType.Slide: {
                    super.setVisible(toggle, shouldAnimate, animationType, animationSlideDirection);

                    break;
                }
            }
        } else {
            super.setVisible(toggle, shouldAnimate);
        }

        // Post-process for component-binded component

        // this?.bindedButtonContainer.setVisible?.(toggle, false);
    }

    override getCacheKey(): string {
        return super.getCacheKey() +
            Object.values(this.computeDynamicLayoutable(this.layout)).join("");
    }

    override invalidateLayoutCache(): void {
        this.layoutCache.invalidate();
    }

    public onFocus(): void {
        if (!this.isValid) {
            return;
        }

        this.context.canvas.style.cursor = "pointer";

        this.isHovered = true;
    }

    public onBlur(): void {
        if (!this.isValid) {
            return;
        }

        this.context.canvas.style.cursor = "default";

        this.isHovered = false;
        this.isPressed = false;
    }

    public onMouseDown(): void {
        if (!this.isValid) {
            return;
        }

        this.isPressed = true;
    }

    public onMouseUp(): void {
        if (!this.isValid) {
            return;
        }

        this.isPressed = false;
    }

    public onClick(): void {
        if (!this.isValid) {
            return;
        }

        this.callback();
    }

    protected getButtonColor(): ColorCode {
        if (!this.isValid) {
            return "#aaaaa9";
        }

        const computedColor = this.computeDynamicLayoutable(this.color);

        if (this.isPressed) {
            return darkend(computedColor, 0.1);
        } else if (this.isHovered) {
            return darkend(computedColor, -0.1);
        }

        return computedColor;
    }
}