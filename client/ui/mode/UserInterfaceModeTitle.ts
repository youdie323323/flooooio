import EntityMob from "../../entity/EntityMob.js";
import TerrainGenerator, { BIOME_TILESETS } from "../../utils/TerrainGenerator.js";
import { Button, NormalButton, SVGButton, TextButton } from "../components/Button.js";
import UserInterface, { uiScaleFactor } from "../UserInterface.js";
import TextInput from "../components/TextInput.js";
import { ws } from "../../main.js";
import { Biomes, PetalType } from "../../../shared/enum.js";
import StaticText from "../components/Text.js";
import { Rarities } from "../../../shared/rarity.js";
import { ServerBound } from "../../../shared/packet.js";
import ExtensionCollidable from "../components/extensions/ExtensionCollidable.js";
import { CoordinatedSpace, StaticContainer, StaticHContainer, StaticPanelContainer, StaticSpace, StaticVContainer } from "../components/Container.js";
import { Component } from "../components/Component.js";
import { CROSS_ICON_SVG } from "./UserInterfaceModeGame.js";
import { WaveRoomState, WaveRoomVisibleState } from "../../../shared/waveRoom.js";
import Toggle from "../components/Toggle.js";

// Ui svg icons

export const SWAP_BAG_SVG: string = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style="height: 512px; width: 512px;"><path d="M0 0h512v512H0z" fill="#599dd8" fill-opacity="0"></path><g class="" transform="translate(0,0)" style=""><g><path d="M363.783 23.545C354.001 23.602 347.2 26.592 343.039 33.765C325.529 63.945 304.607 95.41 294.487 131.01C297.323 131.84 300.122 132.797 302.86 133.863C310.213 136.726 317.24 140.345 323.402 144.721C350.936 119.179 381.567 99.511 410.852 79.259C422.208 71.405 423.125 65.675 421.035 58.429C418.945 51.183 411.167 42.064 400.51 35.253C389.852 28.443 376.64 23.923 365.78 23.573C365.1 23.551 364.435 23.543 363.783 23.546Z" class="" fill="#fff" fill-opacity="1"></path><path d="M294.785 24.291C284.765 24.109 276.993 30.684 270.861 44.531C261.921 64.725 260.649 97.967 269.415 127.716C269.571 127.708 269.725 127.693 269.882 127.686C271.872 127.599 273.872 127.614 275.882 127.716C285.318 92.894 303.848 62.996 319.895 36.188C309.585 27.692 301.021 24.406 294.787 24.292Z" class="" fill="#fff" fill-opacity="1"></path><path d="M197.5 82.5L187 97.97C201.82 108.01 216.056 117.695 226.813 129.344C230.729 133.584 234.183 138.066 237.123 142.951C240.893 138.221 245.633 134.573 250.813 132.159C251.22 131.971 251.633 131.804 252.041 131.629C248.618 126.189 244.737 121.211 240.531 116.657C227.765 102.83 212.29 92.52 197.5 82.5Z" class="" fill="#fff" fill-opacity="1"></path><path d="M421.27 94.77C392.015 114.998 362.695 133.922 336.922 157.55C337.36 158.126 337.77 158.718 338.18 159.31C358.86 152.56 387.666 143.977 412.096 139.9C423.58 137.984 427.756 133.348 429.67 126.672C431.584 119.996 430.117 109.962 424.354 99.689C423.43 98.042 422.394 96.399 421.271 94.769Z" class="selected" fill="#fff" fill-opacity="1"></path><path d="M197.332 142.64C182.382 142.84 167.6 146.94 153.375 155.406L162.938 171.436C184.595 158.546 205.564 157.303 228.17 166.873C228.69 161.281 229.935 156.213 231.898 151.663C232.248 150.857 232.628 150.077 233.021 149.309C221.151 144.789 209.191 142.482 197.333 142.639Z" class="" fill="#fff" fill-opacity="1"></path><path d="M273.132 146.574C267.554 146.491 262.535 147.316 258.705 149.1C254.328 151.138 251.239 154.014 249.057 159.07C248.173 161.117 247.485 163.61 247.072 166.564C247.528 166.557 247.982 166.534 248.437 166.531C264.49 166.447 281.024 169.301 297.75 175.721C305.464 178.681 312.812 183.174 319.797 188.905C323.014 186.46 324.787 184.185 325.57 182.37C326.78 179.572 326.665 177.186 324.936 173.55C321.476 166.275 309.729 156.595 296.08 151.28C289.256 148.622 282.1 147.056 275.557 146.666C274.739 146.616 273.93 146.586 273.133 146.574Z" class="" fill="#fff" fill-opacity="1"></path><path d="M248.375 185.031C225.393 185.106 203.653 192.417 183.375 204.813C150.93 224.648 122.81 257.937 103.031 294.845C83.254 331.753 71.898 372.255 71.845 405.375C71.792 438.435 82.105 462.645 104.657 473.157C104.7 473.177 104.739 473.2 104.782 473.22L104.814 473.22C129.686 484.73 170.43 492.557 213.221 493.312C256.011 494.068 301.011 487.855 335.095 473.125C357.055 463.635 369.64 444.673 375.595 418.969C381.549 393.264 380.113 361.312 373.22 329.655C366.326 297.998 354.02 266.595 339.125 241.78C324.231 216.966 306.511 199.116 291.062 193.187C276.398 187.56 262.164 184.987 248.375 185.031Z" class="" fill="#fff" fill-opacity="1"></path></g></g></svg>`;

export const MOLECULE_SVG: string = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style="height: 512px; width: 512px;"><path d="M0 0h512v512H0z" fill="#599dd8" fill-opacity="0"></path><g class="" transform="translate(0,0)" style=""><path d="M132.172 157.504a155.154 155.154 0 0 0-18.296 21.698 99.274 99.274 0 1 1 186.291-53.827 153.447 153.447 0 0 0-58.134-12.138h-1.982a152.767 152.767 0 0 0-107.879 44.267zm105.97 263.021A153.877 153.877 0 0 1 93.014 311.583a99.286 99.286 0 1 0 162.84 108.154 155.965 155.965 0 0 1-15.719.8h-1.981zm125.101-231.262h-1.098a84.642 84.642 0 0 0-1.05 169.272h1.098a84.642 84.642 0 0 0 1.05-169.272zm-104.8 83.317a103.834 103.834 0 0 1 78.317-99.286 134.136 134.136 0 0 0-94.942-40.96h-1.743a134.566 134.566 0 0 0-1.67 269.107h1.742a133.993 133.993 0 0 0 85.31-30.53 103.917 103.917 0 0 1-67.014-98.33z" fill="#fff" fill-opacity="1"></path></g></svg>`;

export const SCROLL_UNFURLED_SVG: string = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style="height: 512px; width: 512px;"><path d="M0 0h512v512H0z" fill="#599dd8" fill-opacity="0"></path><g class="" transform="translate(0,0)" style=""><path d="M103.432 17.844c-1.118.005-2.234.032-3.348.08-2.547.11-5.083.334-7.604.678-20.167 2.747-39.158 13.667-52.324 33.67-24.613 37.4 2.194 98.025 56.625 98.025.536 0 1.058-.012 1.583-.022v.704h60.565c-10.758 31.994-30.298 66.596-52.448 101.43-2.162 3.4-4.254 6.878-6.29 10.406l34.878 35.733-56.263 9.423c-32.728 85.966-27.42 182.074 48.277 182.074v-.002l9.31.066c23.83-.57 46.732-4.298 61.325-12.887 4.174-2.458 7.63-5.237 10.467-8.42h-32.446c-20.33 5.95-40.8-6.94-47.396-25.922-8.956-25.77 7.52-52.36 31.867-60.452 5.803-1.93 11.723-2.834 17.565-2.834v-.406h178.33c-.57-44.403 16.35-90.125 49.184-126 23.955-26.176 42.03-60.624 51.3-94.846l-41.225-24.932 38.272-6.906-43.37-25.807h-.005l.002-.002.002.002 52.127-8.85c-5.232-39.134-28.84-68.113-77.37-68.113C341.14 32.26 222.11 35.29 149.34 28.496c-14.888-6.763-30.547-10.723-45.908-10.652zm.464 18.703c13.137.043 27.407 3.804 41.247 10.63l.033-.07c4.667 4.735 8.542 9.737 11.68 14.985H82.92l10.574 14.78c10.608 14.83 19.803 31.99 21.09 42.024.643 5.017-.11 7.167-1.814 8.836-1.705 1.67-6.228 3.875-15.99 3.875-40.587 0-56.878-44.952-41.012-69.06C66.238 46.64 79.582 39.22 95.002 37.12c2.89-.395 5.863-.583 8.894-.573zM118.5 80.78h46.28c4.275 15.734 3.656 33.07-.544 51.51H131.52c1.9-5.027 2.268-10.574 1.6-15.77-1.527-11.913-7.405-24.065-14.62-35.74zm101.553 317.095c6.44 6.84 11.192 15.31 13.37 24.914 3.797 16.736 3.092 31.208-1.767 43.204-4.526 11.175-12.576 19.79-22.29 26h237.19c14.448 0 24.887-5.678 32.2-14.318 7.312-8.64 11.2-20.514 10.705-32.352-.186-4.473-.978-8.913-2.407-13.18l-69.91-8.205 42.017-20.528c-8.32-3.442-18.64-5.537-31.375-5.537H220.053zm-42.668.506c-1.152-.003-2.306.048-3.457.153-2.633.242-5.256.775-7.824 1.63-15.11 5.02-25.338 21.54-20.11 36.583 3.673 10.57 15.347 17.71 25.654 13.938l1.555-.57h43.354c.946-6.36.754-13.882-1.358-23.192-3.71-16.358-20.543-28.483-37.815-28.54z" fill="#fff" fill-opacity="1"></path></g></svg>`;

function randomFloat(min: number, max: number) {
    return Math.random() * (max - min + 1) + min;
}

interface Vector3 {
    x: number;
    y: number;
    z: number;
}

let backgroundEntities: Set<{
    waveStep: number;
    entity: EntityMob;
} & Vector3> = new Set();

/**
 * Current ui of menu.
 * 
 * @remarks
 * 
 * To store biome when ui switched.
 */
let menuUiCurrentBiome: Biomes = Biomes.GARDEN;

function drawRoundedPolygon(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    rotation: number,
    cornerPercent: number,
    numberOfCorners: number,
) {
    function getPolygonCorner(index: number, numberOfCorners: number): number[] {
        const angle = ((index + 0.5) * 2 * Math.PI) / numberOfCorners
        return [Math.sin(angle), Math.cos(angle)]
    }

    function lerp(p1: number[], p2: number[], t: number): number[] {
        return [p1[0] * (1 - t) + p2[0] * t, p1[1] * (1 - t) + p2[1] * t]
    }

    ctx.translate(x, y)
    ctx.scale(radius, radius)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.beginPath()

    const corners: number[][] = []

    for (let i = 0; i < numberOfCorners; i++) corners.push(getPolygonCorner(i, numberOfCorners))

    for (let i = 0; i < numberOfCorners; i++) {
        const prevCorner = corners[(i + 0) % numberOfCorners]
        const thisCorner = corners[(i + 1) % numberOfCorners]
        const nextCorner = corners[(i + 2) % numberOfCorners]

        const q1 = lerp(thisCorner, prevCorner, cornerPercent / 200)
        const q2 = lerp(thisCorner, nextCorner, cornerPercent / 200)

        ctx.lineTo(q1[0], q1[1])
        ctx.quadraticCurveTo(thisCorner[0], thisCorner[1], q2[0], q2[1])
    }

    ctx.closePath();
}

export default class UserInterfaceTitle extends UserInterface {
    private terrainGenerator: TerrainGenerator;

    private backgroundX: number;
    private backgroundY: number;
    private backgroundWaveStep: number;

    private lastBackgroundEntitySpawn: number;

    private connectingText: StaticText;
    private loggingInText: StaticText;
    private onLoadedComponents: Component[];

    private nameInput: TextInput;
    private codeInput: TextInput;

    private readyButton: TextButton;
    private squadButton: TextButton;

    private squadMenuContainer: StaticPanelContainer;

    private publicToggle: Toggle;

    // Wave informations

    public waveRoomClients: {
        id: number;
        isOwner: boolean;
        name: string;
    }[];
    public waveRoomCode: string;
    public waveRoomState: WaveRoomState;
    public waveRoomVisible: WaveRoomVisibleState;

    private oWaveRoomVisible: WaveRoomVisibleState;

    constructor(canvas: HTMLCanvasElement) {
        super(canvas);

        this.lastBackgroundEntitySpawn = Date.now();

        this.terrainGenerator = new TerrainGenerator();

        this.backgroundX = 0;
        this.backgroundY = 0;
        this.backgroundWaveStep = 0;

        setTimeout(() => {
            this.connectingText.setVisible(true, true);
            setTimeout(() => {
                this.connectingText.setVisible(false, true);
                setTimeout(() => {
                    this.loggingInText.setVisible(true, true);
                    setTimeout(() => {
                        this.loggingInText.setVisible(false, true);
                        setTimeout(() => {
                            this.onLoadedComponents.forEach(c => {
                                c.setVisible(true, true);
                            });
                        }, 350)
                    }, 2000);
                }, 350);
            }, 2000);
        }, 1);
    }

    onKeyDown(event: KeyboardEvent): void { }
    onKeyUp(event: KeyboardEvent): void { }

    onMouseDown(event: MouseEvent): void { }
    onMouseUp(event: MouseEvent): void { }
    onMouseMove(event: MouseEvent): void { }

    protected initializeComponents(): void {
        const bagButton = new SVGButton(
            {
                x: 15,
                y: 229,
                w: 45,
                h: 45,

                invertYCoordinate: true,
            },
            "#599dd8",
            () => {
                console.log("called")
            },
            () => true,
            SWAP_BAG_SVG
        );

        this.addComponent(bagButton);

        const craftButton = new SVGButton(
            {
                x: 15,
                y: 173,
                w: 45,
                h: 45,

                invertYCoordinate: true,
            },
            "#db9d5a",
            () => {
                console.log("called")
            },
            () => true,
            MOLECULE_SVG
        );

        this.addComponent(craftButton);

        const changelogButton = new SVGButton(
            {
                x: 15,
                y: 116,
                w: 45,
                h: 45,

                invertYCoordinate: true,
            },
            "#9bb56b",
            () => {
                console.log("called")
            },
            () => true,
            SCROLL_UNFURLED_SVG
        );

        this.addComponent(changelogButton);

        // Text
        this.connectingText = new StaticText(
            () => ({
                x: -(200 / 2),
                y: (-(40 / 2)) - 5,
                w: 200,
                h: 32,

                alignFromCenterX: true,
                alignFromCenterY: true,
            }),
            () => "Connecting...",
            () => 32,
        );

        this.connectingText.setVisible(false);

        this.addComponent(this.connectingText);

        this.loggingInText = new StaticText(
            () => ({
                x: -(200 / 2),
                y: (-(40 / 2)) - 5,
                w: 200,
                h: 32,

                alignFromCenterX: true,
                alignFromCenterY: true,
            }),
            () => "Logging in...",
            () => 32,
        );

        this.loggingInText.setVisible(false);

        this.addComponent(this.loggingInText);

        const gameNameText = new (ExtensionCollidable(StaticText))(
            () => ({
                x: -(250 / 2),
                y: (-(80 / 2)) - 40,
                w: 250,
                h: 80,

                alignFromCenterX: true,
                alignFromCenterY: true,
            }),
            () => "florr.io",
            () => 54,
        );

        gameNameText.addCollidableComponents([this.connectingText, this.loggingInText]);

        {
            this.onLoadedComponents = [];

            const nameInputDescription = new (ExtensionCollidable(StaticText))(
                () => ({
                    x: -(100 / 2),
                    y: (-(50 / 2)) - 10,
                    w: 100,
                    h: 10,

                    alignFromCenterX: true,
                    alignFromCenterY: true,
                }),
                () => "This pretty little flower is called...",
                () => 13,
            );

            this.nameInput = new (ExtensionCollidable(TextInput))(
                {
                    x: (-(100 / 2)) - 95,
                    y: (-(50 / 2)) + 3,
                    w: 220,
                    h: 22,

                    alignFromCenterX: true,
                    alignFromCenterY: true,
                },
                {
                    canvas: this.canvas,
                    value: "",

                    fontSize: 15,
                    fontFamily: 'Ubuntu',
                    fontColor: '#212121',
                    fontWeight: 'bold',
                    placeHolder: '',

                    borderColor: "#000000",
                    borderRadius: 2,
                    borderWidth: 2.5,
                    maxlength: 80,

                    padding: 1,

                    unfocusedState: false,
                },
            );

            this.readyButton = new (ExtensionCollidable(TextButton))(
                {
                    x: (-(100 / 2)) + 140,
                    y: (-(50 / 2)) + 4,
                    w: 80,
                    h: 28,

                    alignFromCenterX: true,
                    alignFromCenterY: true,
                },
                "#1dd129",
                () => {
                    console.log("called")
                },
                () => true,
                "Ready",
                (ctx: CanvasRenderingContext2D, textWidth: number) => {
                    ctx.translate(textWidth + 12, 0);

                    ctx.fillStyle = "black";
                    ctx.globalAlpha = 0.2;

                    drawRoundedPolygon(ctx, 0, 0, 11, 90, 40, 3);

                    ctx.fill();
                },
            );

            this.squadButton = new TextButton(
                {
                    x: (-(100 / 2)) + 140 + 12,
                    y: (-(50 / 2)) + 20 + 17,
                    w: 68,
                    h: 22,

                    alignFromCenterX: true,
                    alignFromCenterY: true,
                },
                "#5a9fdb",
                () => {
                    this.squadMenuContainer.setVisible(true, true);
                },
                () => true,
                "Squad",
                (ctx: CanvasRenderingContext2D, textWidth: number) => {
                    ctx.translate(textWidth + 11, 0);

                    ctx.fillStyle = "black";
                    ctx.globalAlpha = 0.2;

                    drawRoundedPolygon(ctx, 0, 0, 8.5, 90, 40, 4);

                    ctx.fill();
                },
            )

            const biomeSwitchers = this.createContainer(
                new StaticHContainer(
                    {
                        x: -144,
                        y: (-(50 / 2)) + 20 + 15,

                        alignFromCenterX: true,
                        alignFromCenterY: true,
                    },
                ),
                [
                    new TextButton(
                        {
                            w: 42,
                            h: 14,
                        },
                        "#2ba35b",
                        () => {
                            this.biome = Biomes.GARDEN;
                        },
                        () => true,
                        "Garden",
                    ),
                    new StaticSpace(5, 0),
                    new TextButton(
                        {
                            w: 42,
                            h: 14,
                        },
                        "#ccba73",
                        () => {
                            this.biome = Biomes.DESERT;
                        },
                        () => true,
                        "Desert",
                    ),
                    new StaticSpace(5, 0),
                    new TextButton(
                        {
                            w: 42,
                            h: 14,
                        },
                        "#6089b6",
                        () => {
                            this.biome = Biomes.OCEAN;
                        },
                        () => true,
                        "Ocean",
                    ),
                ],
            );

            // TODO: move biomeSwitchers, readyButton too

            this.squadMenuContainer = this.createContainer(
                new StaticPanelContainer(
                    {
                        x: -170,
                        y: -60,

                        alignFromCenterX: true,
                        alignFromCenterY: true,
                    },
                    "#5aa0db",
                ),
                [
                    new SVGButton(
                        {
                            x: 319,
                            y: 1,
                            w: 15,
                            h: 15,
                        },
                        "#b04c5e",
                        () => {
                            this.squadMenuContainer.setVisible(false, true);

                            ws.send(new Uint8Array([ServerBound.WAVE_ROOM_LEAVE]));
                        },
                        () => true,
                        CROSS_ICON_SVG,
                    ),

                    (this.publicToggle = new Toggle(
                        {
                            x: 8,
                            y: 24,
                            w: 16,
                            h: 16,
                        },
                        (t: boolean): void => {
                            ws.send(new Uint8Array([ServerBound.WAVE_ROOM_CHANGE_VISIBLE, t ? WaveRoomVisibleState.PUBLIC : WaveRoomVisibleState.PRIVATE]));
                        }
                    )),
                    new StaticText(
                        () => ({
                            x: 44,
                            y: 24 + 8,
                            w: 0,
                            h: 0,
                        }),
                        () => "Public",
                        () => 10,
                    ),

                    new StaticText(
                        () => ({
                            x: this.waveRoomVisible === WaveRoomVisibleState.PRIVATE ? 100 : 110,
                            y: 24 + 8,
                            w: 0,
                            h: 0,
                        }),
                        () => this.waveRoomVisible === WaveRoomVisibleState.PRIVATE ?
                            "Private squad" :
                            this.waveRoomVisible === WaveRoomVisibleState.PUBLIC ?
                                "Waiting for players..." :
                                "",
                        8,
                        () => this.waveRoomVisible === WaveRoomVisibleState.PRIVATE ? "#f0666b" : "#ffffff",
                    ),

                    // Code inputer
                    (this.codeInput = new TextInput(
                        {
                            x: 190,
                            y: 158,
                            w: 75,
                            h: 14,
                        },
                        {
                            canvas: this.canvas,
                            value: "",

                            fontSize: 10,
                            fontFamily: 'Ubuntu',
                            fontColor: '#212121',
                            fontWeight: 'bold',
                            placeHolder: '',

                            borderColor: "#000000",
                            borderRadius: 2,
                            borderWidth: 2,
                            maxlength: 20,

                            padding: 1,

                            unfocusedState: false,
                        },
                    )),
                    new TextButton(
                        {
                            x: 277,
                            y: 158 + 1,
                            w: 50,
                            h: 18,
                        },
                        "#1dd129",
                        () => {
                            const code = this.codeInput.value();
                            ws.send(new Uint8Array([ServerBound.WAVE_ROOM_JOIN, code.length, ...new TextEncoder().encode(code)]));
                        },
                        () => this.codeInput.value().length > 0,
                        "Join",
                    ),

                    new TextButton(
                        {
                            x: 277,
                            y: 24,
                            w: 50,
                            h: 18,
                        },
                        "#5aa0db",
                        () => {
                            ws.send(new Uint8Array([ServerBound.WAVE_ROOM_CREATE, this.biome]));
                        },
                        () => true,
                        "New",
                    ),

                    new TextButton(
                        {
                            x: 200,
                            y: 24,
                            w: 70,
                            h: 18,
                        },
                        "#5aa0db",
                        () => { },
                        () => false,
                        "Find public",
                    ),

                    new StaticText(
                        () => ({
                            x: 8,
                            y: 170,
                            w: 0,
                            h: 0,
                        }),
                        () => "Code: " + (this.waveRoomCode || "UNKNOWN"),
                        () => 8,
                        () => "#ffffff",
                        true,
                    ),

                    new StaticText(
                        () => ({
                            x: 170,
                            y: 12,
                            w: 0,
                            h: 0,
                        }),
                        () => "Squad",
                        () => 18,
                    ),
                    new CoordinatedSpace(320, 171, 15, 15),
                ],
            );

            this.onLoadedComponents.push(nameInputDescription);
            this.onLoadedComponents.push(this.nameInput);
            this.onLoadedComponents.push(this.readyButton);
            this.onLoadedComponents.push(this.squadButton);
            this.onLoadedComponents.push(biomeSwitchers);

            nameInputDescription.setVisible(false);
            this.nameInput.setVisible(false);
            this.readyButton.setVisible(false);
            this.squadButton.setVisible(false);
            biomeSwitchers.setVisible(false);

            this.addComponent(nameInputDescription);
            this.addComponent(this.nameInput);
            this.addComponent(this.readyButton);
            this.addComponent(this.squadButton);
            this.addComponent(biomeSwitchers);

            this.squadMenuContainer.setVisible(false);
            this.addComponent(this.squadMenuContainer);

            nameInputDescription.addCollidableComponents([this.nameInput]);
            (this.nameInput as any).addCollidableComponents([this.squadMenuContainer]);
            (this.readyButton as any).addCollidableComponents([this.squadMenuContainer]);

            gameNameText.addCollidableComponents([nameInputDescription]);
        };

        this.addComponent(gameNameText);
    }

    private generateRandomBgVector(): Vector3 {
        return {
            x: 0,
            y: randomFloat(-100, (this.canvas.height / uiScaleFactor) + 100),
            z: randomFloat(0.7, 1.8),
        }
    }

    public animationFrame() {
        const canvas = this.canvas;
        const ctx = canvas.getContext("2d");

        const widthRelative = this.canvas.width / uiScaleFactor;
        const heightRelative = this.canvas.height / uiScaleFactor;

        this.terrainGenerator.renderMapMenu(canvas, BIOME_TILESETS.get(this.biome), this.backgroundX, this.backgroundY);

        this.backgroundX += 0.4;
        this.backgroundY += Math.sin(this.backgroundWaveStep / 20) * 0.4;
        this.backgroundWaveStep += 0.07;

        backgroundEntities.forEach((v) => {
            if (v.x > widthRelative) {
                backgroundEntities.delete(v);
            }
        });

        if (Date.now() - this.lastBackgroundEntitySpawn > 200) {
            const param = this.generateRandomBgVector();
            backgroundEntities.add({
                ...param,
                waveStep: Math.random() + 360,
                entity: new EntityMob(-1, param.x, param.y, 1, param.z * 5, 1, 1, PetalType.BASIC, Rarities.COMMON, false)
            });
            this.lastBackgroundEntitySpawn = Date.now();
        }

        Array.from(backgroundEntities.values()).sort((a, b) => a.z + b.z).forEach(v => {
            v.entity.draw(ctx);

            v.entity.x += v.z * 0.3;
            v.entity.y += Math.sin(v.waveStep / 20) * 0.1;

            v.waveStep += 0.1;
        });

        if (this.biome === Biomes.OCEAN) {
            ctx.save();

            ctx.globalCompositeOperation = "multiply";
            ctx.fillStyle = "#CCDBF2";
            ctx.fillRect(0, 0, widthRelative, heightRelative);

            ctx.restore();
        }

        if (this.waveRoomVisible !== this.oWaveRoomVisible) {
            this.publicToggle.startScaling(this.waveRoomVisible === WaveRoomVisibleState.PUBLIC);
        }

        this.oWaveRoomVisible = this.waveRoomVisible;

        this.render();
    }

    public cleanup(): void {
        this.terrainGenerator = undefined;
    }

    set biome(biome: Biomes) {
        menuUiCurrentBiome = biome;
    }

    get biome(): Biomes {
        return menuUiCurrentBiome;
    }
}