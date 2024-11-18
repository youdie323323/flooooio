import { Biomes } from "../../../shared/biomes";
import { PacketKind } from "../../../shared/packet";
import { Rarities } from "../../../shared/rarities";
import { PetalType } from "../../../shared/types";
import { MOLECULE_SVG, SCROLL_UNFURLED_SVG, SWAP_BAG_SVG } from "../../constants";
import EntityMob from "../../entity/EntityMob";
import TilesetManager, { BIOME_TILESETS } from "../../common/WorldManager";
import { ComponentsSVGButton, ComponentsTextButton } from "../components/ComponentButton";
import UserInterface from "../UserInterface";
import { ws } from "../../main";

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
    backgroundX: number;
    backgroundY: number;
    backgroundWaveStep: number;

    constructor(canvas: HTMLCanvasElement) {
        super(canvas);

        this.backgroundEntities = new Set();
        this.lastBackgroundPetalSpawn = Date.now();
        this.worldManager = new TilesetManager();
        this.backgroundX = 0;
        this.backgroundY = 0;
        this.backgroundWaveStep = 0;
    }

    protected initializeComponents(): void {
        const bagButton = new ComponentsSVGButton(
            {
                xPercent: 0.01,
                yPercent: 0.795 - 0.1 - 0.1,
                heightPercent: 0.08,
                widthPercent: 0.08,
            },
            "#599dd8",
            () => {
                console.log("called")
            },
            SWAP_BAG_SVG
        );

        this.addComponent(bagButton);

        const craftButton = new ComponentsSVGButton(
            {
                xPercent: 0.01,
                yPercent: 0.795 - 0.1,
                heightPercent: 0.08,
                widthPercent: 0.08,
            },
            "#db9d5a",
            () => {
                console.log("called")
            },
            MOLECULE_SVG
        );

        this.addComponent(craftButton);

        const changelogButton = new ComponentsSVGButton(
            {
                xPercent: 0.01,
                yPercent: 0.795,
                heightPercent: 0.08,
                widthPercent: 0.08,
            },
            "#9bb56b",
            () => {
                console.log("called")
            },
            SCROLL_UNFURLED_SVG
        );

        this.addComponent(changelogButton);

        // Squad

        const base = 0.44;
        const baseOffset = 0.06;

        const readyButton = new ComponentsTextButton(
            {
                xPercent: 0.4725,
                yPercent: base,
                widthPercent: 0.12,
                aspectRatio: 2.5
            },
            "#1dd129",
            async () => {
                ws.send(new Uint8Array([PacketKind.WAVE_ROOM_CHANGE_READY, 1]));
            },
            "Ready"
        );

        this.addComponent(readyButton);

        const joinSquadButton = new ComponentsTextButton(
            {
                xPercent: 0.4725,
                yPercent: base + baseOffset,
                widthPercent: 0.12,
                aspectRatio: 2.5
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

        const joinPublicSquadButton = new ComponentsTextButton(
            {
                xPercent: 0.4725,
                yPercent: base + baseOffset + baseOffset,
                widthPercent: 0.12,
                aspectRatio: 2.5
            },
            "#1dd129",
            async () => {
                ws.send(new Uint8Array([PacketKind.WAVE_ROOM_JOIN_PUBLIC, Biomes.GARDEN]));
            },
            "Join public squad"
        );

        this.addComponent(joinPublicSquadButton);

        const leaveSquadButton = new ComponentsTextButton(
            {
                xPercent: 0.4725,
                yPercent: base + baseOffset + baseOffset + baseOffset,
                widthPercent: 0.12,
                aspectRatio: 2.5
            },
            "#1dd129",
            async () => {
                ws.send(new Uint8Array([PacketKind.WAVE_ROOM_LEAVE]));
            },
            "Leave squad"
        );

        this.addComponent(leaveSquadButton);

        const createPublicButton = new ComponentsTextButton(
            {
                xPercent: 0.4725,
                yPercent: base + baseOffset + baseOffset + baseOffset + baseOffset,
                widthPercent: 0.12,
                aspectRatio: 2.5
            },
            "#1dd129",
            async () => {
                ws.send(new Uint8Array([PacketKind.WAVE_ROOM_CREATE, Biomes.DESERT]));
            },
            "Create public"
        );

        this.addComponent(createPublicButton);

        const setPublicButton = new ComponentsTextButton(
            {
                xPercent: 0.4725,
                yPercent: base + baseOffset + baseOffset + baseOffset + baseOffset + baseOffset,
                widthPercent: 0.12,
                aspectRatio: 2.5
            },
            "#1dd129",
            async () => {
                ws.send(new Uint8Array([PacketKind.WAVE_ROOM_CHANGE_VISIBLE, 1]));
            },
            "Set public"
        );

        this.addComponent(setPublicButton);

        const setPrivateButton = new ComponentsTextButton(
            {
                xPercent: 0.4725,
                yPercent: base + baseOffset + baseOffset + baseOffset + baseOffset + baseOffset + baseOffset,
                widthPercent: 0.12,
                aspectRatio: 2.5
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
            y: randomFloat(-200, this.canvas.height + 100),
            z: randomFloat(0.8, 2.25),
            waveStep: Math.random() + 360,
        }
    }

    public animationFrame() {
        const canvas = this.canvas;
        const ctx = canvas.getContext("2d");

        this.worldManager.constructWorldMenu(canvas, BIOME_TILESETS.get(this.biome), this.backgroundX, this.backgroundY);

        this.backgroundX += 0.5;
        this.backgroundY += Math.sin(this.backgroundWaveStep / 20) * 0.5;
        this.backgroundWaveStep += 0.08;

        this.backgroundEntities.forEach((v) => {
            if (v.x > canvas.width) {
                this.backgroundEntities.delete(v);
            }
        });

        if (Date.now() - this.lastBackgroundPetalSpawn > 200) {
            const param = this.generateBackgroundEntity3D();
            this.backgroundEntities.add({
                ...param,
                entity: new EntityMob(-1, PetalType.BASIC, Rarities.COMMON, param.x, param.y, param.z * 12, 1, 1, 0, false)
            });
            this.lastBackgroundPetalSpawn = Date.now();
        }

        Array.from(this.backgroundEntities.values()).sort((a, b) => a.z + b.z).forEach(v => {
            v.entity.draw(ctx);

            v.entity.x += v.z * 0.6;
            v.entity.y += Math.sin(v.waveStep / 20) * 0.2;

            v.waveStep += 0.05;
        });

        this.render();

        if (this.biome === Biomes.OCEAN) {
            ctx.save();

            ctx.globalCompositeOperation = "multiply";
            ctx.fillStyle = "#CCDBF2";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.restore();
        }
    }

    public cleanup(): void {
        this.worldManager = undefined;
        this.backgroundEntities = undefined;
    }
}