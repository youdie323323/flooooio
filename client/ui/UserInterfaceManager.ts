import { cameraController, mobs, players } from "../main";
import UserInterface from "./UserInterface";
import UserInterfaceGame from "./UserInterfaceGame";
import UserInterfaceMenu from "./UserInterfaceMenu";

export class UserInterfaceManager {
    public currentUI: UserInterface | null;
    public previousUI: UserInterface | null;
    private canvas: HTMLCanvasElement;
    public blackArcCounter: number;
    public isTransitioning: boolean;
    public timeout: NodeJS.Timeout;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.currentUI = new UserInterfaceMenu(this.canvas);
        this.previousUI = null;
        this.blackArcCounter = -1;
        this.isTransitioning = false;
        this.timeout = null;
    }

    public switchUI(type: 'menu' | 'game'): void {
        const resetAllEnvroiment = () => {
            if (this.previousUI) {
                // Release all components
                this.previousUI.cleanup();
                this.previousUI._cleanup();
            }

            this.blackArcCounter = -1;
            this.isTransitioning = false;
        };

        if (this.isTransitioning) {
            clearTimeout(this.timeout);

            resetAllEnvroiment();

            return this.switchUI(type);
        };

        this.isTransitioning = true;
        this.previousUI = this.currentUI;
        this.blackArcCounter = 4;

        switch (type) {
            case 'menu':
                this.currentUI = new UserInterfaceMenu(this.canvas);

                break;
            case 'game':
                // Reset camera
                cameraController.zoom = 1;
                this.currentUI = new UserInterfaceGame(this.canvas);

                break;
        }

        this.timeout = setTimeout(resetAllEnvroiment, this.canvas.height);
    }
}