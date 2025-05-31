import UIGame from "./Game/UIGame";
import UITitle from "./Title/UITitle";
import type AbstractUI from "./UI";
import UISceneTransition from "./UISceneTransition";

export type UIType = "game" | "title";

export type RealUICtor = UIGame | UITitle;

export default class UIContext {
    private readonly transition: UISceneTransition;
    public isTransitioning: boolean;

    public currentContext: AbstractUI | null;
    public previousContext: AbstractUI | null;

    constructor(private readonly canvas: HTMLCanvasElement) {
        this.currentContext = new UITitle(canvas);
        this.previousContext = null;

        this.transition = new UISceneTransition(canvas);
        this.isTransitioning = false;
    }

    public cleanup(): void {
        // Cleanup ui-depending values & components
        this.previousContext?.destroy();
        this.previousContext?.cleanupComponentHierarchy();

        // Set cursor to default
        this.canvas.style.cursor = "default";

        this.isTransitioning = false;
    }

    public switchUI(mode: UIType): void {
        if (this.isTransitioning) {
            // Dont do anything because its double click
            return;
        }

        this.previousContext = this.currentContext;

        this.previousContext.onContextChange();

        // Cleanup listeners so cant touch before ui buttons
        this.previousContext?.removeEventListeners();

        // Set cursor to default
        this.canvas.style.cursor = "default";

        this.currentContext = this.createUI(mode);

        this.isTransitioning = true;

        this.transition.start(mode);
    }

    private createUI(mode: UIType): RealUICtor {
        switch (mode) {
            case "title": {
                return new UITitle(this.canvas);
            }

            case "game": {
                return new UIGame(this.canvas);
            }
        }
    }

    public update(): void {
        if (!this.isTransitioning) {
            this.currentContext?.render();

            return;
        }

        this.transition.draw(this.currentContext, this.previousContext);

        const type = (
            this.currentContext instanceof UITitle
                ? "title"
                : "game"
        ) satisfies UIType;

        if (this.transition.update(type)) {
            this.cleanup();
        }
    }
}