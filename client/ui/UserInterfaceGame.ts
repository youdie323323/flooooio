import { ARROW_START_DISTANCE, MOLECULE_SVG, SCROLL_UNFURLED_SVG, SWAP_BAG_SVG } from "../constants";
import EntityMob from "../entity/EntityMob";
import { players, mobs, scaleFactor, interpolatedMouseX, interpolatedMouseY, deltaTime } from "../main";
import TilesetManager, { BIOME_TILESETS } from "../common/WorldManager";
import { ComponentsSVGButton, ComponentsTextButton } from "./components/ComponentButton";
import UserInterface from "./UserInterface";
import { selfId } from "../Networking";
import { Biomes } from "../../shared/biomes";

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
    public waveProgress: number;
    public waveProgressTimer: number;
    public waveProgressRedGageTimer: number;
    public oWaveProgressTimer: number;
    public oWaveProgressRedGageTimer: number;
    public nWaveProgressTimer: number;
    public nWaveProgressRedGageTimer: number;
    public updateT: number;
    public t: number;

    constructor(canvas: HTMLCanvasElement) {
        super(canvas);
        this.initializeComponents();

        this.worldManager = new TilesetManager();

        this.waveProgress = 0;
        this.waveProgressTimer = 0;
        this.waveProgressRedGageTimer = 0;
        this.oWaveProgressTimer = 0;
        this.oWaveProgressRedGageTimer = 0;
        this.nWaveProgressTimer = 0;
        this.nWaveProgressRedGageTimer = 0;
        this.updateT = 0;
    }

    protected initializeComponents(): void { }

    public animationFrame(callbackFn: () => void) {
        const canvas = this.canvas;
        const ctx = canvas.getContext("2d");

        const selfPlayer = players.get(selfId);
        if (!selfPlayer) {
            requestAnimationFrame(callbackFn);
            return;
        }

        for (const mob of mobs.values()) {
            mob.update();
        }

        for (const player of players.values()) {
            player.update();
        }

        this.worldManager.constructWorld(canvas, BIOME_TILESETS.get(this.biome), 50, 250, selfPlayer.x, selfPlayer.y);

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

            const WAVE_PROGRESS_BAR_LENGTH = 140;
            const WAVE_PROGRESS_BAR_Y = 100;

            // Interpolate
            this.updateT += deltaTime / 100;
            this.t = Math.min(1, this.updateT);
            this.waveProgressTimer = this.oWaveProgressTimer + (this.nWaveProgressTimer - this.oWaveProgressTimer) * this.t;
            this.waveProgressRedGageTimer = this.oWaveProgressRedGageTimer + (this.nWaveProgressRedGageTimer - this.oWaveProgressRedGageTimer) * this.t;

            {
                const MAX_SPAWN_TIME = calculateWaveLength(this.waveProgress);

                ctx.save();

                ctx.lineWidth = 24;
                ctx.lineCap = "round";
                ctx.strokeStyle = "black";
                ctx.beginPath();
                ctx.lineTo(centerWidth - WAVE_PROGRESS_BAR_LENGTH, WAVE_PROGRESS_BAR_Y);
                ctx.lineTo(centerWidth + WAVE_PROGRESS_BAR_LENGTH, WAVE_PROGRESS_BAR_Y);
                ctx.stroke();

                ctx.restore();

                ctx.save();

                ctx.lineWidth = Math.min((this.waveProgressTimer / MAX_SPAWN_TIME) * (MAX_SPAWN_TIME * 16.6666), 17.5);
                ctx.lineCap = "round";
                ctx.strokeStyle = "#62a972";
                ctx.beginPath();
                ctx.lineTo(centerWidth - WAVE_PROGRESS_BAR_LENGTH, WAVE_PROGRESS_BAR_Y);
                ctx.lineTo(centerWidth - WAVE_PROGRESS_BAR_LENGTH + (WAVE_PROGRESS_BAR_LENGTH * 2) * (this.waveProgressTimer / MAX_SPAWN_TIME), WAVE_PROGRESS_BAR_Y);
                ctx.stroke();

                ctx.restore();

                ctx.save();

                ctx.lineWidth = Math.min((this.waveProgressRedGageTimer / MAX_SPAWN_TIME) * (MAX_SPAWN_TIME * 16.6666), 14);
                ctx.lineCap = "round";
                ctx.strokeStyle = "#b0212b";
                ctx.beginPath();
                ctx.lineTo(centerWidth - WAVE_PROGRESS_BAR_LENGTH, WAVE_PROGRESS_BAR_Y);
                ctx.lineTo(centerWidth - WAVE_PROGRESS_BAR_LENGTH + (WAVE_PROGRESS_BAR_LENGTH * 2) * (this.waveProgressRedGageTimer / MAX_SPAWN_TIME), WAVE_PROGRESS_BAR_Y);
                ctx.stroke();

                ctx.restore();
            }

            ctx.font = "1em Ubuntu, sans-serif";
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            ctx.lineWidth = 4;
            ctx.strokeStyle = '#000000';
            ctx.strokeText("Wave " + this.waveProgress, centerWidth, WAVE_PROGRESS_BAR_Y);
            ctx.fillStyle = "white";
            ctx.fillText("Wave " + this.waveProgress, centerWidth, WAVE_PROGRESS_BAR_Y);

            ctx.restore();
        }

        ctx.save();

        if (selfPlayer.isDead) {
            ctx.globalAlpha = 0.2;
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.restore();

        this.render();

        requestAnimationFrame(callbackFn);
    }
}