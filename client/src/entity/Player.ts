import { decodeMood } from "../../../shared/mood";
import { deltaTime } from "../../main";
import Entity from "./Entity";
import drawEntityDetail from "./drawEntityDetail";

const TAU = Math.PI * 2;

export default class Player extends Entity {
    angryT: number;
    sadT: number;

    /**
     * The player is completely removed from server (not likely death).
     */
    isRemoved: boolean;

    /**
     * Player is dev flower or not.
     */
    isDev: boolean;

    constructor(
        id: number,
        x: number,
        y: number,
        angle: number,
        size: number,
        health: number,

        public mood: number,

        readonly nickname: string,

        /**
         * To draw or not to draw entity details.
         */
        private readonly isStaticLike: boolean = false,
    ) {
        super(id, x, y, angle, size, health);

        this.angryT = 0;
        this.sadT = 0;

        this.isRemoved = false;

        this.isDev = true;
    }

    update() {
        super.update();

        if (this.isDead) {
            this.sadT = 1;
            this.angryT = 0;
        } else {
            const interpolationRate = deltaTime / 100;

            const { 0: isAngry, 1: isSad } = decodeMood(this.mood);

            this.angryT = Math.min(1, Math.max(0, this.angryT + (isAngry ? interpolationRate : -interpolationRate)));
            this.sadT = Math.min(1, Math.max(0, this.sadT + (!isAngry && isSad ? interpolationRate : -interpolationRate)));
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        if (
            // Dont no-draw when static
            !this.isStaticLike &&
            this.isDead &&
            this.deadT > 1
        ) {
            return;
        }

        ctx.save();

        ctx.translate(this.x, this.y);

        if (!this.isStaticLike) {
            drawEntityDetail(this, ctx);

            this.deadPreDraw(ctx);
        }

        let scale = this.size / 25;
        ctx.scale(scale, scale);

        if (this.isDev) {
            // Dev body
            {
                ctx.save();

                ctx.lineCap = "round";
            
                ctx.fillStyle = '#ffe763';
                ctx.lineWidth = 2;
                ctx.strokeStyle = '#cebb50';
            
                ctx.beginPath();
                ctx.moveTo(27, -0.5);
                
                ctx.quadraticCurveTo(19, 35, 4, 25.5);
                ctx.quadraticCurveTo(-21, 18, -23, 5); 
                ctx.quadraticCurveTo(-27, -32, -1, -23); 
                ctx.quadraticCurveTo(18, -24, 27, -0.5); 
                
                ctx.fill();
                ctx.stroke();
                ctx.closePath();

                ctx.restore();
            }

            const sadT = this.sadT;
            const angryT = this.angryT;

            function drawDeadEyes(eyeX: number, eyeY: number) {
                ctx.beginPath();
                const offset = 4;
                ctx.moveTo(eyeX - offset, eyeY - offset);
                ctx.lineTo(eyeX + offset, eyeY + offset);
                ctx.moveTo(eyeX + offset, eyeY - offset);
                ctx.lineTo(eyeX - offset, eyeY + offset);
                ctx.lineWidth = 3;
                ctx.lineCap = "round";
                ctx.strokeStyle = "#000000";
                ctx.stroke();
                ctx.closePath();
            }

            if (this.isDead) {
                drawDeadEyes(11, 8);
                drawDeadEyes(-10, -8);
            } else {
                let drawEyeOutline = function (flag = 0) {
                    ctx.beginPath();
                    ctx.ellipse(11, 8, 2.5 + flag, 6 + flag, -0.15, 0, TAU);
                    ctx.moveTo(-8, -5);
                    ctx.ellipse(-10, -8, 2.5 + flag, 6 + flag, -0.15, 0, TAU);
                    ctx.strokeStyle = ctx.fillStyle = "#111111";
                    ctx.fill();
                };

                ctx.save();

                ctx.beginPath();

                drawEyeOutline(0.7);
                drawEyeOutline(0);
                ctx.clip();
                
                ctx.beginPath();
                ctx.arc(11 + this.eyeX * 2, 8 + this.eyeY * 3.5, 3.1, 0, TAU);
                ctx.moveTo(-8, -5);
                ctx.arc(-10 + -this.eyeX * 2, -8 + -this.eyeY * 3.5, 3.1, 0, TAU);
                ctx.fillStyle = "#eee";
                ctx.fill();

                ctx.restore();
            }

            const verticRise = angryT * -10.5 + sadT * -9;

            ctx.beginPath();
            ctx.translate(-7, 8);
            ctx.rotate(0.5)
            ctx.moveTo(-3, 0);
            ctx.quadraticCurveTo(0, 5.5 + verticRise, 3, 0);
            ctx.lineCap = "round";
            ctx.strokeStyle = "#000000";
            ctx.lineWidth = 1.5;
            ctx.stroke();
        } else {
            ctx.fillStyle = this.getSkinColor("#ffe763");
            ctx.lineWidth = 2.75;
            ctx.strokeStyle = this.getSkinColor("#cfbb50");
            ctx.beginPath();
            ctx.arc(0, 0, 25, 0, TAU);
            ctx.fill();
            ctx.stroke();

            const sadT = this.sadT;
            const angryT = this.angryT;
            const angerOffset = angryT * 6;

            function drawDeadEyes(eyeX: number, eyeY: number) {
                ctx.beginPath();
                const offset = 4;
                ctx.moveTo(eyeX - offset, eyeY - offset);
                ctx.lineTo(eyeX + offset, eyeY + offset);
                ctx.moveTo(eyeX + offset, eyeY - offset);
                ctx.lineTo(eyeX - offset, eyeY + offset);
                ctx.lineWidth = 3;
                ctx.lineCap = "round";
                ctx.strokeStyle = "#000000";
                ctx.stroke();
                ctx.closePath();
            }

            if (this.isDead) {
                drawDeadEyes(7, -5);
                drawDeadEyes(-7, -5);
            } else {
                let drawEyeShape = function (centerX: number, centerY: number, widthRadius: number, heightRadius: number, flag = 0) {
                    const flippedFlag = flag ^ 1;
                    ctx.moveTo(centerX - widthRadius, centerY - heightRadius + flag * angerOffset);
                    ctx.lineTo(centerX + widthRadius, centerY - heightRadius + flippedFlag * angerOffset + flag);
                    ctx.lineTo(centerX + widthRadius, centerY + heightRadius);
                    ctx.lineTo(centerX - widthRadius, centerY + heightRadius);
                    ctx.lineTo(centerX - widthRadius, centerY - heightRadius);
                };

                let drawEyeOutline = function (flag = 0) {
                    ctx.beginPath();
                    ctx.ellipse(7, -5, 2.5 + flag, 6 + flag, 0, 0, TAU);
                    ctx.moveTo(-7, -5);
                    ctx.ellipse(-7, -5, 2.5 + flag, 6 + flag, 0, 0, TAU);
                    ctx.strokeStyle = ctx.fillStyle = "#111111";
                    ctx.fill();
                };

                ctx.save();

                ctx.beginPath();

                drawEyeShape(7, -5, 3.5999999999999996, 7.3, 1);
                drawEyeShape(-7, -5, 3.5999999999999996, 7.3, 0);
                ctx.clip();

                drawEyeOutline(0.7);
                drawEyeOutline(0);
                ctx.clip();
                
                ctx.beginPath();
                ctx.arc(7 + this.eyeX * 2, -5 + this.eyeY * 3.5, 3.1, 0, TAU);
                ctx.moveTo(-7, -5);
                ctx.arc(-7 + this.eyeX * 2, -5 + this.eyeY * 3.5, 3.1, 0, TAU);
                ctx.fillStyle = "#eee";
                ctx.fill();

                ctx.restore();
            }

            const verticRise = angryT * -10.5 + sadT * -9;
            
            ctx.beginPath();
            ctx.translate(0, 9.7);
            ctx.moveTo(-6.1, 0);
            ctx.quadraticCurveTo(0, 5.5 + verticRise, 6.1, 0);
            ctx.lineCap = "round";
            ctx.strokeStyle = "#000000";
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }

        ctx.restore();
    }
}