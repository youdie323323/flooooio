import { cameraController, mobs, players } from "../main";
import { waveSelfId } from "../Networking";
import UserInterface from "./UserInterface";
import UserInterfaceGame from "./mode/UserInterfaceModeGame";
import UserInterfaceTitle from "./mode/UserInterfaceModeTitle";
import UserInterfaceTransition from "./UserInterfaceTransition";

export type UserInterfaceMode = 'game' | 'title';

export type UserInterfaces = UserInterfaceGame | UserInterfaceTitle;

export default class UserInterfaceContext {
    private readonly transition: UserInterfaceTransition;

    public cCtx: UserInterfaces | null;
    public pCtx: UserInterfaces | null;

    public isTransitioning: boolean;

    constructor(private readonly canvas: HTMLCanvasElement) {
        this.cCtx = new UserInterfaceTitle(canvas);
        this.pCtx = null;
        this.transition = new UserInterfaceTransition(canvas);
        this.isTransitioning = false;
    }

    public cleanup(): void {
        // Cleanup mode-specific values & components
        this.pCtx?.dispose();
        this.pCtx?.cleanupRenders();

        this.isTransitioning = false;
    }

    public switchUI(mode: UserInterfaceMode): void {
        if (this.isTransitioning) {
            // Dont do anything because its double click
            return;
        }

        this.pCtx = this.cCtx;

        this.pCtx.onUiSwitched();

        // Cleanup listeners so cant touch before ui buttons
        this.pCtx?.removeEventListeners();

        this.cCtx = this.createUI(mode);

        this.isTransitioning = true;

        this.transition.start(mode)
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
            this.cCtx?.animationFrame();

            return;
        }

        this.transition.draw(this.cCtx, this.pCtx);

        const type: UserInterfaceMode = this.cCtx instanceof UserInterfaceTitle ? 'title' : 'game';

        if (this.transition.update(type)) {
            this.cleanup();
        }
    }
}