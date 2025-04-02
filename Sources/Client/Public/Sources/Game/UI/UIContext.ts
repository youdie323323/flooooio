import UIGame from "./Game/UIGame";
import UITitle from "./Title/UITitle";
import type AbstractUI from "./UI";
import UserInterfaceSceneTransition from "./UISceneTransition";

export type UIType = 'game' | 'title';

export type RealUICtor = UIGame | UITitle;

export default class UIContext {
    private readonly transition: UserInterfaceSceneTransition;
    public isTransitioning: boolean;

    public currentCtx: AbstractUI | null;
    public previousCtx: AbstractUI | null;

    constructor(private readonly canvas: HTMLCanvasElement) {
        this.currentCtx = new UITitle(canvas);
        this.previousCtx = null;

        this.transition = new UserInterfaceSceneTransition(canvas);
        this.isTransitioning = false;
    }

    public cleanup(): void {
        // Cleanup ui-depending values & components
        this.previousCtx?.destroy();
        this.previousCtx?.cleanupComponentHierarchy();

        // Set cursor to default
        this.canvas.style.cursor = "default";

        this.isTransitioning = false;
    }

    public switchUI(mode: UIType): void {
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

    private createUI(mode: UIType): RealUICtor {
        switch (mode) {
            case 'title': {
                return new UITitle(this.canvas);
            }

            case 'game': {
                return new UIGame(this.canvas);
            }
        }
    }

    public update(): void {
        if (!this.isTransitioning) {
            this.currentCtx?.render();

            return;
        }

        this.transition.draw(this.currentCtx, this.previousCtx);

        const type = (
            this.currentCtx instanceof UITitle
                ? "title"
                : "game"
        ) satisfies UIType;

        if (this.transition.update(type)) {
            this.cleanup();
        }
    }
}