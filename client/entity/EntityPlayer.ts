import { deltaTime } from "../main";
import { TWO_PI } from "../constants";
import Entity from "./Entity";
import { MoodKind } from "../../shared/packet";
import { drawEntityDetail } from "./EntityDrawDetail";

export default class EntityPlayer extends Entity {
    angryT: number;
    sadT: number;
    mood: MoodKind;
    nickname: string;

    constructor(id: number, x: number, y: number, size: number, health: number, maxHealth: number, angle: number, mood: MoodKind, nickname: string) {
        super(id, x, y, size, health, maxHealth, angle);
        this.angryT = 0;
        this.sadT = 0;
        this.mood = mood;
        this.nickname = nickname;
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
        if (this.isDead) {
            return;
        }

        ctx.save();

        ctx.translate(this.x, this.y);

        drawEntityDetail(this, ctx);

        let scale = this.size / 25;
        ctx.scale(scale, scale);

        ctx.fillStyle = this.getHurtColor("#ffe763");
        ctx.lineWidth = 2.75;
        ctx.strokeStyle = this.getHurtColor("#cfbb50");
        ctx.beginPath();
        ctx.arc(0, 0, 25, 0, TWO_PI);
        ctx.fill();
        ctx.stroke();

        const sadT = this.sadT;
        const angryT = this.angryT;
        const rS = sadT * 4;
        const rR = angryT * 6;

        function rT(s7, s8) {
            ctx.beginPath();
            const s9 = 4;
            ctx.moveTo(s7 - s9, s8 - s9);
            ctx.lineTo(s7 + s9, s8 + s9);
            ctx.moveTo(s7 + s9, s8 - s9);
            ctx.lineTo(s7 - s9, s8 + s9);
            ctx.lineWidth = 3;
            ctx.lineCap = "round";
            ctx.strokeStyle = "#000000";
            ctx.stroke();
            ctx.closePath();
        }

        if (this.isDead) {
            rT(7, -5);
            rT(-7, -5);
        } else {
            let s7 = function (s9: number, sa: number, sb: number, sc: number, se = 0) {
                const sf = se ^ 1;
                ctx.moveTo(s9 - sb, sa - sc + se * rR + sf * rS);
                ctx.lineTo(s9 + sb, sa - sc + sf * rR + se * rS);
                ctx.lineTo(s9 + sb, sa + sc);
                ctx.lineTo(s9 - sb, sa + sc);
                ctx.lineTo(s9 - sb, sa - sc);
            };
            let s8 = function (s9 = 0) {
                ctx.beginPath();
                ctx.ellipse(7, -5, 2.5 + s9, 6 + s9, 0, 0, TWO_PI);
                ctx.moveTo(-7, -5);
                ctx.ellipse(-7, -5, 2.5 + s9, 6 + s9, 0, 0, TWO_PI);
                ctx.strokeStyle = ctx.fillStyle = "#111111";
                ctx.fill();
            };
            ctx.save();
            ctx.beginPath();
            s7(7, -5, 3.5999999999999996, 7.3, 1);
            s7(-7, -5, 3.5999999999999996, 7.3, 0);
            ctx.clip();
            s8(0.7);
            s8(0);
            ctx.clip();
            ctx.beginPath();
            ctx.arc(7 + this.eyeX * 2, -5 + this.eyeY * 3.5, 3.1, 0, TWO_PI);
            ctx.moveTo(-7, -5);
            ctx.arc(-7 + this.eyeX * 2, -5 + this.eyeY * 3.5, 3.1, 0, TWO_PI);
            ctx.fillStyle = "#eee";
            ctx.fill();
            ctx.restore();
        }

        const rV = angryT * -10.5 + sadT * -9;
        ctx.beginPath();
        ctx.translate(0, 9.7);
        ctx.moveTo(-6.1, 0);
        ctx.quadraticCurveTo(0, 5.5 + rV, 6.1, 0);
        ctx.lineCap = "round";
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.restore();
    }
}