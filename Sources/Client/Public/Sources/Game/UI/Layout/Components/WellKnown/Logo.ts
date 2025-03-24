import ExtensionBase from "../../Extensions/Extension";
import type { LayoutContext, LayoutOptions, LayoutResult } from "../../Layout";
import Layout from "../../Layout";
import type { MaybePointerLike } from "../Component";
import { Component, OBSTRUCTION_AFFECTABLE } from "../Component";
import { Canvg, presets } from "canvg";
import * as StackBlur from
    'stackblur-canvas/dist/stackblur-es.min.js';

export abstract class Logo extends ExtensionBase(Component) {
    public override[OBSTRUCTION_AFFECTABLE]: boolean = false;

    constructor(
        protected readonly layoutOptions: MaybePointerLike<LayoutOptions>,
    ) {
        super();
    }

    override layout(lc: LayoutContext): LayoutResult {
        return Layout.layout(
            Component.computePointerLike(this.layoutOptions),
            lc,
        );
    }

    override getCacheKey(lc: LayoutContext): string {
        const { CACHE_KEY_DELIMITER } = Component;

        return super.getCacheKey(lc) +
            CACHE_KEY_DELIMITER +
            Object.values(Component.computePointerLike(this.layoutOptions)).join(CACHE_KEY_DELIMITER);
    }

    override invalidateLayoutCache(): void {
        this.layoutCache.invalidate();
    }
}

export class CanvasLogo extends Logo {
    /**
     * @param drawer - Draw icon at traslated x, y
     */
    constructor(
        layoutOptions: MaybePointerLike<LayoutOptions>,

        protected drawer: (ctx: CanvasRenderingContext2D) => void,
    ) {
        super(layoutOptions);
    }

    override render(ctx: CanvasRenderingContext2D): void {
        super.render(ctx);

        ctx.save();

        ctx.translate(this.x, this.y);

        // Draw logo
        this.drawer(ctx);

        ctx.restore();
    }
}

export class SVGLogo extends Logo {
    private svgCanvas: OffscreenCanvas | null = null;

    constructor(
        layoutOptions: MaybePointerLike<LayoutOptions>,

        protected readonly svg: string,

        protected readonly sizeCoef: MaybePointerLike<number> = 0.8,
        protected readonly rotation: MaybePointerLike<number> = 0,
    ) {
        super(layoutOptions);

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

    override render(ctx: CanvasRenderingContext2D): void {
        super.render(ctx);

        ctx.save();

        if (this.svgCanvas) {
            const computedSizeCoef = Component.computePointerLike(this.sizeCoef);
            const computedRotation = Component.computePointerLike(this.rotation);

            const drawWidth = this.w * computedSizeCoef;
            const drawHeight = this.h * computedSizeCoef;

            const centerX = this.x + this.w / 2;
            const centerY = this.y + this.h / 2;

            ctx.translate(centerX, centerY);
            ctx.rotate(computedRotation);
            ctx.translate(-centerX, -centerY);

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