import type { Components, MaybePointerLike } from "../Components/Component";
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
    abstract class MixedBase extends Base implements ComponentExtensionTemplate {
        private static readonly OPACITY_START: number = 0;
        private static readonly OPACITY_END: number = 1;
        private static readonly OPACITY_CONTAINER_END: number = 0.5;
        private static readonly OPACITY_STEP: number = 0.035;
        private static readonly OPACITY_STEP_INTERVAL: number = 1;

        private opacity: number = MixedBase.OPACITY_START;
        private opacityInterval: NodeJS.Timeout | null = null;
        private isFocused: boolean = false;

        private tooltipContainer: StaticTranslucentPanelContainer;

        constructor(...args: ReadonlyArray<any>) {
            super(...args);

            this.once("onInitialized", () => {
                this.context.addComponent(
                    (
                        this.tooltipContainer = new StaticTranslucentPanelContainer(
                            () => this.findOptimalPosition(),
                            () => this.opacity * MixedBase.OPACITY_CONTAINER_END,
                            () => this.opacity,
                            tooltipRectRadii,
                        )
                    ).addChildren(...tooltipComponents),
                );
            });

            this.on("onFocus", () => {
                this.isFocused = true;
                this.updateOpacityAnimation();
            });

            this.on("onBlur", () => {
                this.isFocused = false;
                this.updateOpacityAnimation();
            });
        }

        private updateOpacityAnimation(): void {
            if (this.opacityInterval) {
                clearInterval(this.opacityInterval);
                this.opacityInterval = null;
            }

            this.opacityInterval = setInterval(
                () => this.updateOpacity(),
                MixedBase.OPACITY_STEP_INTERVAL,
            );
        }

        private updateOpacity(): void {
            const targetOpacity = this.isFocused
                ? MixedBase.OPACITY_END
                : MixedBase.OPACITY_START;

            if (this.isFocused) {
                this.opacity = Math.min(MixedBase.OPACITY_END, this.opacity + MixedBase.OPACITY_STEP);
                if (this.opacity >= targetOpacity) {
                    this.clearOpacityInterval();
                }
            } else {
                this.opacity = Math.max(MixedBase.OPACITY_START, this.opacity - MixedBase.OPACITY_STEP);
                if (this.opacity <= targetOpacity) {
                    this.clearOpacityInterval();
                }
            }
        }

        private clearOpacityInterval(): void {
            if (this.opacityInterval) {
                clearInterval(this.opacityInterval);
                this.opacityInterval = null;
            }
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

            throw new Error("Tooltip: unpositionable");
        }

        override destroy(): void {
            this.tooltipContainer.destroy();

            super.destroy();
        }

        override get update(): ComponentExtensionTemplate["update"] {
            return (ctx: CanvasRenderingContext2D): void => {
                // Call parent extension update(), so its possible to nest the extension
                super.update?.(ctx);
            };
        }
    }

    return MixedBase;
}