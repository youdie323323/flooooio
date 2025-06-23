"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const UIGame_1 = __importDefault(require("./Game/UIGame"));
const UITitle_1 = __importDefault(require("./Title/UITitle"));
const UISceneTransition_1 = __importDefault(require("./UISceneTransition"));
class UIContext {
    constructor(canvas) {
        this.canvas = canvas;
        this.currentContext = new UITitle_1.default(canvas);
        this.previousContext = null;
        this.transition = new UISceneTransition_1.default(canvas);
        this.isTransitioning = false;
    }
    cleanup() {
        // Cleanup ui-depending values & components
        this.previousContext?.destroy();
        this.previousContext?.cleanupComponentHierarchy();
        // Set cursor to default
        this.canvas.style.cursor = "default";
        this.isTransitioning = false;
    }
    switchUI(mode) {
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
    createUI(mode) {
        switch (mode) {
            case "title": {
                return new UITitle_1.default(this.canvas);
            }
            case "game": {
                return new UIGame_1.default(this.canvas);
            }
        }
    }
    update() {
        if (!this.isTransitioning) {
            this.currentContext?.render();
            return;
        }
        this.transition.draw(this.currentContext, this.previousContext);
        const type = (this.currentContext instanceof UITitle_1.default
            ? "title"
            : "game");
        if (this.transition.update(type)) {
            this.cleanup();
        }
    }
}
exports.default = UIContext;
