import { TWO_PI } from "../constants";
import Entity from "./Entity";
import { MobType, PetalType } from "../../shared/types";
import { Rarities } from "../../shared/rarities";
import { deltaTime } from "../main";
import { drawEntityDetail } from "./EntityDrawDetail";
import { darkend, darkendBase } from "../utils/small";

function createBodyPath() {
    const p2 = new Path2D();
    p2.moveTo(-40, 5);
    p2.bezierCurveTo(-40, 40, 40, 40, 40, 5);
    p2.lineTo(40, -5);
    p2.bezierCurveTo(40, -40, -40, -40, -40, -5);
    p2.closePath();
    return p2;
}

const bodyPath = createBodyPath();

export default class EntityMob extends Entity {
    type: MobType | PetalType;
    rarity: Rarities;
    // For hp bar
    legD: number[];
    isPet: boolean;

    constructor(id: number, type: MobType | PetalType, rarity: Rarities, x: number, y: number, size: number, health: number, maxHealth: number, angle: number, isPet: boolean) {
        super(id, x, y, size, health, maxHealth, angle);
        this.type = type;
        this.rarity = rarity;
        this.isPet = isPet;
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
            ctx.fillStyle = this.getSkinColor(fill);
            ctx.fill();
            ctx.strokeStyle = this.getSkinColor(stroke);
            ctx.stroke();
        };

        ctx.rotate(this.angle);

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
                ctx.strokeStyle = this.getSkinColor(darkend("#d0504e", darkendBase));
                ctx.stroke();
                ctx.lineWidth = 26;
                ctx.strokeStyle = ctx.fillStyle = this.getSkinColor("#d0504e");
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
                ctx.fillStyle = "#d3756b";
                ctx.fill();
                break;
            }
            case MobType.JELLYFISH: {
                ctx.scale(this.size / 20, this.size / 20);
                const sm = ctx.globalAlpha;
                ctx.strokeStyle = ctx.fillStyle = this.getSkinColor("#ffffff");
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
            case MobType.BEETLE: {
                ctx.save();
                ctx.scale(this.size / 40, this.size / 40);
                ctx.fillStyle = ctx.strokeStyle = this.getSkinColor("#333333");
                ctx.lineCap = ctx.lineJoin = "round";
                for (let i = 0; i < 2; i++) {
                    const relative = i === 0 ? 1 : -1;
                    ctx.save();
                    // Maybe relative * 10 better
                    ctx.translate(28, relative * 9);
                    ctx.rotate(Math.sin(this.moveCounter * 1.24) * 0.1 * relative);
                    ctx.beginPath();
                    ctx.moveTo(0, relative * 7);
                    ctx.quadraticCurveTo(25, relative * 15, 40, 0);
                    ctx.quadraticCurveTo(20, relative * 6, 0, 0);
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                    ctx.restore();
                }
                const skinColor = this.isPet ? ["#ffe667", "#d0bb55"] : ["#8f5db0", "#754a8f"];
                ctx.fillStyle = this.getSkinColor(skinColor[0]);
                ctx.fill(bodyPath);
                ctx.lineWidth = 6;
                ctx.fillStyle = ctx.strokeStyle = this.getSkinColor(skinColor[1]);
                ctx.stroke(bodyPath);
                ctx.beginPath();
                ctx.moveTo(-21, 0);
                ctx.quadraticCurveTo(0, -3, 21, 0);
                ctx.lineCap = "round";
                ctx.lineWidth = 7;
                ctx.stroke();
                const rS = [[-17, -13], [17, -13], [0, -17]];
                ctx.beginPath();
                for (let sZ = 0; sZ < 2; sZ++) {
                    const t0 = sZ === 1 ? 1 : -1;
                    for (let t1 = 0; t1 < rS.length; t1++) {
                        let [t2, t3] = rS[t1];
                        t3 *= t0;
                        ctx.moveTo(t2, t3);
                        ctx.arc(t2, t3, 5, 0, TWO_PI);
                    }
                }
                ctx.fill();
                ctx.fill();
                ctx.restore();
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
        let bcolor = this.getSkinColor("#333333");
        let fcolor = "#ffe763";
        let scolor = darkend(fcolor, 0.1);

        ctx.scale(this.size / 30, this.size / 30);

        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.lineWidth = 5;

        { // Stinger
            ctx.fillStyle = "#333333";
            ctx.strokeStyle = this.getSkinColor(darkend("#333333", 0.1));
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
        let bcolor = this.getSkinColor("#333333");
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
            ctx.strokeStyle = this.getSkinColor(darkend("#333333", 0.1));
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