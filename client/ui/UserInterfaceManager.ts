import UserInterface from "./UserInterface";
import UserInterfaceGame from "./UserInterfaceGame";
import UserInterfaceMenu from "./UserInterfaceMenu";

export class UserInterfaceManager {
    private currentUI: UserInterface | null;
    private canvas: HTMLCanvasElement;
    
    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.currentUI = null;
    }

    public async switchUI(type: 'menu' | 'game'): Promise<void> {
        // Clean up previous UI if exists
        if (this.currentUI) {
            await this.currentUI.cleanup();

            this.currentUI.components = [];
            this.currentUI.activeComponent = null;
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
        await this.currentUI.initialize();
    }

    public getCurrentUI(): UserInterface | null {
        return this.currentUI;
    }
}