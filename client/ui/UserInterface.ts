import { ComponentsButton } from "./components/ComponentsButton";
import { UserInterfaceManager } from "./UserInterfaceManager";

export default abstract class UserInterface {
    protected uiManager: UserInterfaceManager;
    protected canvas: HTMLCanvasElement;
    private mouseX: number = 0;
    private mouseY: number = 0;

    public buttons: ComponentsButton[] = [];
    public activeButton: ComponentsButton | null = null;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.uiManager = UserInterfaceManager.getInstance(canvas);
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        new ResizeObserver((entries) => {
            const width = Math.round(this.canvas.clientWidth * devicePixelRatio);
            const height = Math.round(this.canvas.clientHeight * devicePixelRatio);
            this.canvas.width = width;
            this.canvas.height = height;

            this.buttons.forEach(button => {
                button.updateAbsolutePosition(width, height);
            });
        }).observe(this.canvas);
    }

    private updateMousePosition(event: MouseEvent): void {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = event.clientX - rect.left;
        this.mouseY = event.clientY - rect.top;
    }

    private handleMouseDown(event: MouseEvent): void {
        this.updateMousePosition(event);
        for (const button of this.buttons) {
            if (button.isPointInside(this.mouseX, this.mouseY)) {
                this.activeButton = button;
                button.setPressed(true);
                break;
            }
        }
    }

    private handleMouseUp(event: MouseEvent): void {
        this.updateMousePosition(event);
        if (this.activeButton?.isPointInside(this.mouseX, this.mouseY)) {
            this.activeButton.executeCallback();
        }
        if (this.activeButton) {
            this.activeButton.setPressed(false);
            this.activeButton = null;
        }
    }

    private handleMouseMove(event: MouseEvent): void {
        this.updateMousePosition(event);
        for (const button of this.buttons) {
            const isHovering = button.isPointInside(this.mouseX, this.mouseY);
            button.setHovered(isHovering);

            if (this.activeButton === button && !isHovering) {
                button.setPressed(false);
                this.activeButton = null;
            }
        }
    }

    protected addButton(button: ComponentsButton): void {
        this.buttons.push(button);
    }

    protected render(): void {
        const ctx = this.canvas.getContext("2d");
        if (!ctx) return;

        for (const button of this.buttons) {
            button.render(ctx);
        }
    }

    public abstract onInit(): void;
    public abstract onExit(): void;
    protected abstract initializeComponents(): void;
    public abstract animationFrame(callbackFn: () => void): void;
}