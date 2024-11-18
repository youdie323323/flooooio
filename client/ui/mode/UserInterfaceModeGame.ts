import { ARROW_START_DISTANCE, CROSS_ICON_SVG, MOLECULE_SVG, SCROLL_UNFURLED_SVG, SWAP_BAG_SVG } from "../../constants";
import EntityMob from "../../entity/EntityMob";
import { players, mobs, scaleFactor, interpolatedMouseX, interpolatedMouseY, deltaTime, ws, uiManager } from "../../main";
import TilesetManager, { BIOME_TILESETS } from "../../common/WorldManager";
import { ComponentButton, ComponentSVGButton, ComponentTextButton } from "../components/ComponentButton";
import UserInterface from "../UserInterface";
import { selfId } from "../../Networking";
import { Biomes } from "../../../shared/biomes";
import { PacketKind } from "../../../shared/packet";

function drawMutableFunctions(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    const selfPlayer = players.get(selfId);
    if (selfPlayer && !selfPlayer.isDead) {
        ctx.save();

        const adjustedScaleFactor = scaleFactor * devicePixelRatio;

        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(Math.atan2(interpolatedMouseY, interpolatedMouseX));
        ctx.scale(adjustedScaleFactor, adjustedScaleFactor);

        const distance = Math.hypot(interpolatedMouseX, interpolatedMouseY) / scaleFactor;

        ctx.beginPath();
        ctx.moveTo(ARROW_START_DISTANCE, 0);
        ctx.lineTo(distance, 0);
        ctx.lineTo(distance - 24, -18);
        ctx.moveTo(distance, 0);
        ctx.lineTo(distance - 24, 18);

        ctx.lineWidth = 12;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.globalAlpha = distance < 110 ? Math.max(distance - 60, 0) / 50 : 1;
        ctx.strokeStyle = "rgba(0,0,0,0.2)";
        ctx.stroke();

        ctx.restore();
    }
}

/**
 * Calculate wave length.
 * 
 * @param x - Wave progress, number.
 */
export function calculateWaveLength(x: number) {
    return Math.max(60, x ** 0.2 * 18.9287 + 30)
}

export default class UserInterfaceGame extends UserInterface {
    private worldManager: TilesetManager;

    public updateT: number;
    public t: number;

    public waveProgress: number;

    public waveProgressTimer: number;
    public waveProgressRedGageTimer: number;
    public oWaveProgressTimer: number;
    public oWaveProgressRedGageTimer: number;
    public nWaveProgressTimer: number;
    public nWaveProgressRedGageTimer: number;

    public worldSize: number;
    public oWorldSize: number;
    public nWorldSize: number;

    public isDeadMenuContinued: boolean;

    public biome: Biomes = Biomes.GARDEN;

    constructor(canvas: HTMLCanvasElement) {
        super(canvas);

        this.worldManager = new TilesetManager();

        this.waveProgress = 0;

        this.updateT = 0;

        this.waveProgressTimer = this.waveProgressRedGageTimer = this.worldSize = 0;
        this.oWaveProgressTimer = this.oWaveProgressRedGageTimer = this.oWorldSize = 0;
        this.nWaveProgressTimer = this.nWaveProgressRedGageTimer = this.nWorldSize = 0;

        this.isDeadMenuContinued = false;
    }

    protected initializeComponents(): void {
        const exitButton = new ComponentSVGButton(
            {
                x: "0.5%",
                y: "1%",
                width: 50,
                height: 50,
            },
            "#b04c5e",
            () => {
                ws.send(new Uint8Array([PacketKind.WAVE_ROOM_GAME_LEAVE]));
                uiManager.switchUI("menu");
            },
            CROSS_ICON_SVG,
        );

        this.addComponent(exitButton);
    }

    public animationFrame() {
        // Interpolate
        {
            this.updateT += deltaTime / 100;
            this.t = Math.min(1, this.updateT);

            this.waveProgressTimer = this.oWaveProgressTimer + (this.nWaveProgressTimer - this.oWaveProgressTimer) * this.t;
            this.waveProgressRedGageTimer = this.oWaveProgressRedGageTimer + (this.nWaveProgressRedGageTimer - this.oWaveProgressRedGageTimer) * this.t;
            this.worldSize = this.oWorldSize + (this.nWorldSize - this.oWorldSize) * this.t;
        }

        const canvas = this.canvas;
        const ctx = canvas.getContext("2d");

        const selfPlayer = players.get(selfId);
        if (!selfPlayer) {
            return;
        }

        for (const mob of mobs.values()) {
            mob.update();
        }

        for (const player of players.values()) {
            player.update();
        }

        this.worldManager.constructWorld(canvas, BIOME_TILESETS.get(this.biome), this.worldSize, selfPlayer.x, selfPlayer.y);

        ctx.save();

        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.scale(scaleFactor, scaleFactor);
        ctx.translate(-selfPlayer.x, -selfPlayer.y);

        mobs.forEach((v, k) => {
            v.draw(ctx);
            if (v.isDead && v.deadT > 1) {
                mobs.delete(k);
            }
        });

        players.forEach((v, k) => {
            v.draw(ctx);
        });

        ctx.restore();

        if (this.biome === Biomes.OCEAN) {
            ctx.save();

            ctx.globalCompositeOperation = "multiply";
            ctx.fillStyle = "#CCDBF2";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.restore();
        }

        drawMutableFunctions(canvas);

        {
            ctx.save();

            const centerWidth = canvas.width / 2;

            const WAVE_PROGRESS_BAR_LENGTH = 135;
            const WAVE_PROGRESS_BAR_Y = 104;

            {
                const MAX_SPAWN_TIME = calculateWaveLength(this.waveProgress);

                ctx.globalAlpha = 0.9;

                ctx.save();

                ctx.lineWidth = 25;
                ctx.lineCap = "round";
                ctx.strokeStyle = "black";
                ctx.beginPath();
                ctx.lineTo(centerWidth - WAVE_PROGRESS_BAR_LENGTH, WAVE_PROGRESS_BAR_Y);
                ctx.lineTo(centerWidth + WAVE_PROGRESS_BAR_LENGTH, WAVE_PROGRESS_BAR_Y);
                ctx.stroke();

                ctx.restore();

                ctx.save();

                ctx.lineWidth = Math.min((this.waveProgressTimer / MAX_SPAWN_TIME) * (MAX_SPAWN_TIME * 16.6666), 18.5);
                ctx.lineCap = "round";
                ctx.strokeStyle = "#6dbd7f";
                ctx.beginPath();
                ctx.lineTo(centerWidth - WAVE_PROGRESS_BAR_LENGTH, WAVE_PROGRESS_BAR_Y);
                ctx.lineTo(centerWidth - WAVE_PROGRESS_BAR_LENGTH + (WAVE_PROGRESS_BAR_LENGTH * 2) * (this.waveProgressTimer / MAX_SPAWN_TIME), WAVE_PROGRESS_BAR_Y);
                ctx.stroke();

                ctx.restore();

                ctx.save();

                ctx.lineWidth = Math.min((this.waveProgressRedGageTimer / MAX_SPAWN_TIME) * (MAX_SPAWN_TIME * 16.6666), 15);
                ctx.lineCap = "round";
                ctx.strokeStyle = "#e32933";
                ctx.beginPath();
                ctx.lineTo(centerWidth - WAVE_PROGRESS_BAR_LENGTH, WAVE_PROGRESS_BAR_Y);
                ctx.lineTo(centerWidth - WAVE_PROGRESS_BAR_LENGTH + (WAVE_PROGRESS_BAR_LENGTH * 2) * (this.waveProgressRedGageTimer / MAX_SPAWN_TIME), WAVE_PROGRESS_BAR_Y);
                ctx.stroke();

                ctx.restore();
            }

            ctx.font = "1em Ubuntu, sans-serif";
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#000000';
            ctx.strokeText("Wave " + this.waveProgress, centerWidth, WAVE_PROGRESS_BAR_Y);
            ctx.fillStyle = "white";
            ctx.fillText("Wave " + this.waveProgress, centerWidth, WAVE_PROGRESS_BAR_Y);

            ctx.restore();
        }

        {
            ctx.save();

            const centerWidth = canvas.width / 2;

            const _biomeText = Biomes[this.biome].toLocaleLowerCase();
            const biomeText = _biomeText[0].toUpperCase() + _biomeText.slice(1);

            ctx.font = "2em Ubuntu, sans-serif";
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            ctx.lineWidth = 4;
            ctx.strokeStyle = '#000000';
            ctx.strokeText(biomeText, centerWidth, 68);
            ctx.fillStyle = "white";
            ctx.fillText(biomeText, centerWidth, 68);

            ctx.restore();
        }

        // Dead menu
        {
            if (selfPlayer.isDead) {
                ctx.save();

                if (!this.isDeadMenuContinued) {
                    {
                        ctx.save();

                        ctx.globalAlpha = 0.2;
                        ctx.fillStyle = 'black';
                        ctx.fillRect(0, 0, canvas.width, canvas.height);

                        ctx.restore();
                    }

                    {

                        ctx.save();

                        ctx.translate(canvas.width / 2, canvas.height / 2);

                        ctx.textBaseline = 'middle';
                        ctx.textAlign = 'center';
                        ctx.strokeStyle = '#000000';
                        ctx.fillStyle = "white";

                        ctx.font = "18px Ubuntu, sans-serif";
                        ctx.lineWidth = 3;

                        ctx.strokeText("You were destroyed by:", 0, 0);
                        ctx.fillText("You were destroyed by:", 0, 0);

                        ctx.font = "25px Ubuntu, sans-serif";
                        ctx.lineWidth = 3;

                        ctx.strokeText("Solider Ant", 0, 35);
                        ctx.fillText("Solider Ant", 0, 35);

                        ctx.restore();
                    }
                }

                ctx.restore();
            }
        }

        this.render();
    }

    public cleanup(): void {
        this.worldManager = undefined;
    }
}