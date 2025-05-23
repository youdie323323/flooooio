import type { ColorCode} from "../../../../Utils/Color";
import { darkened, lightened } from "../../../../Utils/Color";
import type { Components, MaybePointerLike } from "../Component";
import { Component } from "../Component";
import type { PartialSizeLayoutOptions } from "./Container";
import { StaticHContainer, StaticPanelContainer } from "./Container";

export type ButtonCallback = () => void;

export class Button extends StaticPanelContainer<StaticHContainer> {
    private static readonly INVALID_COLOR = "#aaaaa9" as const satisfies ColorCode;

    protected isPressed: boolean = false;
    protected isHovered: boolean = false;

    protected isValid: boolean = true;

    /**
     * @param buttonComponents - Components to be added to button visibility, which are not "added"
     */
    constructor(
        layoutOptions: MaybePointerLike<PartialSizeLayoutOptions>,

        rectRadii: MaybePointerLike<number> = 1,

        strokeWidthLimit: MaybePointerLike<number> = 2,
        strokeWidthCoef: MaybePointerLike<number> = 1,

        buttonComponents: Array<Components>,

        protected readonly callback: ButtonCallback,

        protected readonly buttonColor: MaybePointerLike<ColorCode>,
        
        protected readonly validate: MaybePointerLike<boolean>,
    ) {
        super(
            layoutOptions,

            false,

            () => this.getButtonColor(),

            rectRadii,

            strokeWidthLimit,
            strokeWidthCoef,
        );

        this.once("onInitialized", () => {
            this.addChild(new StaticHContainer({}).addChildren(...buttonComponents));

            buttonComponents = null;
        });

        this.on("onFocus", () => {
            if (!this.isValid) {
                return;
            }

            this.context.canvas.style.cursor = "pointer";

            this.isHovered = true;
        });

        this.on("onBlur", () => {
            if (!this.isValid) {
                return;
            }

            this.context.canvas.style.cursor = "default";

            this.isHovered = false;
            this.isPressed = false;
        });

        this.on("onClick", () => {
            if (!this.isValid) {
                return;
            }

            this.callback();
        });

        this.on("onDown", () => {
            if (!this.isValid) {
                return;
            }

            this.isPressed = true;
        });

        this.on("onUp", () => {
            if (!this.isValid) {
                return;
            }

            this.isPressed = false;
        });
    }

    override render(ctx: CanvasRenderingContext2D): void {
        super.render(ctx);

        this.isValid = Component.computePointerLike(this.validate);
        if (!this.isValid) {
            this.isHovered = false;
            this.isPressed = false;
        }
    }

    private getButtonColor(): ColorCode {
        if (!this.isValid) return Button.INVALID_COLOR;

        const computedColor = Component.computePointerLike(this.buttonColor);

        if (this.isPressed) {
            return darkened(computedColor, 0.106);
        } else if (this.isHovered) {
            return lightened(computedColor, 0.1);
        }

        return computedColor;
    }
}