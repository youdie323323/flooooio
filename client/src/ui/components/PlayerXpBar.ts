import { levelPerXp, xpPerLevel } from "../../../../shared/formula";
import Layout, { LayoutOptions, LayoutResult } from "../layout/Layout";
import { Component, MaybeDynamicLayoutablePointer } from "./Component";
import ExtensionPlaceholder from "./extensions/Extension";
import { calculateStrokeWidth as calculateLineWidth } from "./Text";

export default class PlayerXpBar extends ExtensionPlaceholder(Component) {
    constructor(
        private layout: MaybeDynamicLayoutablePointer<LayoutOptions>,

        private xp: MaybeDynamicLayoutablePointer<number>,
    ) {
        super();
    }

    public calculateLayout(
        width: number,
        height: number,
        originX: number,
        originY: number
    ): LayoutResult {
        return Layout.layout(
            this.computeDynamicLayoutable(this.layout),
            width,
            height,
            originX,
            originY,
        );
    }

    public override getCacheKey(): string {
        return super.getCacheKey() + `${Object.values(this.computeDynamicLayoutable(this.layout)).join("")}`
    }

    public invalidateLayoutCache(): void {
        this.layoutCache.invalidate();
    }

    public render(ctx: CanvasRenderingContext2D): void {
        super.render(ctx);

        this.update();

        ctx.translate(this.x, this.y);

        const computedXp = this.computeDynamicLayoutable(this.xp);

        const currentLevel = levelPerXp(computedXp);
        const currentLevelXp = xpPerLevel(currentLevel);
        const nextLevelXp = xpPerLevel(currentLevel + 1);

        const progress = (computedXp - currentLevelXp) / (nextLevelXp - currentLevelXp);

        ctx.lineCap = "round";

        {
            ctx.save();

            ctx.globalAlpha = 0.9;

            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(this.h, 0);
            ctx.lineWidth = this.w;
            ctx.strokeStyle = "black";
            ctx.stroke();

            ctx.restore();
        }

        function setGlobalAlpha() {
            ctx.globalAlpha = Math.min(1, progress * 20);
        }

        if (nextLevelXp - computedXp > 0) {
            ctx.save();

            setGlobalAlpha();

            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(this.h * progress, 0);
            ctx.lineWidth = this.w * 0.66;
            ctx.strokeStyle = "#d9ef74";
            ctx.stroke();

            ctx.restore();
        }

        {
            ctx.save();

            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            ctx.strokeStyle = '#000000';
            ctx.fillStyle = "white";

            const fontPx = this.w - 4;

            ctx.font = fontPx + "px Ubuntu";

            ctx.lineWidth = calculateLineWidth(fontPx);

            ctx.translate(this.h / 2, 0);

            ctx.strokeText("Lvl " + currentLevel, 0, 0);
            ctx.fillText("Lvl " + currentLevel, 0, 0);

            ctx.restore();
        }
    }
}
