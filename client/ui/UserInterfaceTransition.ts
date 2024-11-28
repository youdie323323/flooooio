import UserInterface, { uiScaleFactor } from "./UserInterface";
import { UserInterfaceMode } from "./UserInterfaceContext";
import UserInterfaceTitle from "./mode/UserInterfaceModeTitle";

export interface TransitionConfig {
    initialRadius: (canvas: HTMLCanvasElement) => number;
    radiusChange: (current: number) => number;
    isComplete: (canvas: HTMLCanvasElement, radius: number) => boolean;
}

export default class UserInterfaceTransition {
    private readonly ctx: CanvasRenderingContext2D;

    private static readonly STROKE_WIDTH = 5;
    private static readonly STROKE_COLOR = '#000000';

    private readonly transitionConfigs: Record<UserInterfaceMode, TransitionConfig> = {
        title: {
            initialRadius: (canvas) => Math.max(((canvas.height / uiScaleFactor) / 2) + 100, ((canvas.width / uiScaleFactor) / 2) + 100),
            radiusChange: (current) => current - (0.3 + current / 40),
            isComplete: (_, radius) => radius < 0,
        },
        game: {
            initialRadius: () => 0,
            radiusChange: (current) => current + (0.4 + current / 30),
            isComplete: (canvas, radius) => radius > Math.max(((canvas.height / uiScaleFactor) / 2) + 100, ((canvas.width / uiScaleFactor) / 2) + 100),
        }
    };

    private radius: number;

    constructor(private readonly canvas: HTMLCanvasElement) {
        this.ctx = canvas.getContext('2d');
        this.radius = -1;
    }

    public start(type: UserInterfaceMode): void {
        const config = this.transitionConfigs[type];
        this.radius = config.initialRadius(this.canvas);
    }

    public update(type: UserInterfaceMode): boolean {
        const config = this.transitionConfigs[type];
        this.radius = config.radiusChange(this.radius);
        return config.isComplete(this.canvas, this.radius);
    }

    public draw(currentUI: UserInterface, previousUI: UserInterface): void {
        // Determine in or out
        const [innerUI, outerUI] = currentUI instanceof UserInterfaceTitle
            ? [currentUI, previousUI]
            : [previousUI, currentUI];

        innerUI?.animationFrame();

        this.ctx.save();
        this.clipCircle();
        outerUI?.animationFrame();
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
            Math.PI * 2
        );

        this.ctx.clip('evenodd');
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
            Math.PI * 2
        );
        this.ctx.lineWidth = UserInterfaceTransition.STROKE_WIDTH;
        this.ctx.strokeStyle = UserInterfaceTransition.STROKE_COLOR;
        this.ctx.stroke();

        this.ctx.restore();
    }
}