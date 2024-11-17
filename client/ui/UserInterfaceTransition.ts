import UserInterface from "./UserInterface";
import { UserInterfaceMode } from "./UserInterfaceManager";
import UserInterfaceMenu from "./mode/UserInterfaceModeMenu";

export interface TransitionConfig {
    initialRadius: (canvas: HTMLCanvasElement) => number;
    radiusChange: (current: number) => number;
    isComplete: (canvas: HTMLCanvasElement, radius: number) => boolean;
}

export default class UserInterfaceTransition {
    private static readonly STROKE_WIDTH = 10;
    private static readonly STROKE_COLOR = '#000000';

    private readonly transitionConfigs: Record<UserInterfaceMode, TransitionConfig> = {
        menu: {
            initialRadius: (canvas) => Math.max(canvas.height, canvas.width),
            radiusChange: (current) => current - (0.5 + current / 30),
            isComplete: (_, radius) => radius < 0
        },
        game: {
            initialRadius: () => 4,
            radiusChange: (current) => current + (0.5 + current / 35),
            isComplete: (canvas, radius) => radius > Math.max(canvas.height, canvas.width)
        }
    };

    private radius: number;
    private readonly canvas: HTMLCanvasElement;
    private readonly ctx: CanvasRenderingContext2D;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
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
        const [innerUI, outerUI] = currentUI instanceof UserInterfaceMenu
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
        this.ctx.beginPath();
        this.ctx.arc(
            this.canvas.width / 2,
            this.canvas.height / 2,
            this.radius,
            0,
            Math.PI * 2
        );
        this.ctx.clip();
    }

    private drawTransitionBorder(): void {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(
            this.canvas.width / 2,
            this.canvas.height / 2,
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