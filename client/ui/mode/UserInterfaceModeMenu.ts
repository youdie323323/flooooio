import { MOLECULE_SVG, SCROLL_UNFURLED_SVG, SWAP_BAG_SVG } from "../../constants";
import EntityMob from "../../entity/EntityMob";
import TilesetManager, { BIOME_TILESETS } from "../../utils/WorldManager";
import { ComponentButton, ComponentSVGButton, ComponentTextButton } from "../components/ComponentButton";
import UserInterface, { uiScaleFactor } from "../UserInterface";
import ComponentTextInput from "../components/ComponentTextInput.js";
import {  ws } from "../../main";
import { Biomes, Packet, PetalType, Rarities } from "../../../shared/enum";
import ComponentDynamicText from "../components/ComponentDynamicText";

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

    connectingText: ComponentDynamicText;
    loggingInText: ComponentDynamicText;

    playableButtons: ComponentButton[];

    connectingTextLoaded: boolean = false;
    loggingInTextLoadded: boolean = false;
    playableButtonsLoaded: boolean = false;

    constructor(canvas: HTMLCanvasElement) {
        super(canvas);

        this.lastBackgroundEntitySpawn = Date.now();

        this.worldManager = new TilesetManager();

        this.backgroundX = 0;
        this.backgroundY = 0;
        this.backgroundWaveStep = 0;

        setTimeout(() => {
            this.connectingText.setVisible(true, true);
            this.connectingTextLoaded = true;
            setTimeout(() => {
                this.connectingText.setVisible(false, true);
                setTimeout(() => {
                    this.loggingInText.setVisible(true, true);
                    this.loggingInTextLoadded = true;
                    this.connectingTextLoaded = false;
                    setTimeout(() => {
                        this.loggingInText.setVisible(false, true);
                        this.loggingInTextLoadded = false;
                        setTimeout(() => {
                            this.playableButtonsLoaded = true;

                            this.playableButtons.forEach((b) => {
                                b.setVisible(true, true);
                            });
                        }, 250);
                    }, 2000);
                }, 250);
            }, 2000);
        }, 1);
    }

    handleKeyDown(event: KeyboardEvent): void { }

    protected initializeComponents(): void {
        const widthRelative = this.canvas.width / uiScaleFactor;
        const heightRelative = this.canvas.height / uiScaleFactor;

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

        this.playableButtons = [];

        const readyButton = new ComponentTextButton(
            {
                x: (widthRelative / 2) - 90 / 2,
                y: ((heightRelative / 2) - 40 * 3),
                w: 90,
                h: 30,
            },
            "#1dd129",
            async () => {
                ws.send(new Uint8Array([Packet.WAVE_ROOM_CHANGE_READY, 1]));
            },
            "Ready"
        );

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
                ws.send(new Uint8Array([Packet.WAVE_ROOM_JOIN, code.length, ...new TextEncoder().encode(code)]));
            },
            "Join squad"
        );

        const joinPublicSquadButton = new ComponentTextButton(
            {
                x: (widthRelative / 2) - 90 / 2,
                y: ((heightRelative / 2) - 40 * 3) + 40 + 40,
                w: 90,
                h: 30,
            },
            "#1dd129",
            async () => {
                ws.send(new Uint8Array([Packet.WAVE_ROOM_JOIN_PUBLIC, Biomes.DESERT]));
            },
            "Join public squad"
        );

        const leaveSquadButton = new ComponentTextButton(
            {
                x: (widthRelative / 2) - 90 / 2,
                y: ((heightRelative / 2) - 40 * 3) + 40 + 40 + 40,
                w: 90,
                h: 30,
            },
            "#1dd129",
            async () => {
                ws.send(new Uint8Array([Packet.WAVE_ROOM_LEAVE]));
            },
            "Leave squad"
        );

        const createPublicButton = new ComponentTextButton(
            {
                x: (widthRelative / 2) - 90 / 2,
                y: ((heightRelative / 2) - 40 * 3) + 40 + 40 + 40 + 40,
                w: 90,
                h: 30,
            },
            "#1dd129",
            async () => {
                ws.send(new Uint8Array([Packet.WAVE_ROOM_CREATE, Biomes.DESERT]));
            },
            "Create public"
        );

        const setPublicButton = new ComponentTextButton(
            {
                x: (widthRelative / 2) - 90 / 2,
                y: ((heightRelative / 2) - 40 * 3) + 40 + 40 + 40 + 40 + 40,
                w: 90,
                h: 30,
            },
            "#1dd129",
            async () => {
                ws.send(new Uint8Array([Packet.WAVE_ROOM_CHANGE_VISIBLE, 1]));
            },
            "Set public"
        );

        const setPrivateButton = new ComponentTextButton(
            {
                x: (widthRelative / 2) - 90 / 2,
                y: ((heightRelative / 2) - 40 * 3) + 40 + 40 + 40 + 40 + 40 + 40,
                w: 90,
                h: 30,
            },
            "#1dd129",
            async () => {
                ws.send(new Uint8Array([Packet.WAVE_ROOM_CHANGE_VISIBLE, 0]));
            },
            "Set private"
        );

        this.playableButtons.push(readyButton);
        this.playableButtons.push(joinSquadButton);
        this.playableButtons.push(joinPublicSquadButton);
        this.playableButtons.push(leaveSquadButton);
        this.playableButtons.push(createPublicButton);
        this.playableButtons.push(setPublicButton);
        this.playableButtons.push(setPrivateButton);

        this.playableButtons.forEach(b => b.setVisible(this.playableButtonsLoaded));

        this.addComponent(readyButton);
        this.addComponent(joinSquadButton);
        this.addComponent(joinPublicSquadButton);
        this.addComponent(leaveSquadButton);
        this.addComponent(createPublicButton);
        this.addComponent(setPrivateButton);
        this.addComponent(setPublicButton);

        // Text
        this.connectingText = new ComponentDynamicText(
            {
                x: (widthRelative / 2) - (200 / 2),
                y: (heightRelative / 2) - (40 / 2),
                w: 200,
                h: 40,
            },
            "Connecting...",
            30,
        );

        this.connectingText.setVisible(this.connectingTextLoaded);

        this.addComponent(this.connectingText);

        this.loggingInText = new ComponentDynamicText(
            {
                x: (widthRelative / 2) - (200 / 2),
                y: (heightRelative / 2) - (40 / 2),
                w: 200,
                h: 40,
            },
            "Logging in...",
            30,
        );

        this.loggingInText.setVisible(this.loggingInTextLoadded);

        this.addComponent(this.loggingInText);

        const gameNameText = new ComponentDynamicText(
            {
                x: (widthRelative / 2) - (250 / 2),
                y: (heightRelative / 2) - (80 / 2) - 40,
                w: 250,
                h: 80,
            },
            "floooo.io",
            54,
        );

        gameNameText.addCollidableComponents([this.connectingText, this.loggingInText]);
        gameNameText.addCollidableComponents(this.playableButtons);

        this.addComponent(gameNameText);
    }

    private generateBackgroundEntity3D() {
        return {
            x: 0,
            y: randomFloat(-200, (this.canvas.height / uiScaleFactor) + 100),
            z: randomFloat(0.7, 2),
            waveStep: Math.random() + 360,
        }
    }

    public animationFrame() {
        const canvas = this.canvas;
        const ctx = canvas.getContext("2d");

        const widthRelative = this.canvas.width / uiScaleFactor;
        const heightRelative = this.canvas.height / uiScaleFactor;

        this.worldManager.renderMapMenu(canvas, BIOME_TILESETS.get(this.biome), this.backgroundX, this.backgroundY);

        this.backgroundX += 0.4;
        this.backgroundY += Math.sin(this.backgroundWaveStep / 20) * 0.4;
        this.backgroundWaveStep += 0.07;

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

        if (this.biome === Biomes.OCEAN) {
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

    set biome(biome: Biomes) {
        menuUiCurrentBiome = biome;
    }

    get biome(): Biomes {
        return menuUiCurrentBiome;
    }
}