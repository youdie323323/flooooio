import type { AnimationConfigOf, ComponentCloser, ComponentOpener, Components, FakeSetVisibleObserverType, FakeSetVisibleToggleType, MaybePointerLike } from "../Components/Component";
import { AnimationType, Component, OBSTRUCTION_AFFECTABLE } from "../Components/Component";
import type { PartialSizeLayoutOptions } from "../Components/WellKnown/Container";
import { StaticTranslucentPanelContainer } from "../Components/WellKnown/Container";
import type { ExtensionConstructor } from "./Extension";

export type TooltipAnchorPosition = "top" | "bottom" | "left" | "right";

export const TOOLTIP_FALLBACK_POSITIONS = ["top", "bottom", "left", "right"] as const;

export default function Tooltip<T extends ExtensionConstructor>(
    Base: T,

    contentComponents: Array<Components>,
    positionOffset: number,
    anchorPositionPriority: ReadonlyArray<TooltipAnchorPosition> = TOOLTIP_FALLBACK_POSITIONS,
    // TODO: hide when tooltip container overlaps with other component instead of this
    shouldDisplayTooltip: MaybePointerLike<boolean> = true,
    cornerRadius: MaybePointerLike<number> = 3,
) {
    // Ensure all fallback positions are included
    const completePositionPriority = anchorPositionPriority.concat(
        TOOLTIP_FALLBACK_POSITIONS.filter(position => anchorPositionPriority.indexOf(position) === -1),
    );

    abstract class MixedBase extends Base {
        private static readonly TOOLTIP_FADE_ANIMATION_CONFIG = {
            defaultDurationOverride: 100,
        } as const satisfies AnimationConfigOf<AnimationType.FADE>;

        private tooltipContainer: StaticTranslucentPanelContainer;

        private tooltipIsHovered: boolean = false;

        constructor(...args: ReadonlyArray<any>) {
            super(...args);

            this.once("onInitialized", () => {
                this.tooltipContainer =
                    new StaticTranslucentPanelContainer(
                        () => this.calculateOptimalPosition(),
                        cornerRadius,
                    ).addChildren(...contentComponents);

                // Prevent tooltip from blocking other components
                this.tooltipContainer[OBSTRUCTION_AFFECTABLE] = false;

                // Initialize as hidden
                this.tooltipContainer.setVisible(false, null, false);

                this.context.addComponent(this.tooltipContainer);
            });

            this.on("onFocus", () => {
                const computedShouldDisplayTooltip = Component.computePointerLike(shouldDisplayTooltip);

                this.tooltipIsHovered = true;

                if (computedShouldDisplayTooltip) this.updateTooltipVisibility(true);
            });

            this.on("onBlur", () => {
                const computedShouldDisplayTooltip = Component.computePointerLike(shouldDisplayTooltip);

                this.tooltipIsHovered = false;

                if (computedShouldDisplayTooltip) this.updateTooltipVisibility(false);
            });
        }

        private updateTooltipVisibility(isVisible: boolean): void {
            this.tooltipContainer.setVisible(
                <FakeSetVisibleToggleType>isVisible,
                <FakeSetVisibleObserverType><unknown>(this),
                true,
                AnimationType.FADE,
                MixedBase.TOOLTIP_FADE_ANIMATION_CONFIG,
            );
        }

        private calculateOptimalPosition(): PartialSizeLayoutOptions {
            const {
                x: anchorX,
                y: anchorY,
                w: anchorWidth,
                h: anchorHeight,
            } = this;

            const {
                w: tooltipWidth,
                h: tooltipHeight,
            } = this.tooltipContainer;

            for (const position of completePositionPriority) {
                let proposedX = 0;
                let proposedY = 0;

                switch (position) {
                    case "top":
                        proposedX = anchorX + (anchorWidth / 2) - (tooltipWidth / 2);
                        proposedY = anchorY - tooltipHeight - positionOffset;
                        break;

                    case "bottom":
                        proposedX = anchorX + (anchorWidth / 2) - (tooltipWidth / 2);
                        proposedY = anchorY + anchorHeight + positionOffset;
                        break;

                    case "left":
                        proposedX = anchorX - tooltipWidth - positionOffset;
                        proposedY = anchorY + (anchorHeight / 2) - (tooltipHeight / 2);
                        break;

                    case "right":
                        proposedX = anchorX + anchorWidth + positionOffset;
                        proposedY = anchorY + (anchorHeight / 2) - (tooltipHeight / 2);
                        break;
                }

                // Validate position within viewport bounds
                if (
                    proposedX >= 0 &&
                    proposedY >= 0 &&
                    proposedX + tooltipWidth <= this.context.canvas.width &&
                    proposedY + tooltipHeight <= this.context.canvas.height
                ) {
                    return { x: proposedX, y: proposedY };
                }
            }

            return {};
        }

        override render(ctx: CanvasRenderingContext2D): void {
            super.render(ctx);

            const computedShouldDisplayTooltip = Component.computePointerLike(shouldDisplayTooltip);

            if (computedShouldDisplayTooltip && this.tooltipIsHovered && !this.tooltipContainer.desiredVisible) this.updateTooltipVisibility(true);

            if (!computedShouldDisplayTooltip && this.tooltipContainer.desiredVisible) this.updateTooltipVisibility(false);
        }

        override destroy(): void {
            // tooltipContainer is not marked as child and destroyed as top-level component
            // this.tooltipContainer.destroy();

            super.destroy();
        }
    }

    return MixedBase;
}