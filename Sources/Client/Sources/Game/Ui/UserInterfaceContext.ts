import UserInterfaceGame from "./Mode/UserInterfaceModeGame";
import UserInterfaceTitle from "./Mode/UserInterfaceModeTitle";
import UserInterfaceTransition from "./UserInterfaceTransition";

export type UserInterfaceMode = 'game' | 'title';

export type UserInterfaces = UserInterfaceGame | UserInterfaceTitle;

export default class UserInterfaceContext {
    private readonly transition: UserInterfaceTransition;
    public isTransitioning: boolean;

    public currentCtx: UserInterfaces | null;
    public previousCtx: UserInterfaces | null;

    constructor(private readonly canvas: HTMLCanvasElement) {
        this.currentCtx = new UserInterfaceTitle(canvas);
        this.previousCtx = null;

        this.transition = new UserInterfaceTransition(canvas);
        this.isTransitioning = false;
    }

    public cleanup(): void {
        // Cleanup mode-specific values & components
        this.previousCtx?.dispose();
        this.previousCtx?.disposeRenderComponents();

        // Set cursor to default
        this.canvas.style.cursor = "default";

        this.isTransitioning = false;
    }

    public switchUI(mode: UserInterfaceMode): void {
        if (this.isTransitioning) {
            // Dont do anything because its double click
            return;
        }

        this.previousCtx = this.currentCtx;

        this.previousCtx.onContextChanged();

        // Cleanup listeners so cant touch before ui buttons
        this.previousCtx?.removeEventListeners();

        // Set cursor to default
        this.canvas.style.cursor = "default";

        this.currentCtx = this.createUI(mode);

        this.isTransitioning = true;

        this.transition.start(mode);
    }

    private createUI(mode: UserInterfaceMode): UserInterfaces {
        switch (mode) {
            case 'title': {
                return new UserInterfaceTitle(this.canvas);
            }

            case 'game': {
                return new UserInterfaceGame(this.canvas);
            }
        }
    }

    public update(): void {
        if (!this.isTransitioning) {
            this.currentCtx?.animationFrame();

            return;
        }

        this.transition.draw(this.currentCtx, this.previousCtx);

        const type: UserInterfaceMode = this.currentCtx instanceof UserInterfaceTitle ? 'title' : 'game';

        if (this.transition.update(type)) {
            this.cleanup();
        }
    }
}