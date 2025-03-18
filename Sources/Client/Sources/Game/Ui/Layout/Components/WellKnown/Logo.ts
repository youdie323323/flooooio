import ExtensionBase from "../../Extensions/Extension";
import type { LayoutContext, LayoutOptions, LayoutResult } from "../../Layout";
import Layout from "../../Layout";
import type { MaybePointerLike } from "../Component";
import { Component } from "../Component";
import { Canvg, presets } from "canvg";
import * as StackBlur from
    'stackblur-canvas/dist/stackblur-es.min.js';

export class CanvasLogo extends ExtensionBase(Component) {
    /**
     * @param drawer - Draw icon at traslated x, y
     */
    constructor(
        protected layoutOptions: MaybePointerLike<LayoutOptions>,

        protected drawer: (ctx: CanvasRenderingContext2D) => void,
    ) {
        super();
    }

    override layout(lc: LayoutContext): LayoutResult {
        return Layout.layout(
            Component.computePointerLike(this.layoutOptions),
            lc,
        );
    }

    override getCacheKey(): string {
        return super.getCacheKey() +
            Object.values(Component.computePointerLike(this.layoutOptions)).join("");
    }

    override invalidateLayoutCache(): void {
        this.layoutCache.invalidate();
    }

    override render(ctx: CanvasRenderingContext2D): void {
        if (!this.isRenderable) return;

        super.render(ctx);

        this.update();

        ctx.save();

        ctx.translate(this.x, this.y);

        // Draw logo
        this.drawer(ctx);

        ctx.restore();
    }
}

export class SVGLogo extends ExtensionBase(Component) {
    private static readonly SVG_SIZE: number = 0.8;
    private svgCanvas: OffscreenCanvas | null = null;

    constructor(
        protected readonly layoutOptions: MaybePointerLike<LayoutOptions>,

        protected readonly svg: string,
    ) {
        super();

        (async () => {
            const canvas = new OffscreenCanvas(512, 512);
            const ctx = canvas.getContext("2d", {
                antialias: true,
                alpha: true,
            });

            if (ctx) {
                await Canvg.fromString(ctx, this.svg, presets.offscreen()).render();
                // Use stackblur to relief jaggy
                StackBlur.canvasRGBA(canvas, 0, 0, canvas.width, canvas.height, 8);

                this.svgCanvas = canvas;
            }
        })();
    }

    override layout(lc: LayoutContext): LayoutResult {
        return Layout.layout(Component.computePointerLike(this.layoutOptions), lc);
    }

    override getCacheKey(): string {
        return super.getCacheKey() +
            Object.values(Component.computePointerLike(this.layoutOptions)).join("");
    }

    override invalidateLayoutCache(): void {
        this.layoutCache.invalidate();
    }

    override render(ctx: CanvasRenderingContext2D): void {
        if (!this.isRenderable) return;

        super.render(ctx);

        this.update();

        ctx.save();

        // Draw logo
        if (this.svgCanvas) {
            const drawWidth = this.w * SVGLogo.SVG_SIZE;
            const drawHeight = this.h * SVGLogo.SVG_SIZE;

            ctx.drawImage(
                this.svgCanvas,
                this.x + (this.w - drawWidth) / 2,
                this.y + (this.h - drawHeight) / 2,
                drawWidth,
                drawHeight,
            );
        }

        ctx.restore();
    }
}