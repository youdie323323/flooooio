import { scaleFactor } from "../../main";
import { calculateStrokeWidth } from "../../utils/common";
import { LayoutOptions } from "../layout/Layout";
import { Component, Interactive } from "./Component";
import ExtensionEmpty from "./extensions/Extension";
import ExtensionCollidable from "./extensions/ExtensionCollidable";

/**
 * Text component that have collision.
 */
export default class ComponentDynamicText extends ExtensionCollidable(ExtensionEmpty(Component)) {
    constructor(
        layout: LayoutOptions,
        private readonly text: string,
        private readonly fontSize: number = 16,
    ) {
        super(layout);
    }

    public render(ctx: CanvasRenderingContext2D): void {
        super.render(ctx);

        this.update();

        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';

        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = '#000000';
        ctx.font = `${this.fontSize}px Ubuntu`;
        ctx.lineWidth = calculateStrokeWidth(this.fontSize);

        ctx.translate(this.x + this.w / 2, this.y + this.h / 2)

        ctx.strokeText(this.text, 0, 0);
        ctx.fillText(this.text, 0, 0);
    }
}