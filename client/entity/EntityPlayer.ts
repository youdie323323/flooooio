import { deltaTime } from "../main";
import Entity from "./Entity";
import { drawEntityDetail } from "./entityDrawDetail";
import { TWO_PI } from "../constants";
import { Mood } from "../../shared/enum";

export default class EntityPlayer extends Entity {
    angryT: number;
    sadT: number;
    mood: Mood;
    isDeleted: boolean;

    constructor(id: number, x: number, y: number, size: number, health: number, maxHealth: number, angle: number, mood: Mood, readonly nickname: string) {
        super(id, x, y, size, health, maxHealth, angle);

        this.angryT = 0;
        this.sadT = 0;
        this.mood = mood;
        this.isDeleted = false;
    }

    update() {
        super.update();
        if (this.isDead) {
            this.sadT = 1;
            this.angryT = 0;
        } else {
            const rI = deltaTime / 200;
            this.angryT = Math.min(1, Math.max(0, this.angryT + (this.mood === 1 ? rI : -rI)));
            this.sadT = Math.min(1, Math.max(0, this.sadT + (this.mood === 2 ? rI : -rI)));
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        if (this.isDead && this.deadT > 1) {
            return;
        }

        ctx.save();

        ctx.translate(this.x, this.y);

        drawEntityDetail(this, ctx);

        this.deadPreDraw(ctx);

        let scale = this.size / 25;
        ctx.scale(scale, scale);

        ctx.fillStyle = this.getSkinColor("#ffe763");
        ctx.lineWidth = 2.75;
        ctx.strokeStyle = this.getSkinColor("#cfbb50");
        ctx.beginPath();
        ctx.arc(0, 0, 25, 0, TWO_PI);
        ctx.fill();
        ctx.stroke();

        const sadT = this.sadT;
        const angryT = this.angryT;
        const rS = sadT * 4;
        const rR = angryT * 6;

        function drawDeadEyes(s7: number, s8: number) {
            ctx.beginPath();
            const offset = 4;
            ctx.moveTo(s7 - offset, s8 - offset);
            ctx.lineTo(s7 + offset, s8 + offset);
            ctx.moveTo(s7 + offset, s8 - offset);
            ctx.lineTo(s7 - offset, s8 + offset);
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
            let drawEyeShape = function (s9: number, sa: number, sb: number, sc: number, flag = 0) {
                const flippedFlag = flag ^ 1;
                ctx.moveTo(s9 - sb, sa - sc + flag * rR + flippedFlag * rS);
                ctx.lineTo(s9 + sb, sa - sc + flippedFlag * rR + flag * rS);
                ctx.lineTo(s9 + sb, sa + sc);
                ctx.lineTo(s9 - sb, sa + sc);
                ctx.lineTo(s9 - sb, sa - sc);
            };

            let drawEyeOutline = function (flag = 0) {
                ctx.beginPath();
                ctx.ellipse(7, -5, 2.5 + flag, 6 + flag, 0, 0, TWO_PI);
                ctx.moveTo(-7, -5);
                ctx.ellipse(-7, -5, 2.5 + flag, 6 + flag, 0, 0, TWO_PI);
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
            ctx.arc(7 + this.eyeX * 2, -5 + this.eyeY * 3.5, 3.1, 0, TWO_PI);
            ctx.moveTo(-7, -5);
            ctx.arc(-7 + this.eyeX * 2, -5 + this.eyeY * 3.5, 3.1, 0, TWO_PI);
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