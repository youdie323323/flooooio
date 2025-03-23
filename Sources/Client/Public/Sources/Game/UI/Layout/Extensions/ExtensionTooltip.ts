import type { AnimationConfigOf, Components, MaybePointerLike } from "../Components/Component";
import { AnimationType, OBSTRUCTION_AFFECTABLE } from "../Components/Component";
import type { PartialSizeLayoutOptions } from "../Components/WellKnown/Container";
import { StaticTranslucentPanelContainer } from "../Components/WellKnown/Container";
import type { ComponentExtensionTemplate, ExtensionConstructor } from "./Extension";

export type TooltipPosition = "top" | "bottom" | "left" | "right";

export const DEFAULT_TOOLTIP_POSITIONS = ["top", "bottom", "left", "right"] as const;

export default function Tooltip<T extends ExtensionConstructor>(
    Base: T,

    tooltipComponents: Array<Components>,
    tooltipOffset: number,
    tooltipPreferredPositions: ReadonlyArray<TooltipPosition> = DEFAULT_TOOLTIP_POSITIONS,
    tooltipRectRadii: MaybePointerLike<number> = 3,
) {
    // For safety
    tooltipPreferredPositions = tooltipPreferredPositions.concat(
        DEFAULT_TOOLTIP_POSITIONS.filter(pos => tooltipPreferredPositions.indexOf(pos) === -1),
    );

    abstract class MixedBase extends Base implements ComponentExtensionTemplate {
        private static readonly TOOLTIP_CONTAINER_ANIMATION_CONFIG = {
            defaultDurationOverride: 100,
        } as const satisfies AnimationConfigOf<AnimationType.FADE>;

        private tooltipContainer: StaticTranslucentPanelContainer;

        constructor(...args: ReadonlyArray<any>) {
            super(...args);

            this.once("onInitialized", () => {
                this.tooltipContainer =
                    new StaticTranslucentPanelContainer(
                        () => this.findOptimalPosition(),

                        tooltipRectRadii,
                    ).addChildren(...tooltipComponents);

                // Avoid tooltip blocking other components overlap
                this.tooltipContainer[OBSTRUCTION_AFFECTABLE] = false;

                // Not visible first
                this.tooltipContainer.setVisible(false, false);

                this.context.addComponent(this.tooltipContainer);
            });

            this.on("onFocus", () => {
                this.tooltipContainer.setVisible(true, true, AnimationType.FADE, MixedBase.TOOLTIP_CONTAINER_ANIMATION_CONFIG);
            });

            this.on("onBlur", () => {
                this.tooltipContainer.setVisible(false, true, AnimationType.FADE, MixedBase.TOOLTIP_CONTAINER_ANIMATION_CONFIG);
            });
        }

        override get update(): ComponentExtensionTemplate["update"] {
            return (ctx: CanvasRenderingContext2D): void => {
                // Call parent extension update(), so its possible to nest the extension
                super.update?.(ctx);
            };
        }

        private findOptimalPosition(): PartialSizeLayoutOptions {
            const {
                x: targetX,
                y: targetY,
                w: targetWidth,
                h: targetHeight,
            } = this;

            const {
                w: tooltipWidth,
                h: tooltipHeight,
            } = this.tooltipContainer;

            for (const position of tooltipPreferredPositions) {
                let x = 0;
                let y = 0;

                switch (position) {
                    case "top":
                        x = targetX + (targetWidth / 2) - (tooltipWidth / 2);
                        y = targetY - tooltipHeight - tooltipOffset;

                        break;

                    case "bottom":
                        x = targetX + (targetWidth / 2) - (tooltipWidth / 2);
                        y = targetY + targetHeight + tooltipOffset;

                        break;

                    case "left":
                        x = targetX - tooltipWidth - tooltipOffset;
                        y = targetY + (targetHeight / 2) - (tooltipHeight / 2);

                        break;

                    case "right":
                        x = targetX + targetWidth + tooltipOffset;
                        y = targetY + (targetHeight / 2) - (tooltipHeight / 2);

                        break;
                }

                // Check if tooltip fits within window bounds
                if (
                    x >= 0 &&
                    y >= 0 &&
                    x + tooltipWidth <= this.context.canvas.width &&
                    y + tooltipHeight <= this.context.canvas.height
                ) {
                    return { x, y };
                }
            }

            return { x: 0, y: 0 };
        }

        override destroy(): void {
            this.tooltipContainer.destroy();

            super.destroy();
        }
    }

    return MixedBase;
}