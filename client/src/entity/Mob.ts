import Entity from "./Entity";
import { ColorCode, darkend, DARKEND_BASE } from "../utils/common";
import drawEntityDetail from "./drawEntityDetail";
import { MobType, PetalType } from "../../../shared/EntityType";
import { Rarities } from "../../../shared/rarity";

const TAU = Math.PI * 2;

function createBeetleBodyPath() {
    const path = new Path2D();

    path.moveTo(0, -30);
    path.quadraticCurveTo(40, -30, 40, 0);
    path.quadraticCurveTo(40, 30, 0, 30);
    path.quadraticCurveTo(-40, 30, -40, 0);
    path.quadraticCurveTo(-40, -30, 0, -30);
    path.closePath();

    return path;
}

const beetleBodyPath = createBeetleBodyPath();

export default class Mob extends Entity {
    /**
     * Current starfish leg distance.
     */
    private legD: number[];

    constructor(
        id: number,
        x: number,
        y: number,
        angle: number,
        size: number,
        health: number,

        readonly type: MobType | PetalType,
        readonly rarity: Rarities,

        readonly isPet: boolean,

        readonly isFirstSegment: boolean,
    ) {
        super(id, x, y, angle, size, health);
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

        let scale: number;

        const drawBasicLike = (fill: string, stroke: string) => {
            scale = this.size / 20;

            ctx.scale(scale, scale);

            ctx.beginPath();
            ctx.arc(0, 0, 20, 0, TAU);
            ctx.fillStyle = this.getSkinColor(fill);
            ctx.fill();
            ctx.strokeStyle = this.getSkinColor(stroke);
            ctx.stroke();
        };

        ctx.rotate(this.angle);

        switch (this.type) {
            case MobType.BEE: {
                const bcolor = this.getSkinColor("#333333");
                const fcolor: ColorCode = "#ffe763";
                const scolor = darkend(fcolor, DARKEND_BASE);

                scale = this.size / 30;

                ctx.scale(scale, scale);

                ctx.lineJoin = "round";
                ctx.lineCap = "round";
                ctx.lineWidth = 5;

                { // Stinger
                    ctx.fillStyle = "#333333";
                    ctx.strokeStyle = this.getSkinColor(darkend("#333333", DARKEND_BASE));
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
                ctx.ellipse(0, 0, 30, 20, 0, 0, TAU);
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
                ctx.ellipse(0, 0, 30, 20, 0, 0, TAU);
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
                        ctx.arc(40, 15 * dir, 5, 0, TAU);
                        ctx.fill();
                    }
                }

                break;
            }

            case MobType.STARFISH: {
                scale = this.size / 80;

                ctx.scale(scale, scale);

                ctx.rotate(Date.now() / 2000 % TAU + this.moveCounter * 0.4);

                const STARFISH_LEG_AMOUNT = 5;

                if (!this.legD) {
                    this.legD = Array(STARFISH_LEG_AMOUNT).fill(150);
                }
                const legDistance = this.legD;
                const remainingLegsCount = this.isDead ? 0 : Math.floor(this.nHealth * STARFISH_LEG_AMOUNT);

                ctx.beginPath();
                for (let i = 0; i < STARFISH_LEG_AMOUNT; i++) {
                    const midAngle = (i + 0.5) / STARFISH_LEG_AMOUNT * TAU;
                    const endAngle = (i + 1) / STARFISH_LEG_AMOUNT * TAU;
                    legDistance[i] += ((i < remainingLegsCount ? 175 : 105) - legDistance[i]) * 0.5;
                    const legLength = legDistance[i];
                    if (i === 0) {
                        ctx.moveTo(legLength, 0);
                    }
                    ctx.quadraticCurveTo(
                        Math.cos(midAngle) * 15,
                        Math.sin(midAngle) * 15,
                        Math.cos(endAngle) * legLength,
                        Math.sin(endAngle) * legLength
                    );
                }
                ctx.closePath();
                ctx.lineCap = ctx.lineJoin = "round";
                ctx.lineWidth = 52;
                ctx.strokeStyle = this.getSkinColor(darkend("#d0504e", DARKEND_BASE));
                ctx.stroke();
                ctx.lineWidth = 26;
                ctx.strokeStyle = ctx.fillStyle = this.getSkinColor("#d0504e");
                ctx.fill();
                ctx.stroke();

                ctx.beginPath();
                for (let i = 0; i < STARFISH_LEG_AMOUNT; i++) {
                    const legRotation = i / STARFISH_LEG_AMOUNT * TAU;
                    ctx.save();
                    ctx.rotate(legRotation);
                    const lengthRatio = legDistance[i] / 175;
                    let spotPosition = 56;
                    const SPOTS_PER_LEG = 3;
                    for (let j = 0; j < SPOTS_PER_LEG; j++) {
                        const spotSize = (1 - j / SPOTS_PER_LEG * 0.8) * 24 * lengthRatio;
                        ctx.moveTo(spotPosition, 0);
                        ctx.arc(spotPosition, 0, spotSize, 0, TAU);
                        spotPosition += spotSize * 2 + lengthRatio * 5;
                    }
                    ctx.restore();
                }
                ctx.fillStyle = "#d3756b";
                ctx.fill();

                break;
            }

            case MobType.JELLYFISH: {
                scale = this.size / 20;

                ctx.scale(scale, scale);

                const oldGlobalAlpha = ctx.globalAlpha;
                ctx.strokeStyle = ctx.fillStyle = this.getSkinColor("#ffffff");
                ctx.globalAlpha = oldGlobalAlpha * 0.6;
                ctx.beginPath();
                for (let i = 0; i < 10; i++) {
                    const tentacleAngle = i / 10 * TAU;
                    ctx.save();
                    ctx.rotate(tentacleAngle);
                    ctx.translate(17.5, 0);
                    ctx.moveTo(0, 0);
                    const tentacleMoveWave = Math.sin(tentacleAngle + Date.now() / 500);
                    ctx.rotate(tentacleMoveWave * 0.5);
                    ctx.quadraticCurveTo(4, tentacleMoveWave * -2, 14, 0);
                    ctx.restore();
                }
                ctx.lineCap = "round";
                ctx.lineWidth = 2.3;
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(0, 0, 20, 0, TAU);
                ctx.globalAlpha = oldGlobalAlpha * 0.5;
                ctx.fill();
                ctx.clip();
                ctx.lineWidth = 3;
                ctx.stroke();

                break;
            }

            case MobType.BEETLE: {
                scale = this.size / 40;

                ctx.scale(scale, scale);

                // Draw horn
                {
                    ctx.fillStyle = ctx.strokeStyle = this.getSkinColor("#333333");
                    ctx.lineCap = ctx.lineJoin = "round";
                    for (let i = 0; i < 2; i++) {
                        const relative = i === 0 ? 1 : -1;
                        ctx.save();
                        // Maybe relative * 10 better
                        ctx.translate(34, relative * 12);
                        ctx.rotate(Math.sin(this.moveCounter * 1.24) * 0.1 * relative);
                        ctx.beginPath();
                        ctx.moveTo(0, relative * 7);
                        ctx.quadraticCurveTo(25, relative * 16, 40, 0);
                        ctx.quadraticCurveTo(20, relative * 6, 0, 0);
                        ctx.closePath();
                        ctx.fill();
                        ctx.stroke();
                        ctx.restore();
                    }
                }

                {
                    ctx.lineWidth = 7;

                    const skinColor = this.isPet ? "#ffe667" : "#8f5db0";
                    ctx.fillStyle = this.getSkinColor(skinColor);
                    ctx.fill(beetleBodyPath);
                    // Arc points are same color with this
                    ctx.fillStyle = ctx.strokeStyle = this.getSkinColor(darkend(skinColor, DARKEND_BASE));
                    ctx.stroke(beetleBodyPath);
                }

                ctx.lineWidth = 6;

                // Draw center line
                ctx.beginPath();
                ctx.moveTo(-21, 0);
                ctx.quadraticCurveTo(0, -3, 21, 0);
                ctx.lineCap = "round";
                ctx.stroke();

                const arcPoints = [[-17, -12], [17, -12], [0, -15]];

                ctx.beginPath();
                for (let i = 0; i < 2; i++) {
                    const relative = i === 1 ? 1 : -1;
                    for (let j = 0; j < arcPoints.length; j++) {
                        let [x, y] = arcPoints[j];
                        y *= relative;
                        ctx.moveTo(x, y);
                        ctx.arc(x, y, 5, 0, TAU);
                    }
                }
                ctx.fill();

                ctx.fill();

                break;
            }

            case PetalType.BASIC: {
                drawBasicLike("#ffffff", "#cfcfcf");

                break;
            }

            case PetalType.FASTER: {
                drawBasicLike("#feffc9", "#cecfa3");

                break;
            }

            case PetalType.BEETLE_EGG: {
                scale = this.size / 20;

                ctx.scale(scale, scale);

                ctx.beginPath();
                ctx.ellipse(0, 0, 30, 40, 0, 0, TAU);
                const eggColor = ["#fff0b8", "#cfc295"];
                ctx.fillStyle = this.getSkinColor(eggColor[0]);
                ctx.fill();
                ctx.strokeStyle = this.getSkinColor(eggColor[1]);
                ctx.stroke();

                break;
            }

            case PetalType.BUBBLE: {
                this.drawBubble(ctx, true);

                break;
            }
            case MobType.BUBBLE: {
                this.drawBubble(ctx, false);

                break;
            }

            case MobType.CENTIPEDE:
            case MobType.CENTIPEDE_DESERT:
            case MobType.CENTIPEDE_EVIL: {
                scale = this.size / 40;

                ctx.scale(scale, scale);

                ctx.beginPath();
                for (let i = 0; i < 2; i++) {
                    ctx.save();
                    ctx.scale(1, i * 2 - 1);
                    ctx.translate(0, -3);
                    ctx.arc(0, 36, 18, 0, TAU);
                    ctx.restore();
                }
                ctx.lineWidth = 7;
                ctx.lineJoin = ctx.lineCap = "round";
                ctx.strokeStyle = ctx.fillStyle = this.getSkinColor("#333333");
                ctx.fill();

                let bodyColor: ColorCode;
                if (this.type === MobType.CENTIPEDE_DESERT) {
                    bodyColor = "#d3c66d";
                } else if (this.type === MobType.CENTIPEDE_EVIL) {
                    bodyColor = "#8f5db0";
                } else {
                    bodyColor = "#8ac255";
                }

                ctx.beginPath();
                ctx.arc(0, 0, 40, 0, TAU);
                ctx.fillStyle = this.getSkinColor(bodyColor);
                ctx.fill();
                ctx.lineWidth = 8;
                ctx.strokeStyle = this.getSkinColor(darkend(bodyColor, DARKEND_BASE));
                ctx.stroke();

                // Antennas
                if (this.isFirstSegment) {
                    const acolor = this.getSkinColor("#333333");

                    ctx.strokeStyle = acolor;
                    ctx.fillStyle = acolor;
                    ctx.lineWidth = 3;
                    for (let dir = -1; dir <= 1; dir += 2) {
                        ctx.beginPath();
                        ctx.moveTo(25, 10.21 * dir);
                        ctx.quadraticCurveTo(47.54, 11.62 * dir, 55.28, 30.63 * dir);
                        ctx.stroke()

                        ctx.beginPath();
                        ctx.arc(55.28, 30.63 * dir, 5, 0, TAU);
                        ctx.fill();
                    }
                }

                break;
            }

            case PetalType.YIN_YANG: {
                scale = this.size / 20;

                ctx.scale(scale, scale);

                const clipFill = (us: ColorCode, ut: ColorCode) => {
                    ctx.save();
                    ctx.clip();
                    ctx.lineCap = "round";
                    ctx.fillStyle = this.getSkinColor(us);
                    ctx.strokeStyle = this.getSkinColor(ut);
                    ctx.fill();
                    ctx.stroke();
                    ctx.restore();
                };

                ctx.lineCap = "round";
                ctx.beginPath();
                ctx.arc(0, 0, 20, 0, TAU);
                clipFill("#333333", "#222222");
                ctx.rotate(Math.PI);
                ctx.beginPath();
                ctx.arc(0, 0, 20, -Math.PI / 2, Math.PI / 2);
                ctx.arc(0, 10, 10, Math.PI / 2, Math.PI * 3 / 2);
                ctx.arc(0, -10, 10, Math.PI / 2, Math.PI * 3 / 2, true);
                clipFill("#ffffff", "#cfcfcf");
                ctx.rotate(-Math.PI);
                ctx.beginPath();
                ctx.arc(0, 10, 10, Math.PI / 2, Math.PI * 3 / 2);
                clipFill("#333333", "#222222");

                break;
            }
        }

        ctx.restore();
    }

    drawBubble(ctx: CanvasRenderingContext2D, isPetal: boolean) {
        const scale = this.size / 15;

        ctx.scale(scale, scale);

        const oldGlobalAlpha = ctx.globalAlpha;
        ctx.strokeStyle = ctx.fillStyle = this.getSkinColor("#ffffff");
        ctx.globalAlpha = oldGlobalAlpha * 0.4;

        ctx.save();
        ctx.beginPath();
        ctx.lineWidth = 5;
        ctx.lineJoin = ctx.lineCap = "round";
        ctx.arc(10, 0, 2, 0, TAU);
        ctx.stroke();
        ctx.closePath();
        ctx.restore();

        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, TAU);
        ctx.fill();
        ctx.clip();
        ctx.globalAlpha = oldGlobalAlpha * 0.5;
        ctx.lineWidth = isPetal ? 8 : 3;
        ctx.stroke();
    }
}