import { generateId } from "../../server/entity/utils/small";
import { Rarities } from "../../shared/rarities";
import { PetalType } from "../../shared/types";
import { MOLECULE_SVG, SCROLL_UNFURLED_SVG, SWAP_BAG_SVG } from "../constants";
import EntityMob from "../entity/EntityMob";
import TilesetManager from "../utils/WorldManager";
import { ComponentsSVGButton, ComponentsTextButton } from "./components/ComponentsButton";
import UserInterface from "./UserInterface";

function randomFloat(min: number, max: number) {
    return Math.random() * (max - min + 1) + min;
}

export default class UserInterfaceMenu extends UserInterface {
    backgroundEntities: Set<{
        x: number;
        y: number;
        z: number;
        waveStep: number;
        entity: EntityMob;
    }>;
    lastBackgroundPetalSpawn: number;
    worldManager: TilesetManager;
    tilesets: OffscreenCanvas[];
    backgroundX: number;
    backgroundY: number;
    backgroundWaveStep: number;

    constructor(canvas: HTMLCanvasElement) {
        super(canvas);
        this.initializeComponents();

        this.backgroundEntities = new Set();
        this.lastBackgroundPetalSpawn = Date.now();
        this.worldManager = new TilesetManager();
        this.backgroundX = 0;
        this.backgroundY = 0;
        this.backgroundWaveStep = 0;
    }

    protected initializeComponents(): void {
        const UI_BUTTON_GAP: number = 136;

        const bagButton = new ComponentsSVGButton(
            35,
            802,
            110,
            110,
            "#599dd8",
            () => {
                console.log("called")
            },
            SWAP_BAG_SVG
        );

        this.addButton(bagButton);

        const craftButton = new ComponentsSVGButton(
            35,
            802 + UI_BUTTON_GAP,
            110,
            110,
            "#db9d5a",
            () => {
                console.log("called")
            },
            MOLECULE_SVG
        );

        this.addButton(craftButton);

        const changelogButton = new ComponentsSVGButton(
            35,
            802 + UI_BUTTON_GAP + UI_BUTTON_GAP,
            110,
            110,
            "#9bb56b",
            () => {
                console.log("called")
            },
            SCROLL_UNFURLED_SVG
        );

        this.addButton(changelogButton);

        const playButton = new ComponentsTextButton(
            (this.canvas.width / 2) - (180 / 2),
            (this.canvas.height / 2) - (70 / 2),
            180,
            70,
            "#1dd129",
            async () => {
                await this.uiManager.switchUI('game');
            },
            "Play"
        );

        this.addButton(playButton);
    }

    public async onInit() {
        this.tilesets = await this.worldManager.generateTilesets("ocean");
    }

    public async onExit() { }

    private generateBackgroundEntity3D() {
        return {
            x: 0,
            y: randomFloat(-200, this.canvas.height + 100),
            z: randomFloat(0.8, 2.25),
            waveStep: Math.random() + 360,
        }
    }

    public animationFrame(callbackFn: () => void) {
        const canvas = this.canvas;
        const ctx = canvas.getContext("2d");

        this.worldManager.constructWorldMenu(canvas, this.tilesets, "ocean", this.backgroundX, this.backgroundY);

        this.backgroundX += 0.5;
        this.backgroundY += Math.sin(this.backgroundWaveStep / 20) * 0.5;
        this.backgroundWaveStep += 0.075;

        this.backgroundEntities.forEach((v) => {
            if (v.x > canvas.width) {
                this.backgroundEntities.delete(v);
            }
        });

        if (Date.now() - this.lastBackgroundPetalSpawn > 200) {
            const param = this.generateBackgroundEntity3D();
            this.backgroundEntities.add({
                ...param,
                entity: new EntityMob(-1, PetalType.BASIC, Rarities.COMMON, param.x, param.y, param.z * 12, 1, 1, 0)
            });
            this.lastBackgroundPetalSpawn = Date.now();
        }

        Array.from(this.backgroundEntities.values()).sort((a, b) => a.z + b.z).forEach(v => {
            v.entity.draw(ctx);

            v.entity.x += v.z * 0.6;
            v.entity.y += Math.sin(v.waveStep / 20) * 0.5;

            v.waveStep += 0.075;
        });

        this.render();

        requestAnimationFrame(callbackFn);
    }
}