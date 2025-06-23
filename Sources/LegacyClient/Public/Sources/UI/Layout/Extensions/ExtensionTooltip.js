"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Tooltip;
const Component_1 = require("../Components/Component");
const Container_1 = require("../Components/WellKnown/Container");
function Tooltip(Base, contentComponents, positionOffset, anchorPosition, hideIfOverlap, cornerRadius = 3) {
    class MixedBase extends Base {
        static { this.TOOLTIP_FADE_ANIMATION_CONFIG = {
            defaultDurationOverride: 100,
        }; }
        constructor(...args) {
            super(...args);
            this.tooltipIsHovered = false;
            this.once("onInitialized", () => {
                this.tooltipContainer =
                    new Container_1.StaticTranslucentPanelContainer(() => this.calculateOptimalPosition(), cornerRadius).addChildren(...contentComponents);
                // Prevent tooltip blocking other components
                this.tooltipContainer[Component_1.OBSTRUCTION_AFFECTABLE] = false;
                // Initialize as hidden
                this.tooltipContainer.setVisible(false, null, false);
                this.context.addComponent(this.tooltipContainer);
            });
            this.on("onFocus", () => {
                const { shouldShowTooltip } = this;
                this.tooltipIsHovered = true;
                if (shouldShowTooltip)
                    this.updateTooltipVisibility(true);
            });
            this.on("onBlur", () => {
                const { shouldShowTooltip } = this;
                this.tooltipIsHovered = false;
                if (shouldShowTooltip)
                    this.updateTooltipVisibility(false);
            });
        }
        updateTooltipVisibility(isVisible) {
            this.tooltipContainer.setVisible(isVisible, (this), true, 2 /* AnimationType.FADE */, MixedBase.TOOLTIP_FADE_ANIMATION_CONFIG);
        }
        calculateOptimalPosition() {
            const { x: anchorX, y: anchorY, w: anchorWidth, h: anchorHeight, } = this;
            const { w: tooltipWidth, h: tooltipHeight, } = this.tooltipContainer;
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
        get shouldShowTooltip() {
            const computedHideIfOverlap = Component_1.Component.computePointerLike(hideIfOverlap);
            if (!computedHideIfOverlap)
                return true;
            if (!this.context)
                return true;
            if (!this.tooltipContainer)
                return true;
            return this.context.isComponentNotOverlappingWithOtherComponents((this.tooltipContainer));
        }
        render(ctx) {
            super.render(ctx);
            const { shouldShowTooltip } = this;
            if (shouldShowTooltip && this.tooltipIsHovered && !this.tooltipContainer.desiredVisible)
                this.updateTooltipVisibility(true);
            if (!shouldShowTooltip && this.tooltipContainer.desiredVisible)
                this.updateTooltipVisibility(false);
        }
        destroy() {
            super.destroy();
            // tooltipContainer is not marked as child and destroyed as top-level component
            // this.tooltipContainer.destroy();
            // this.tooltipContainer = null;
        }
    }
    return MixedBase;
}
