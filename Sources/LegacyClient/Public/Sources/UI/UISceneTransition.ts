import type AbstractUI from "./UI";
import { uiScaleFactor } from "./UI";
import type { UIType } from "./UIContext";
import UITitle from "./Title/UITitle";

const TAU = Math.PI * 2;

export interface TransitionConfig {
    initialRadius: (canvas: HTMLCanvasElement) => number;
    radiusChange: (current: number) => number;
    isComplete: (canvas: HTMLCanvasElement, radius: number) => boolean;
}

export default class UISceneTransition {
    private readonly ctx: CanvasRenderingContext2D;

    private static readonly STROKE_WIDTH = 5;
    private static readonly STROKE_COLOR = "#000000";

    private static readonly TRANSITION_CONFIGS = {
        title: {
            initialRadius: (canvas) => Math.max(((canvas.height / uiScaleFactor) / 2) + 100, ((canvas.width / uiScaleFactor) / 2) + 100),
            radiusChange: (current) => current - (0.3 + current / 40),
            isComplete: (_, radius) => radius < 0,
        },
        game: {
            initialRadius: () => 0,
            radiusChange: (current) => current + (0.2 + current / 35),
            isComplete: (canvas, radius) => radius > Math.max(((canvas.height / uiScaleFactor) / 2) + 100, ((canvas.width / uiScaleFactor) / 2) + 100),
        },
    } as const satisfies Record<UIType, TransitionConfig>;

    private radius: number;

    constructor(private readonly canvas: HTMLCanvasElement) {
        this.ctx = canvas.getContext("2d");
        this.radius = -1;
    }

    public start(type: UIType): void {
        const config = UISceneTransition.TRANSITION_CONFIGS[type];
        this.radius = config.initialRadius(this.canvas);
    }

    public update(type: UIType): boolean {
        const config = UISceneTransition.TRANSITION_CONFIGS[type];
        this.radius = config.radiusChange(this.radius);

        return config.isComplete(this.canvas, this.radius);
    }

    public draw(currentUI: AbstractUI, previousUI: AbstractUI): void {
        // Determine in or out
        const [innerUI, outerUI] = currentUI instanceof UITitle
            ? [currentUI, previousUI]
            : [previousUI, currentUI];

        innerUI?.render();

        this.ctx.save();

        this.clipCircle();
        outerUI?.render();
        
        this.ctx.restore();

        this.drawTransitionBorder();
    }

    private clipCircle(): void {
        const widthRelative = this.canvas.width / uiScaleFactor;
        const heightRelative = this.canvas.height / uiScaleFactor;

        this.ctx.beginPath();

        this.ctx.arc(
            widthRelative / 2,
            heightRelative / 2,
            this.radius,
            0,
            TAU,
        );

        this.ctx.clip("evenodd");
    }

    private drawTransitionBorder(): void {
        const widthRelative = this.canvas.width / uiScaleFactor;
        const heightRelative = this.canvas.height / uiScaleFactor;

        this.ctx.save();

        this.ctx.beginPath();
        this.ctx.arc(
            widthRelative / 2,
            heightRelative / 2,
            this.radius,
            0,
            TAU,
        );
        this.ctx.lineWidth = UISceneTransition.STROKE_WIDTH;
        this.ctx.strokeStyle = UISceneTransition.STROKE_COLOR;
        this.ctx.stroke();

        this.ctx.restore();
    }
}