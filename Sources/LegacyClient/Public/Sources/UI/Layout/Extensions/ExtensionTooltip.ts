import type { AnimationConfigOf, ComponentCloser, ComponentOpener, Components, DummySetVisibleObserverType, DummySetVisibleToggleType, MaybePointerLike } from "../Components/Component";
import { AnimationType, Component, OBSTRUCTION_AFFECTABLE } from "../Components/Component";
import type { PartialSizeLayoutOptions } from "../Components/WellKnown/Container";
import { StaticTranslucentPanelContainer } from "../Components/WellKnown/Container";
import type { ExtensionConstructor } from "./Extension";

export type TooltipAnchorPosition = "top" | "bottom" | "left" | "right";

export default function Tooltip<T extends ExtensionConstructor>(
    Base: T,

    contentComponents: Array<Components>,
    positionOffset: number,
    anchorPosition: TooltipAnchorPosition,
    hideIfOverlap: MaybePointerLike<boolean>,
    cornerRadius: MaybePointerLike<number> = 3,
) {
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

                // Prevent tooltip blocking other components
                this.tooltipContainer[OBSTRUCTION_AFFECTABLE] = false;

                // Initialize as hidden
                this.tooltipContainer.setVisible(false, null, false);

                this.context.addComponent(this.tooltipContainer);
            });

            this.on("onFocus", () => {
                const { shouldShowTooltip } = this;

                this.tooltipIsHovered = true;

                if (shouldShowTooltip) this.updateTooltipVisibility(true);
            });

            this.on("onBlur", () => {
                const { shouldShowTooltip } = this;

                this.tooltipIsHovered = false;

                if (shouldShowTooltip) this.updateTooltipVisibility(false);
            });
        }

        private updateTooltipVisibility(isVisible: boolean): void {
            this.tooltipContainer.setVisible(
                <DummySetVisibleToggleType>isVisible,
                <DummySetVisibleObserverType><unknown>(this),
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

            let proposedX = 0;
            let proposedY = 0;

            switch (anchorPosition) {
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

            return { x: proposedX, y: proposedY };
        }

        private get shouldShowTooltip(): boolean {
            const computedHideIfOverlap = Component.computePointerLike(hideIfOverlap);
            if (!computedHideIfOverlap) return true;

            if (!this.context) return true;

            if (!this.tooltipContainer) return true;

            return this.context.isComponentNotOverlappingWithOtherComponents(<Components><unknown>(this.tooltipContainer));
        }

        override render(ctx: CanvasRenderingContext2D): void {
            super.render(ctx);

            const { shouldShowTooltip } = this;

            if (shouldShowTooltip && this.tooltipIsHovered && !this.tooltipContainer.desiredVisible) this.updateTooltipVisibility(true);

            if (!shouldShowTooltip && this.tooltipContainer.desiredVisible) this.updateTooltipVisibility(false);
        }

        override destroy(): void {
            super.destroy();

            // tooltipContainer is not marked as child and destroyed as top-level component
            // this.tooltipContainer.destroy();
            // this.tooltipContainer = null;
        }
    }

    return MixedBase;
}