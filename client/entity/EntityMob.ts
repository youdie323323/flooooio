import { TWO_PI } from "../constants";
import Entity from "./Entity";
import { MobType, PetalType } from "../../shared/types";
import { Rarities } from "../../shared/rarities";
import { deltaTime } from "../main";
import { drawEntityDetail } from "./EntityDrawDetail";

// #00000030
export const darkendBase = 0.1875;

/**
 * Darkens colour 
 * @param color color code
 * @param strength strenth
 */
export function darkend(color: string, strength: number) {
    let r = parseInt(color.slice(1, 3), 16);
    let g = parseInt(color.slice(3, 5), 16);
    let b = parseInt(color.slice(5, 7), 16);

    r = Math.floor(r * (1 - strength));
    g = Math.floor(g * (1 - strength));
    b = Math.floor(b * (1 - strength));

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export default class EntityMob extends Entity {
    type: MobType | PetalType;
    rarity: Rarities;
    // For hp bar
    legD: number[];

    constructor(id: number, type: MobType | PetalType, rarity: Rarities, x: number, y: number, size: number, health: number, maxHealth: number, angle: number) {
        super(id, x, y, size, health, maxHealth, angle);
        this.type = type;
        this.rarity = rarity;
    }

    update() {
        super.update();
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();

        ctx.translate(this.x, this.y);

        // Use this before deadPreDraw
        drawEntityDetail(this, ctx);

        this.deadPreDraw(ctx);

        ctx.lineWidth = 6;

        const drawBasics = (fill: string, stroke: string) => {
            const size = this.size / 20;
            ctx.scale(size, size);
            ctx.beginPath();
            ctx.arc(0, 0, 20, 0, TWO_PI);
            ctx.fillStyle = this.getHurtColor(fill);
            ctx.fill();
            ctx.strokeStyle = this.getHurtColor(stroke);
            ctx.stroke();
        };

        switch (this.type) {
            case MobType.BEE: {
                this.drawBee(ctx);
                break;
            }
            case MobType.STARFISH: {
                ctx.scale(this.size / 80, this.size / 80);
                ctx.rotate(Date.now() / 2000 % TWO_PI + this.moveCounter * 0.4);
                const starfishLegCount = 5;
                if (!this.legD) {
                    this.legD = Array(starfishLegCount).fill(150);
                }
                const s3 = this.legD;
                const s4 = this.isDead ? 0 : Math.floor(this.nHealth * (starfishLegCount - 1));
                ctx.beginPath();
                for (let tv = 0; tv < starfishLegCount; tv++) {
                    const tw = (tv + 0.5) / starfishLegCount * Math.PI * 2;
                    const tx = (tv + 1) / starfishLegCount * Math.PI * 2;
                    s3[tv] += ((tv < s4 ? 175 : 105) - s3[tv]) * 0.5;
                    const ty = s3[tv];
                    if (tv === 0) {
                        ctx.moveTo(ty, 0);
                    }
                    ctx.quadraticCurveTo(Math.cos(tw) * 15, Math.sin(tw) * 15, Math.cos(tx) * ty, Math.sin(tx) * ty);
                }
                ctx.closePath();
                ctx.lineCap = ctx.lineJoin = "round";
                ctx.lineWidth = 52;
                ctx.strokeStyle = this.getHurtColor(darkend("#9f546a", darkendBase));
                ctx.stroke();
                ctx.lineWidth = 26;
                ctx.strokeStyle = ctx.fillStyle = this.getHurtColor("#9f546a");
                ctx.fill();
                ctx.stroke();
                ctx.beginPath();
                for (let tz = 0; tz < starfishLegCount; tz++) {
                    const tA = tz / starfishLegCount * Math.PI * 2;
                    ctx.save();
                    ctx.rotate(tA);
                    const tB = s3[tz] / 175;
                    let step = 56;
                    const ballCount = 3;
                    for (let tE = 0; tE < ballCount; tE++) {
                        const tF = (1 - tE / ballCount * 0.8) * 24 * tB;
                        ctx.moveTo(step, 0);
                        ctx.arc(step, 0, tF, 0, Math.PI * 2);
                        step += tF * 2 + tB * 5;
                    }
                    ctx.restore();
                }
                ctx.fillStyle = "#a16f7f";
                ctx.fill();
                break;
            }
            case MobType.JELLYFISH: {
                ctx.scale(this.size / 20, this.size / 20);
                const sm = ctx.globalAlpha;
                ctx.strokeStyle = ctx.fillStyle = this.getHurtColor("#ffffff");
                ctx.globalAlpha = sm * 0.6;
                ctx.beginPath();
                for (let uf = 0; uf < 10; uf++) {
                    const ug = uf / 10 * Math.PI * 2;
                    ctx.save();
                    ctx.rotate(ug);
                    ctx.translate(17.5, 0);
                    ctx.moveTo(0, 0);
                    const uh = Math.sin(ug + Date.now() / 500);
                    ctx.rotate(uh * 0.5);
                    ctx.quadraticCurveTo(4, uh * -2, 14, 0);
                    ctx.restore();
                }
                ctx.lineCap = "round";
                ctx.lineWidth = 2.3;
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(0, 0, 20, 0, Math.PI * 2);
                ctx.globalAlpha = sm * 0.5;
                ctx.fill();
                ctx.clip();
                ctx.lineWidth = 3;
                ctx.stroke();
                break;
            }
            case PetalType.BASIC: {
                drawBasics("#ffffff", "#cfcfcf");
                break;
            }
            case PetalType.FASTER: {
                drawBasics("#feffc9", "#cecfa3");
                break;
            }

        }

        ctx.restore();
    }

    drawBee(ctx: CanvasRenderingContext2D) {
        let bcolor = this.getHurtColor("#333333");
        let fcolor = "#ffe763";
        let scolor = darkend(fcolor, 0.1);

        const radius = this.size / 30;

        // Setups
        ctx.scale(radius, radius);
        ctx.rotate(this.angle);

        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.lineWidth = 5;

        { // Stinger
            ctx.fillStyle = "#333333";
            ctx.strokeStyle = this.getHurtColor(darkend("#333333", 0.1));
            ctx.beginPath();
            ctx.moveTo(-37, 0);
            ctx.lineTo(-25, -9);
            ctx.lineTo(-25, 9);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }

        // Body
        ctx.beginPath();
        ctx.ellipse(0, 0, 30, 20, 0, 0, TWO_PI);
        ctx.fillStyle = fcolor;
        ctx.fill();

        { // Body stripes
            ctx.save();
            ctx.clip();
            ctx.fillStyle = bcolor;
            ctx.fillRect(10, -20, 10, 40);
            ctx.fillRect(-10, -20, 10, 40);
            ctx.fillRect(-30, -20, 10, 40);
            ctx.restore();
        }

        // Body outline
        ctx.beginPath();
        ctx.ellipse(0, 0, 30, 20, 0, 0, TWO_PI);
        ctx.strokeStyle = scolor;
        ctx.stroke();

        // Antennas
        {
            ctx.strokeStyle = bcolor;
            ctx.fillStyle = bcolor;
            ctx.lineWidth = 3;
            for (let dir = -1; dir <= 1; dir += 2) {
                ctx.beginPath();
                ctx.moveTo(25, 5 * dir);
                ctx.quadraticCurveTo(35, 5 * dir, 40, 15 * dir);
                ctx.stroke()

                ctx.beginPath();
                ctx.arc(40, 15 * dir, 5, 0, TWO_PI);
                ctx.fill();
            }
        }
    }

    drawBasic(ctx: CanvasRenderingContext2D) {
        let bcolor = this.getHurtColor("#333333");
        let fcolor = "#ffe763";
        let scolor = darkend(fcolor, 0.1);

        const radius = this.size / 30;

        // Setups
        ctx.scale(radius, radius);
        ctx.rotate(this.angle);

        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.lineWidth = 5;

        { // Stinger
            ctx.fillStyle = "#333333";
            ctx.strokeStyle = this.getHurtColor(darkend("#333333", 0.1));
            ctx.beginPath();
            ctx.moveTo(-37, 0);
            ctx.lineTo(-25, -9);
            ctx.lineTo(-25, 9);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }

        // Body
        ctx.beginPath();
        ctx.ellipse(0, 0, 30, 20, 0, 0, TWO_PI);
        ctx.fillStyle = fcolor;
        ctx.fill();

        { // Body stripes
            ctx.save();
            ctx.clip();
            ctx.fillStyle = bcolor;
            ctx.fillRect(10, -20, 10, 40);
            ctx.fillRect(-10, -20, 10, 40);
            ctx.fillRect(-30, -20, 10, 40);
            ctx.restore();
        }

        // Body outline
        ctx.beginPath();
        ctx.ellipse(0, 0, 30, 20, 0, 0, TWO_PI);
        ctx.strokeStyle = scolor;
        ctx.stroke();

        // Antennas
        {
            ctx.strokeStyle = bcolor;
            ctx.fillStyle = bcolor;
            ctx.lineWidth = 3;
            for (let dir = -1; dir <= 1; dir += 2) {
                ctx.beginPath();
                ctx.moveTo(25, 5 * dir);
                ctx.quadraticCurveTo(35, 5 * dir, 40, 15 * dir);
                ctx.stroke()

                ctx.beginPath();
                ctx.arc(40, 15 * dir, 5, 0, TWO_PI);
                ctx.fill();
            }
        }
    }
}