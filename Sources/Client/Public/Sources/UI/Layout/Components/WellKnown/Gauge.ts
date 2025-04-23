import type Entity from "../../../../Entity/Entity";
import type { ColorCode } from "../../../../Utils/Color";
import type { LayoutContext, LayoutOptions, LayoutResult } from "../../Layout";
import Layout from "../../Layout";
import type { MaybePointerLike } from "../Component";
import { Component, OBSTRUCTION_AFFECTABLE } from "../Component";
import { calculateStrokeWidth } from "./StaticText";

export type GaugeSource = Readonly<{
    value: number;
    maxValue: number;

    thickness: number;

    color: ColorCode;
    lowBehavior?: "lineWidth" | "fade";
}>;

export type GaugeSources<G> = MaybePointerLike<ReadonlyArray<G>>;

export default class Gauge extends Component {
    public override[OBSTRUCTION_AFFECTABLE]: boolean = false;

    private static readonly ANIMATION_SPEED = 0.05 as const;
    private static readonly EPSILON = 1e-10 as const;

    private currentValues: Array<number>;

    constructor(
        protected readonly layoutOptions: MaybePointerLike<LayoutOptions>,

        protected readonly gaugeSources: GaugeSources<GaugeSource>,
        protected readonly gaugeWidthPadding: MaybePointerLike<number> = 0,
        protected readonly gaugeText: MaybePointerLike<string> | null = null,
    ) {
        super();

        const computedGaugeSources = Component.computePointerLike(this.gaugeSources);

        this.currentValues = new Array(computedGaugeSources.length).fill(0);
    }

    override layout(lc: LayoutContext): LayoutResult {
        return Layout.layout(Component.computePointerLike(this.layoutOptions), lc);
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

    private calculateOpacity(normalizedValue: number, threshold: number = 0.05): number {
        if (normalizedValue <= threshold) {
            return normalizedValue / threshold;
        }

        return 1;
    }

    override render(ctx: CanvasRenderingContext2D): void {
        super.render(ctx);

        const computedGaugeSources = Component.computePointerLike(this.gaugeSources);
        const computedGaugeWidthPadding = Component.computePointerLike(this.gaugeWidthPadding);
        const computedGaugeText = Component.computePointerLike(this.gaugeText);

        const lineWidth = this.h;

        ctx.translate(this.x, this.y);

        ctx.lineCap = "round";

        ctx.globalAlpha = 0.9;

        const centerHeight = this.h - (lineWidth / 2);

        { // Draw background
            ctx.save();

            ctx.lineWidth = lineWidth;
            ctx.strokeStyle = "black";

            ctx.beginPath();
            ctx.lineTo(0, centerHeight);
            ctx.lineTo(this.w, centerHeight);
            ctx.stroke();

            ctx.restore();
        }

        { // Draw gauge sources
            ctx.save();

            computedGaugeSources.forEach(({ maxValue, thickness: heightCoeff, color, lowBehavior }, index) => {
                const currentValue = this.currentValues[index];
                if (currentValue > 0) {
                    const normalizedValue = currentValue / maxValue;

                    ctx.lineWidth = lineWidth * heightCoeff;

                    if (lowBehavior) {
                        if (lowBehavior === "fade") {
                            ctx.globalAlpha = this.calculateOpacity(normalizedValue);
                        } else {
                            ctx.lineWidth = Math.min(ctx.lineWidth, normalizedValue * (lineWidth * 50));
                        }
                    }

                    ctx.strokeStyle = color;

                    ctx.beginPath();
                    ctx.lineTo(computedGaugeWidthPadding, centerHeight);
                    ctx.lineTo(computedGaugeWidthPadding + ((this.w - computedGaugeWidthPadding) * normalizedValue), centerHeight);
                    ctx.stroke();
                }
            });

            ctx.restore();
        }

        // Draw text
        if (computedGaugeText) {
            ctx.save();

            const fontSize = this.h * 0.65;

            ctx.lineJoin = "round";
            ctx.lineCap = "round";
            ctx.textBaseline = "middle";
            ctx.textAlign = "center";

            ctx.fillStyle = "white";
            ctx.strokeStyle = "#000000";
            ctx.font = `${fontSize}px Ubuntu`;
            ctx.lineWidth = calculateStrokeWidth(fontSize);

            const x = (this.w + computedGaugeWidthPadding) / 2,
                y = this.h / 2;

            ctx.strokeText(computedGaugeText, x, y);
            ctx.fillText(computedGaugeText, x, y);

            ctx.restore();
        }

        { // Interpolate the values
            this.currentValues = this.currentValues.map((current, index) => {
                const { value: target } = computedGaugeSources[index];
                if (current !== target) {
                    const next = current + (target - current) * Gauge.ANIMATION_SPEED;

                    return Math.abs(next) < Gauge.EPSILON
                        ? 0
                        : next;
                }

                return current;
            });
        }
    }
}

export function entityHealthGaugeSources(entity: Entity): GaugeSources<GaugeSource> {
    return () => [
        { // Red health
            value: entity.redHealth,
            maxValue: 1,

            thickness: 0.65,

            color: "#f22",
            lowBehavior: "fade",
        },

        { // Hp
            value: entity.health,
            maxValue: 1,

            thickness: 0.75,

            color: "#6dd24a",
            lowBehavior: "fade",
        },
    ];
}