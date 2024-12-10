import { decodeMood, Mood } from "../../shared/mood";
import { deltaTime } from "../main";
import Entity from "./Entity";
import drawEntityDetail from "./entityDrawDetail";

const TAU = Math.PI * 2;

export default class EntityPlayer extends Entity {
    angryT: number;
    sadT: number;

    /**
     * The player is completely removed from server (not likely death).
     */
    isRemoved: boolean;

    constructor(
        id: number, 
        x: number, 
        y: number, 
        angle: number, 
        size: number, 
        health: number,
        maxHealth: number, 

        public mood: number, 

        readonly nickname: string,

        private readonly isStaticLike: boolean = false,
    ) {
        super(id, x, y, angle, size, health, maxHealth);

        this.angryT = 0;
        this.sadT = 0;
        
        this.isRemoved = false;
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
        if (!this.isStaticLike && this.isDead && this.deadT > 1) {
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

        ctx.fillStyle = this.getSkinColor("#ffe763");
        ctx.lineWidth = 2.75;
        ctx.strokeStyle = this.getSkinColor("#cfbb50");
        ctx.beginPath();
        ctx.arc(0, 0, 25, 0, TAU);
        ctx.fill();
        ctx.stroke();

        const sadT = this.sadT;
        const angryT = this.angryT;
        const sadnessOffset = sadT * 4;
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
                ctx.moveTo(centerX - widthRadius, centerY - heightRadius + flag * angerOffset + flippedFlag * sadnessOffset);
                ctx.lineTo(centerX + widthRadius, centerY - heightRadius + flippedFlag * angerOffset + flag * sadnessOffset);
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

        ctx.restore();
    }
}