import type { ButtonCallback } from "../Layout/Components/WellKnown/Button";
import { Button } from "../Layout/Components/WellKnown/Button";
import { SVGLogo } from "../Layout/Components/WellKnown/Logo";
import GEAR_ICON_SVG from "./Assets/gear_icon.svg";
import type { SquareSizeLayoutOptions } from "../Layout/Components/WellKnown/Container";

const easeOutQuad = (x: number): number => Math.sqrt(1 - Math.pow(x - 1, 2));

export default class UISettingButton extends Button {
    private static readonly RETURN_DURATION: number = 250;

    private currentGearRotation: number = 0;
    private gearRotationInterval: NodeJS.Timeout;
    private rotationStartTime: number = 0;
    private initialRotation: number = 0;
    private isReturning: boolean = false;
    private isClicked: boolean = false;

    constructor(
        layoutOptions: SquareSizeLayoutOptions,

        size: number,

        callback: ButtonCallback,
    ) {
        super(
            {
                ...layoutOptions,

                w: size,
                h: size,
            },

            3,

            3,
            1,

            [
                new SVGLogo(
                    {
                        w: size,
                        h: size,
                    },

                    GEAR_ICON_SVG,
                    0.8,
                    () => this.currentGearRotation,
                ),
            ],

            callback,

            "#aaaaaa",

            true,
        );

        const startAdvanceRotation = () => {
            this.isReturning = false;
            if (this.gearRotationInterval) clearInterval(this.gearRotationInterval);

            this.gearRotationInterval = setInterval(() => {
                this.currentGearRotation += 0.004;
            }, 1);
        };

        const startAdvanceReturn = () => {
            if (this.isClicked) return;

            if (this.gearRotationInterval) clearInterval(this.gearRotationInterval);

            this.isReturning = true;

            this.initialRotation = this.currentGearRotation;
            this.rotationStartTime = Date.now();
        };

        this.on("onFocus", startAdvanceRotation);

        this.on("onBlur", startAdvanceReturn);

        this.on("onClick", () => {
            this.isClicked = true;
        });

        this.on("onClickOutside", () => {
            this.isClicked = false;

            startAdvanceReturn();
        });
    }

    override render(ctx: CanvasRenderingContext2D): void {
        super.render(ctx);

        if (this.isReturning) {
            const elapsed = Date.now() - this.rotationStartTime;
            const progress = Math.min(elapsed / UISettingButton.RETURN_DURATION, 1);

            if (progress < 1) {
                this.currentGearRotation = this.initialRotation * (1 - easeOutQuad(progress));
            } else {
                this.currentGearRotation = 0;
                this.isReturning = false;
            }
        }
    }
}