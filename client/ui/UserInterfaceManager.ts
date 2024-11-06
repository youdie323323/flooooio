import UserInterface from "./UserInterface";
import UserInterfaceGame from "./UserInterfaceGame";
import UserInterfaceMenu from "./UserInterfaceMenu";

export class UserInterfaceManager {
    private static instance: UserInterfaceManager;
    private currentUI: UserInterface | null;
    private canvas: HTMLCanvasElement;
    
    private constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.currentUI = null;
    }

    public static getInstance(canvas: HTMLCanvasElement): UserInterfaceManager {
        if (!UserInterfaceManager.instance) {
            UserInterfaceManager.instance = new UserInterfaceManager(canvas);
        }
        return UserInterfaceManager.instance;
    }

    public async switchUI(type: 'menu' | 'game'): Promise<void> {
        // Clean up previous UI if exists
        if (this.currentUI) {
            await this.currentUI.onExit();

            this.currentUI.buttons = [];
            this.currentUI.activeButton = null;
        }

        // Create new UI
        switch (type) {
            case 'menu':
                this.currentUI = new UserInterfaceMenu(this.canvas);
                break;
            case 'game':
                this.currentUI = new UserInterfaceGame(this.canvas);
                break;
        }

        // Initialize new UI
        await this.currentUI.onInit();
    }

    public getCurrentUI(): UserInterface | null {
        return this.currentUI;
    }
}