import Layout, { LayoutOptions, LayoutResult } from "../layout/Layout";
import { Component, MaybeDynamicLayoutablePointer } from "./Component";
import ExtensionPlaceholder from "./extensions/Extension";

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

    public render(ctx: CanvasRenderingContext2D): void {
        super.render(ctx);

        this.update();

        ctx.translate(this.x, this.y);

    }

    public destroy?(): void {
        this.layout = null;

        this.xp = null;
    }
}
