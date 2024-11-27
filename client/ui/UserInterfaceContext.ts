import { cameraController, mobs, players } from "../main";
import { selfId } from "../Networking";
import UserInterface from "./UserInterface";
import UserInterfaceGame from "./mode/UserInterfaceModeGame";
import UserInterfaceMenu from "./mode/UserInterfaceModeMenu";
import UserInterfaceTransition from "./UserInterfaceTransition";

export type UserInterfaceMode = 'menu' | 'game';

export type UserInterfaces = UserInterfaceGame | UserInterfaceMenu;

export default class UserInterfaceContext {
    private readonly transition: UserInterfaceTransition;

    public currentUI: UserInterfaces | null;
    public previousUI: UserInterfaces | null;

    public isTransitioning: boolean;

    constructor(private readonly canvas: HTMLCanvasElement) {
        this.currentUI = new UserInterfaceMenu(canvas);
        this.previousUI = null;
        this.transition = new UserInterfaceTransition(canvas);
        this.isTransitioning = false;
    }

    public cleanup(): void {
        // Cleanup special values & components
        this.previousUI?.cleanup();
        this.previousUI?.cleanupRenders();

        this.isTransitioning = false;
    }

    public switchUI(mode: UserInterfaceMode): void {
        if (this.isTransitioning) {
            // Dont do anything because its double click
            return;
        }

        this.previousUI = this.currentUI;
        this.currentUI = this.createUI(mode);

        // Wait for createUI to finish them
        requestAnimationFrame(() => {
            this.isTransitioning = true;

            this.transition.start(mode)

            // Cleanup listeners so cant touch before ui buttons
            this.previousUI?.removeEventListeners();
        });
    }

    private createUI(mode: UserInterfaceMode): UserInterfaces {
        switch (mode) {
            case 'menu': {
                // Fake dead animation
                const player = players.get(selfId);
                if (player && !player.isDead) {
                    player.isDead = true;
                    player.deadT = 0;
                    player.health = 0;
                }

                return new UserInterfaceMenu(this.canvas);
            }

            case 'game': {
                cameraController.zoom = 1;

                return new UserInterfaceGame(this.canvas);
            }
        }
    }

    public update(): void {
        if (!this.isTransitioning) {
            this.currentUI?.animationFrame();

            return;
        }

        this.transition.draw(this.currentUI, this.previousUI);

        const type: UserInterfaceMode = this.currentUI instanceof UserInterfaceMenu ? 'menu' : 'game';

        if (this.transition.update(type)) {
            this.cleanup();
        }
    }
}