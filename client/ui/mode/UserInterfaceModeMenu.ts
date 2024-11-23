import { Biomes } from "../../../shared/biomes";
import { PacketKind } from "../../../shared/packet";
import { Rarities } from "../../../shared/rarities";
import { PetalType } from "../../../shared/types";
import { MOLECULE_SVG, SCROLL_UNFURLED_SVG, SWAP_BAG_SVG } from "../../constants";
import EntityMob from "../../entity/EntityMob";
import TilesetManager, { BIOME_TILESETS } from "../../utils/WorldManager";
import { ComponentSVGButton, ComponentTextButton } from "../components/ComponentButton";
import UserInterface from "../UserInterface";
import ComponentTextInput from "../components/ComponentTextInput.js";
import { scaleFactor, ws } from "../../main";

function randomFloat(min: number, max: number) {
    return Math.random() * (max - min + 1) + min;
}

let backgroundEntities: Set<{
    x: number;
    y: number;
    z: number;
    waveStep: number;
    entity: EntityMob;
}> = new Set();

/**
 * Current ui of menu.
 * 
 * @remarks
 * 
 * To store biome when ui switched.
 */
let menuUiCurrentBiome: Biomes = Biomes.GARDEN;

export default class UserInterfaceMenu extends UserInterface {
    lastBackgroundEntitySpawn: number;

    worldManager: TilesetManager;

    backgroundX: number;
    backgroundY: number;
    backgroundWaveStep: number;

    constructor(canvas: HTMLCanvasElement) {
        super(canvas);

        this.lastBackgroundEntitySpawn = Date.now();

        this.worldManager = new TilesetManager();

        this.backgroundX = 0;
        this.backgroundY = 0;
        this.backgroundWaveStep = 0;
    }

    handleKeyDown(event: KeyboardEvent): void { }

    protected initializeComponents(): void {
        const widthRelative = this.canvas.width / scaleFactor;
        const heightRelative = this.canvas.height / scaleFactor;

        const bagButton = new ComponentSVGButton(
            {
                x: 15,
                y: heightRelative - 229,
                w: 45,
                h: 45,
            },
            "#599dd8",
            () => {
                console.log("called")
            },
            SWAP_BAG_SVG
        );

        this.addComponent(bagButton);

        const craftButton = new ComponentSVGButton(
            {
                x: 15,
                y: heightRelative - 173,
                w: 45,
                h: 45,
            },
            "#db9d5a",
            () => {
                console.log("called")
            },
            MOLECULE_SVG
        );

        this.addComponent(craftButton);

        const changelogButton = new ComponentSVGButton(
            {
                x: 15,
                y: heightRelative - 116,
                w: 45,
                h: 45,
            },
            "#9bb56b",
            () => {
                console.log("called")
            },
            SCROLL_UNFURLED_SVG
        );

        this.addComponent(changelogButton);

        // Squad

        const readyButton = new ComponentTextButton(
            {
                x: (widthRelative / 2) - 90 / 2,
                y: ((heightRelative / 2) - 40 * 3),
                w: 90,
                h: 30,
            },
            "#1dd129",
            async () => {
                ws.send(new Uint8Array([PacketKind.WAVE_ROOM_CHANGE_READY, 1]));
            },
            "Ready"
        );

        this.addComponent(readyButton);

        const joinSquadButton = new ComponentTextButton(
            {
                x: (widthRelative / 2) - 90 / 2,
                y: ((heightRelative / 2) - 40 * 3) + 40,
                w: 90,
                h: 30,
            },
            "#1dd129",
            async () => {
                const code = prompt("Enter squad code");
                if (!code) {
                    return;
                }
                ws.send(new Uint8Array([PacketKind.WAVE_ROOM_JOIN, code.length, ...new TextEncoder().encode(code)]));
            },
            "Join squad"
        );

        this.addComponent(joinSquadButton);

        const joinPublicSquadButton = new ComponentTextButton(
            {
                x: (widthRelative / 2) - 90 / 2,
                y: ((heightRelative / 2) - 40 * 3) + 40 + 40,
                w: 90,
                h: 30,
            },
            "#1dd129",
            async () => {
                ws.send(new Uint8Array([PacketKind.WAVE_ROOM_JOIN_PUBLIC, Biomes.DESERT]));
            },
            "Join public squad"
        );

        this.addComponent(joinPublicSquadButton);

        const leaveSquadButton = new ComponentTextButton(
            {
                x: (widthRelative / 2) - 90 / 2,
                y: ((heightRelative / 2) - 40 * 3) + 40 + 40 + 40,
                w: 90,
                h: 30,
            },
            "#1dd129",
            async () => {
                ws.send(new Uint8Array([PacketKind.WAVE_ROOM_LEAVE]));
            },
            "Leave squad"
        );

        this.addComponent(leaveSquadButton);

        const createPublicButton = new ComponentTextButton(
            {
                x: (widthRelative / 2) - 90 / 2,
                y: ((heightRelative / 2) - 40 * 3) + 40 + 40 + 40 + 40,
                w: 90,
                h: 30,
            },
            "#1dd129",
            async () => {
                ws.send(new Uint8Array([PacketKind.WAVE_ROOM_CREATE, Biomes.DESERT]));
            },
            "Create public"
        );

        this.addComponent(createPublicButton);

        const setPublicButton = new ComponentTextButton(
            {
                x: (widthRelative / 2) - 90 / 2,
                y: ((heightRelative / 2) - 40 * 3) + 40 + 40 + 40 + 40 + 40,
                w: 90,
                h: 30,
            },
            "#1dd129",
            async () => {
                ws.send(new Uint8Array([PacketKind.WAVE_ROOM_CHANGE_VISIBLE, 1]));
            },
            "Set public"
        );

        this.addComponent(setPublicButton);

        const setPrivateButton = new ComponentTextButton(
            {
                x: (widthRelative / 2) - 90 / 2,
                y: ((heightRelative / 2) - 40 * 3) + 40 + 40 + 40 + 40 + 40 + 40,
                w: 90,
                h: 30,
            },
            "#1dd129",
            async () => {
                ws.send(new Uint8Array([PacketKind.WAVE_ROOM_CHANGE_VISIBLE, 0]));
            },
            "Set private"
        );

        this.addComponent(setPrivateButton);
    }

    private generateBackgroundEntity3D() {
        return {
            x: 0,
            y: randomFloat(-200, (this.canvas.height / scaleFactor) + 100),
            z: randomFloat(0.8, 2.25),
            waveStep: Math.random() + 360,
        }
    }

    public animationFrame() {
        const canvas = this.canvas;
        const ctx = canvas.getContext("2d");

        const widthRelative = this.canvas.width / scaleFactor;
        const heightRelative = this.canvas.height / scaleFactor;

        this.worldManager.constructWorldMenu(canvas, BIOME_TILESETS.get(menuUiCurrentBiome), this.backgroundX, this.backgroundY);

        this.backgroundX += 0.3;
        this.backgroundY += Math.sin(this.backgroundWaveStep / 20) * 0.3;
        this.backgroundWaveStep += 0.1;

        backgroundEntities.forEach((v) => {
            if (v.x > widthRelative) {
                backgroundEntities.delete(v);
            }
        });

        if (Date.now() - this.lastBackgroundEntitySpawn > 200) {
            const param = this.generateBackgroundEntity3D();
            backgroundEntities.add({
                ...param,
                entity: new EntityMob(-1, PetalType.BASIC, Rarities.COMMON, param.x, param.y, param.z * 5, 1, 1, 0, false)
            });
            this.lastBackgroundEntitySpawn = Date.now();
        }

        Array.from(backgroundEntities.values()).sort((a, b) => a.z + b.z).forEach(v => {
            v.entity.draw(ctx);

            v.entity.x += v.z * 0.3;
            v.entity.y += Math.sin(v.waveStep / 20) * 0.2;

            v.waveStep += 0.1;
        });

        this.render();

        if (menuUiCurrentBiome === Biomes.OCEAN) {
            ctx.save();

            ctx.globalCompositeOperation = "multiply";
            ctx.fillStyle = "#CCDBF2";
            ctx.fillRect(0, 0, widthRelative, heightRelative);

            ctx.restore();
        }
    }

    public cleanup(): void {
        this.worldManager = undefined;
    }

    public setBiome(biome: Biomes) {
        menuUiCurrentBiome = biome;
    }
}