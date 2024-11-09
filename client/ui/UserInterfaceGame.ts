import { ARROW_START_DISTANCE, MOLECULE_SVG, SCROLL_UNFURLED_SVG, SWAP_BAG_SVG } from "../constants";
import EntityMob from "../entity/EntityMob";
import { players, selfId, mobs, scaleFactor, interpolatedMouseX, interpolatedMouseY } from "../main";
import TilesetManager from "../utils/WorldManager";
import { ComponentsSVGButton, ComponentsTextButton } from "./components/ComponentsButton";
import UserInterface from "./UserInterface";

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

export default class UserInterfaceGame extends UserInterface {
    backgroundEntities: Array<EntityMob>;
    worldManager: TilesetManager;
    tilesets: OffscreenCanvas[];

    constructor(canvas: HTMLCanvasElement) {
        super(canvas);
        this.initializeComponents();

        this.worldManager = new TilesetManager();
    }

    protected initializeComponents(): void { }

    public async onInit() {
        this.tilesets = await this.worldManager.generateTilesets("ocean");
    }

    public async onExit() { }

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

        this.worldManager.constructWorld(canvas, this.tilesets, 50, 250, selfPlayer.x, selfPlayer.y);

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

        if ("ocean" === "ocean") {
            ctx.save();

            ctx.globalCompositeOperation = "multiply";
            ctx.fillStyle = "#CCDBF2";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.restore();
        }

        drawMutableFunctions(canvas);

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