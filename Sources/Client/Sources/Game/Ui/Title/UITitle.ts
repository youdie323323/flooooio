import Mob from "../../Entity/Mob";
import { Biome } from "../../../../../Shared/Biome";
import { WaveRoomPlayerReadyState, WaveRoomState, WaveRoomVisibleState } from "../../../../../Shared/WaveRoom";
import type { WaveRoomCode } from "../../../../../Shared/WaveRoomCode";
import { isWaveRoomCode } from "../../../../../Shared/WaveRoomCode";
import { clientWebsocket, cameraController, deltaTime, uiCtx } from "../../../../Main";
import { DARKEND_BASE } from "../../../../../Shared/Utils/Color";
import { Rarity } from "../../../../../Shared/Entity/Statics/EntityRarity";
import { PETAL_TYPES } from "../../../../../Shared/Entity/Statics/EntityType";
import { isPetal } from "../../../../../Shared/Entity/Dynamics/Mob/Petal/Petal";
import { renderEntity } from "../../Entity/Renderers/RendererEntityRenderingLink";
import SettingStorage from "../../Utils/SettingStorage";
import type { Components } from "../Layout/Components/Component";
import { AnimationType } from "../Layout/Components/Component";
import PlayerProfile from "../Layout/Components/Native/PlayerProfile";
import type { AnyAddableStaticContainer } from "../Layout/Components/WellKnown/Container";
import { StaticPanelContainer, CoordinatedStaticSpace, StaticHContainer, StaticSpace } from "../Layout/Components/WellKnown/Container";
import Text from "../Layout/Components/WellKnown/Text";
import TextInput from "../Layout/Components/WellKnown/TextInput";
import Toggle from "../Layout/Components/WellKnown/Toggle";
import Collidable from "../Layout/Extensions/ExtensionCollidable";
import { DynamicLayoutable } from "../Layout/Extensions/ExtensionDynamicLayoutable";
import { BIOME_TILESETS, oceanBackgroundPatternTileset } from "../Tiled/TilesetRenderer";
import TilesetWavedRenderer from "../Tiled/TilesetWavedRenderer";
import AbstractUI, { uiScaleFactor } from "../UI";
import { PacketClientboundOpcode } from "../../../../../Shared/Websocket/Packet/Bound/Client/PacketClientboundOpcode";
import type { StaticAdditionalClientboundListen } from "../../Websocket/Packet/Bound/Client/PacketClientbound";
import type BinaryReader from "../../../../../Shared/Websocket/Binary/ReadWriter/Reader/BinaryReader";
import { Button } from "../Layout/Components/WellKnown/Button";
import { CanvasLogo, SVGLogo } from "../Layout/Components/WellKnown/Logo";
import CROSS_ICON_SVG from "../Assets/cross_icon.svg";

const TAU = Math.PI * 2;

// Ui svg icons

export const SWAP_BAG_SVG: string = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style="height: 512px; width: 512px;"><path d="M0 0h512v512H0z" fill="#599dd8" fill-opacity="0"></path><g class="" transform="translate(0,0)" style=""><g><path d="M363.783 23.545C354.001 23.602 347.2 26.592 343.039 33.765C325.529 63.945 304.607 95.41 294.487 131.01C297.323 131.84 300.122 132.797 302.86 133.863C310.213 136.726 317.24 140.345 323.402 144.721C350.936 119.179 381.567 99.511 410.852 79.259C422.208 71.405 423.125 65.675 421.035 58.429C418.945 51.183 411.167 42.064 400.51 35.253C389.852 28.443 376.64 23.923 365.78 23.573C365.1 23.551 364.435 23.543 363.783 23.546Z" class="" fill="#fff" fill-opacity="1"></path><path d="M294.785 24.291C284.765 24.109 276.993 30.684 270.861 44.531C261.921 64.725 260.649 97.967 269.415 127.716C269.571 127.708 269.725 127.693 269.882 127.686C271.872 127.599 273.872 127.614 275.882 127.716C285.318 92.894 303.848 62.996 319.895 36.188C309.585 27.692 301.021 24.406 294.787 24.292Z" class="" fill="#fff" fill-opacity="1"></path><path d="M197.5 82.5L187 97.97C201.82 108.01 216.056 117.695 226.813 129.344C230.729 133.584 234.183 138.066 237.123 142.951C240.893 138.221 245.633 134.573 250.813 132.159C251.22 131.971 251.633 131.804 252.041 131.629C248.618 126.189 244.737 121.211 240.531 116.657C227.765 102.83 212.29 92.52 197.5 82.5Z" class="" fill="#fff" fill-opacity="1"></path><path d="M421.27 94.77C392.015 114.998 362.695 133.922 336.922 157.55C337.36 158.126 337.77 158.718 338.18 159.31C358.86 152.56 387.666 143.977 412.096 139.9C423.58 137.984 427.756 133.348 429.67 126.672C431.584 119.996 430.117 109.962 424.354 99.689C423.43 98.042 422.394 96.399 421.271 94.769Z" class="selected" fill="#fff" fill-opacity="1"></path><path d="M197.332 142.64C182.382 142.84 167.6 146.94 153.375 155.406L162.938 171.436C184.595 158.546 205.564 157.303 228.17 166.873C228.69 161.281 229.935 156.213 231.898 151.663C232.248 150.857 232.628 150.077 233.021 149.309C221.151 144.789 209.191 142.482 197.333 142.639Z" class="" fill="#fff" fill-opacity="1"></path><path d="M273.132 146.574C267.554 146.491 262.535 147.316 258.705 149.1C254.328 151.138 251.239 154.014 249.057 159.07C248.173 161.117 247.485 163.61 247.072 166.564C247.528 166.557 247.982 166.534 248.437 166.531C264.49 166.447 281.024 169.301 297.75 175.721C305.464 178.681 312.812 183.174 319.797 188.905C323.014 186.46 324.787 184.185 325.57 182.37C326.78 179.572 326.665 177.186 324.936 173.55C321.476 166.275 309.729 156.595 296.08 151.28C289.256 148.622 282.1 147.056 275.557 146.666C274.739 146.616 273.93 146.586 273.133 146.574Z" class="" fill="#fff" fill-opacity="1"></path><path d="M248.375 185.031C225.393 185.106 203.653 192.417 183.375 204.813C150.93 224.648 122.81 257.937 103.031 294.845C83.254 331.753 71.898 372.255 71.845 405.375C71.792 438.435 82.105 462.645 104.657 473.157C104.7 473.177 104.739 473.2 104.782 473.22L104.814 473.22C129.686 484.73 170.43 492.557 213.221 493.312C256.011 494.068 301.011 487.855 335.095 473.125C357.055 463.635 369.64 444.673 375.595 418.969C381.549 393.264 380.113 361.312 373.22 329.655C366.326 297.998 354.02 266.595 339.125 241.78C324.231 216.966 306.511 199.116 291.062 193.187C276.398 187.56 262.164 184.987 248.375 185.031Z" class="" fill="#fff" fill-opacity="1"></path></g></g></svg>`;

export const MOLECULE_SVG: string = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style="height: 512px; width: 512px;"><path d="M0 0h512v512H0z" fill="#599dd8" fill-opacity="0"></path><g class="" transform="translate(0,0)" style=""><path d="M132.172 157.504a155.154 155.154 0 0 0-18.296 21.698 99.274 99.274 0 1 1 186.291-53.827 153.447 153.447 0 0 0-58.134-12.138h-1.982a152.767 152.767 0 0 0-107.879 44.267zm105.97 263.021A153.877 153.877 0 0 1 93.014 311.583a99.286 99.286 0 1 0 162.84 108.154 155.965 155.965 0 0 1-15.719.8h-1.981zm125.101-231.262h-1.098a84.642 84.642 0 0 0-1.05 169.272h1.098a84.642 84.642 0 0 0 1.05-169.272zm-104.8 83.317a103.834 103.834 0 0 1 78.317-99.286 134.136 134.136 0 0 0-94.942-40.96h-1.743a134.566 134.566 0 0 0-1.67 269.107h1.742a133.993 133.993 0 0 0 85.31-30.53 103.917 103.917 0 0 1-67.014-98.33z" fill="#fff" fill-opacity="1"></path></g></svg>`;

export const SCROLL_UNFURLED_SVG: string = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style="height: 512px; width: 512px;"><path d="M0 0h512v512H0z" fill="#599dd8" fill-opacity="0"></path><g class="" transform="translate(0,0)" style=""><path d="M103.432 17.844c-1.118.005-2.234.032-3.348.08-2.547.11-5.083.334-7.604.678-20.167 2.747-39.158 13.667-52.324 33.67-24.613 37.4 2.194 98.025 56.625 98.025.536 0 1.058-.012 1.583-.022v.704h60.565c-10.758 31.994-30.298 66.596-52.448 101.43-2.162 3.4-4.254 6.878-6.29 10.406l34.878 35.733-56.263 9.423c-32.728 85.966-27.42 182.074 48.277 182.074v-.002l9.31.066c23.83-.57 46.732-4.298 61.325-12.887 4.174-2.458 7.63-5.237 10.467-8.42h-32.446c-20.33 5.95-40.8-6.94-47.396-25.922-8.956-25.77 7.52-52.36 31.867-60.452 5.803-1.93 11.723-2.834 17.565-2.834v-.406h178.33c-.57-44.403 16.35-90.125 49.184-126 23.955-26.176 42.03-60.624 51.3-94.846l-41.225-24.932 38.272-6.906-43.37-25.807h-.005l.002-.002.002.002 52.127-8.85c-5.232-39.134-28.84-68.113-77.37-68.113C341.14 32.26 222.11 35.29 149.34 28.496c-14.888-6.763-30.547-10.723-45.908-10.652zm.464 18.703c13.137.043 27.407 3.804 41.247 10.63l.033-.07c4.667 4.735 8.542 9.737 11.68 14.985H82.92l10.574 14.78c10.608 14.83 19.803 31.99 21.09 42.024.643 5.017-.11 7.167-1.814 8.836-1.705 1.67-6.228 3.875-15.99 3.875-40.587 0-56.878-44.952-41.012-69.06C66.238 46.64 79.582 39.22 95.002 37.12c2.89-.395 5.863-.583 8.894-.573zM118.5 80.78h46.28c4.275 15.734 3.656 33.07-.544 51.51H131.52c1.9-5.027 2.268-10.574 1.6-15.77-1.527-11.913-7.405-24.065-14.62-35.74zm101.553 317.095c6.44 6.84 11.192 15.31 13.37 24.914 3.797 16.736 3.092 31.208-1.767 43.204-4.526 11.175-12.576 19.79-22.29 26h237.19c14.448 0 24.887-5.678 32.2-14.318 7.312-8.64 11.2-20.514 10.705-32.352-.186-4.473-.978-8.913-2.407-13.18l-69.91-8.205 42.017-20.528c-8.32-3.442-18.64-5.537-31.375-5.537H220.053zm-42.668.506c-1.152-.003-2.306.048-3.457.153-2.633.242-5.256.775-7.824 1.63-15.11 5.02-25.338 21.54-20.11 36.583 3.673 10.57 15.347 17.71 25.654 13.938l1.555-.57h43.354c.946-6.36.754-13.882-1.358-23.192-3.71-16.358-20.543-28.483-37.815-28.54z" fill="#fff" fill-opacity="1"></path></g></svg>`;

function randomFloat(min: number, max: number) {
    return Math.random() * (max - min + 1) + min;
}

const backgroundEntities: Set<Mob> = new Set();

/**
 * Current ui of title.
 */
let titleUiCurrentBiome: Biome = Biome.Garden;

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
        const angle = ((index + 0.5) * TAU) / numberOfCorners;

        return [Math.sin(angle), Math.cos(angle)];
    }

    function lerp(p1: number[], p2: number[], t: number): number[] {
        return [p1[0] * (1 - t) + p2[0] * t, p1[1] * (1 - t) + p2[1] * t];
    }

    ctx.translate(x, y);
    ctx.scale(radius, radius);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.beginPath();

    const corners: number[][] = [];

    for (let i = 0; i < numberOfCorners; i++) corners.push(getPolygonCorner(i, numberOfCorners));

    for (let i = 0; i < numberOfCorners; i++) {
        const prevCorner = corners[(i + 0) % numberOfCorners];
        const thisCorner = corners[(i + 1) % numberOfCorners];
        const nextCorner = corners[(i + 2) % numberOfCorners];

        const q1 = lerp(thisCorner, prevCorner, cornerPercent / 200);
        const q2 = lerp(thisCorner, nextCorner, cornerPercent / 200);

        ctx.lineTo(q1[0], q1[1]);
        ctx.quadraticCurveTo(thisCorner[0], thisCorner[1], q2[0], q2[1]);
    }

    ctx.closePath();
}

// TODO: send initial data of wave room instead of send 2 packets

export interface WaveRoomPlayerInformation {
    id: number;
    name: string;
    readyState: WaveRoomPlayerReadyState;
}

export const enum StatusText {
    Loading = "Loading...",
    SquadCreating = "Creating...",
    SquadNotFound = "Squad not found",
}

export default class UITitle extends AbstractUI {
    private wavedBackgroundRendererBiome: TilesetWavedRenderer = new TilesetWavedRenderer();
    private wavedBackgroundRendererOceanPattern: TilesetWavedRenderer = new TilesetWavedRenderer();

    private lastBackgroundEntitySpawn: number;

    private connectingText: Text;
    private loggingInText: Text;
    private onLoadedComponents: Components[];

    // Make this public to close this from networking
    private squadMenuContainer: AnyAddableStaticContainer;

    private publicToggle: Toggle;

    private statusText: Text;
    private statusTextRef: StatusText;

    private playerProfileContainer: AnyAddableStaticContainer;

    private codeText: Text;

    // Wave informations

    private waveRoomPlayers: Array<WaveRoomPlayerInformation>;
    private waveRoomCode: WaveRoomCode | null;
    private waveRoomState: WaveRoomState;
    private waveRoomVisible: WaveRoomVisibleState;
    private prevWaveRoomVisible: WaveRoomVisibleState;

    // Network dynamics

    public waveRoomSelfId: number = -1;

    override additionalClientboundListen: StaticAdditionalClientboundListen = {
        [PacketClientboundOpcode.WaveRoomSelfId]: (reader: BinaryReader): void => {
            this.waveRoomSelfId = reader.readUInt32();
        },
        [PacketClientboundOpcode.WaveRoomUpdate]: (reader: BinaryReader): void => {
            const waveClientCount = reader.readUInt8();

            const playerInformations: Array<WaveRoomPlayerInformation> = new Array(waveClientCount);

            for (let i = 0; i < waveClientCount; i++) {
                const waveClientId = reader.readUInt32();

                let waveClientName = reader.readString();
                // This operation should be server side?
                if (waveClientName === "") {
                    waveClientName = "Unnamed";
                }

                const waveClientReadyState = reader.readUInt8() satisfies WaveRoomPlayerReadyState;

                playerInformations[i] = {
                    id: waveClientId,
                    name: waveClientName,
                    readyState: waveClientReadyState,
                } satisfies WaveRoomPlayerInformation;
            }

            const waveCode = reader.readString() as WaveRoomCode;

            const waveBiome = reader.readUInt8() satisfies Biome;

            const waveState = reader.readUInt8() satisfies WaveRoomState;

            const waveVisible = reader.readUInt8() satisfies WaveRoomVisibleState;

            this.waveRoomPlayers = playerInformations;
            this.waveRoomCode = waveCode;
            this.waveRoomState = waveState;
            this.waveRoomVisible = waveVisible;

            this.biome = waveBiome;
        },
        [PacketClientboundOpcode.WaveStarted]: (reader: BinaryReader): void => {
            this.squadMenuContainer.setVisible(false, true, AnimationType.Zoom);

            uiCtx.switchUI("game");

            const waveBiome = reader.readUInt8() satisfies Biome;

            if (uiCtx.previousCtx) {
                uiCtx.previousCtx.biome = waveBiome;
            }

            if (uiCtx.currentCtx) {
                uiCtx.currentCtx.biome = waveBiome;
            }
        },
        [PacketClientboundOpcode.WaveRoomJoinFailed]: (reader: BinaryReader): void => {
            // Reset squad state to render status text
            this.resetWaveState();

            this.statusTextRef = StatusText.SquadNotFound;
        },
    };

    constructor(canvas: HTMLCanvasElement) {
        super(canvas);

        this.lastBackgroundEntitySpawn = Date.now();

        this.statusTextRef = StatusText.Loading;

        setTimeout(() => {
            this.connectingText.setVisible(true, false);
            setTimeout(() => {
                this.connectingText.setVisible(false, true, AnimationType.Zoom);
                setTimeout(() => {
                    this.loggingInText.setVisible(true, true, AnimationType.Zoom);
                    setTimeout(() => {
                        this.loggingInText.setVisible(false, true, AnimationType.Zoom);
                        setTimeout(() => {
                            this.onLoadedComponents.forEach(c => {
                                c.setVisible(true, true, AnimationType.Zoom);
                            });
                        }, 150);
                    }, 2000);
                }, 150);
            }, 2000);
        }, 1);
    }

    override onKeyDown(event: KeyboardEvent): void { }

    override onKeyUp(event: KeyboardEvent): void { }

    override onMouseDown(event: MouseEvent): void { }

    override onMouseUp(event: MouseEvent): void { }

    override onMouseMove(event: MouseEvent): void { }

    protected override initializeComponents(): void {
        this.resetWaveState();

        const craftButton = new Button(
            {
                x: 15,
                y: 173,
                w: 40,
                h: 40,

                invertYCoordinate: true,
            },
            [
                new SVGLogo(
                    {
                        x: 0,
                        y: 0,
                        w: 40,
                        h: 40,
                    },
                    MOLECULE_SVG,
                ),
            ],
            () => {
                console.log("called");
            },
            "#db9d5a",
            true,
        );

        this.addComponent(craftButton);

        const changelogButton = new Button(
            {
                x: 15,
                y: 116,
                w: 40,
                h: 40,

                invertYCoordinate: true,
            },
            [
                new SVGLogo(
                    {
                        x: 0,
                        y: 0,
                        w: 40,
                        h: 40,
                    },
                    SCROLL_UNFURLED_SVG,
                ),
            ],
            () => {
                console.log("called");
            },
            "#9bb56b",
            true,
        );

        this.addComponent(changelogButton);

        {
            let keyboardMovementToggle: Toggle;

            const settingContainer = this.createAddableContainer(
                new StaticPanelContainer(
                    {
                        x: 75,
                        y: 225,

                        invertYCoordinate: true,
                    },
                    "#aaaaaa",
                ),
                [
                    new Button(
                        {
                            x: 150 - 4,
                            y: 2,
                            w: 17,
                            h: 17,
                        },
                        [
                            new SVGLogo(
                                {
                                    x: 0,
                                    y: 0,
                                    w: 17,
                                    h: 17,
                                },
                                CROSS_ICON_SVG,
                            ),
                        ],
                        () => {
                            settingIsOpen = false;

                            settingContainer.setVisible(settingIsOpen, true, AnimationType.Slide, "v");
                        },
                        "#bb5555",
                        true,
                    ),

                    new Text(
                        {
                            x: 50,
                            y: 5,
                        },
                        "Settings",
                        16,
                    ),

                    // Keyboard movement
                    (keyboardMovementToggle = new Toggle(
                        {
                            x: 5,
                            y: 40,
                            w: 17,
                            h: 17,
                        },
                        (t: boolean): void => {
                            keyboardMovementToggle.setToggle(t);

                            SettingStorage.set("keyboard_control", t);
                        },
                    )),
                    new Text(
                        {
                            x: 32,
                            y: 42 + 1,
                        },
                        "Keyboard movement",
                        11,
                    ),

                    new CoordinatedStaticSpace(15, 15, 150, 190),
                ],
            );

            keyboardMovementToggle.setToggle(SettingStorage.get("keyboard_control"));

            let settingIsOpen = false;

            const settingButton = new Button(
                {
                    x: 15,
                    y: 229,
                    w: 40,
                    h: 40,

                    invertYCoordinate: true,
                },
                [
                    new SVGLogo(
                        {
                            x: 0,
                            y: 0,
                            w: 40,
                            h: 40,
                        },
                        SWAP_BAG_SVG,
                    ),
                ],
                () => {
                    settingIsOpen = !settingIsOpen;

                    settingContainer.setVisible(settingIsOpen, true, AnimationType.Slide, "v");
                },
                "#599dd8",
                true,
            );

            settingContainer.setVisible(false, false);

            this.addComponent(settingButton);

            this.addComponent(settingContainer);
        }

        // Text
        this.connectingText = new Text(
            {
                x: -(200 / 2),
                y: (-(40 / 2)) - 5,

                alignFromCenterX: true,
                alignFromCenterY: true,
            },
            "Connecting...",
            32,
        );

        this.loggingInText = new Text(
            {
                x: -(200 / 2),
                y: (-(40 / 2)) - 5,

                alignFromCenterX: true,
                alignFromCenterY: true,
            },
            "Logging in...",
            32,
        );

        this.connectingText.setVisible(false, false);
        this.loggingInText.setVisible(false, false);

        this.addComponent(this.connectingText);
        this.addComponent(this.loggingInText);

        const gameNameText = new (Collidable(Text))(
            {
                x: -(250 / 2),
                y: (-(80 / 2)) - 40,

                alignFromCenterX: true,
                alignFromCenterY: true,
            },
            "floooo.io",
            54,
        );

        gameNameText.addCollidableComponents([this.connectingText, this.loggingInText]);

        {
            this.onLoadedComponents = [];

            const nameInputDescription = new (Collidable(Text))(
                {
                    x: -(100 / 2),
                    y: (-(50 / 2)) - 10,

                    alignFromCenterX: true,
                    alignFromCenterY: true,
                },
                "This pretty little flower is called...",
                13,
            );

            const nameInput = new (Collidable(TextInput))(
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
                    placeHolderDisplayUnfocusedState: false,

                    borderColor: "#000000",
                    borderRadius: 2,
                    borderWidth: 2.5,
                    maxlength: 80,

                    padding: 1,

                    onkeyup(e, self) {
                        const name = self.value;

                        clientWebsocket.packetServerbound.sendWaveRoomChangeName(name);
                    },
                },
            );

            let readyToggle = false;

            const readyButton = new (Collidable(Button))(
                {
                    x: (-(100 / 2)) + 140,
                    y: (-(50 / 2)) + 5,
                    w: 76,
                    h: 26,

                    alignFromCenterX: true,
                    alignFromCenterY: true,
                },
                [
                    new Text(
                        {
                            x: 0,
                            y: 0,
                        },
                        "Ready",
                        50,
                    ),
                    new CanvasLogo(
                        {
                            x: 0,
                            y: 0,
                            w: 40,
                            h: 40,
                        },
                        (ctx: CanvasRenderingContext2D) => {
                            ctx.fillStyle = "black";
                            ctx.globalAlpha = DARKEND_BASE;

                            drawRoundedPolygon(ctx, 0, 0, 10, 90, 40, 3);

                            ctx.fill();
                        },
                    ),
                ],
                () => {
                    readyToggle = !readyToggle;

                    if (this.squadMenuContainer.visible === false) {
                        clientWebsocket.packetServerbound.sendWaveRoomFindPublic(this.biome);

                        this.squadMenuContainer.setVisible(true, true, AnimationType.Zoom);

                        this.statusTextRef = StatusText.SquadCreating;

                        clientWebsocket.packetServerbound.sendWaveRoomChangeReady(WaveRoomPlayerReadyState.Ready);
                    } else {
                        clientWebsocket.packetServerbound.sendWaveRoomChangeReady(
                            readyToggle
                                ? WaveRoomPlayerReadyState.Ready
                                : WaveRoomPlayerReadyState.Unready,
                        );
                    }
                },
                "#1dd129",
                true,
            );

            const squadButton = new Button(
                {
                    x: (-(100 / 2)) + 140 + 13,
                    y: (-(50 / 2)) + 20 + 16,
                    w: 63,
                    h: 22,

                    alignFromCenterX: true,
                    alignFromCenterY: true,
                },
                [
                    new Text(
                        {
                            x: 0,
                            y: 0,
                        },
                        "Squad",
                        14,
                    ),

                ],
                () => {
                    clientWebsocket.packetServerbound.sendWaveRoomCreate(this.biome);

                    this.squadMenuContainer.setVisible(true, true, AnimationType.Zoom);

                    this.statusTextRef = StatusText.SquadCreating;

                    clientWebsocket.packetServerbound.sendWaveRoomChangeVisible(WaveRoomVisibleState.Private);
                },
                "#5a9fdb",
                true,
            );

            const biomeSwitcher = this.createAddableContainer(
                new StaticHContainer(
                    {
                        x: -144,
                        y: (-(50 / 2)) + 20 + 15,

                        alignFromCenterX: true,
                        alignFromCenterY: true,
                    },
                ),
                [
                    new Button(
                        {
                            w: 42,
                            h: 14,
                        },
                        [
                            new Text(
                                {
                                    x: 0,
                                    y: 0,
                                },
                                "Garden",
                                50,
                            ),
                        ],
                        () => {
                            this.biome = Biome.Garden;
                        },
                        "#2ba35b",
                        true,
                    ),
                    new StaticSpace(5, 0),
                    new Button(
                        {
                            w: 42,
                            h: 14,
                        },
                        [
                            new Text(
                                {
                                    x: 0,
                                    y: 0,
                                },
                                "Desert",
                                50,
                            ),
                        ],
                        () => {
                            this.biome = Biome.Desert;
                        },
                        "#ccba73",
                        true,
                    ),
                    new StaticSpace(5, 0),
                    new Button(
                        {
                            w: 42,
                            h: 14,
                        },
                        [
                            new Text(
                                {
                                    x: 0,
                                    y: 0,
                                },
                                "Ocean",
                                50,
                            ),
                        ],
                        () => {
                            this.biome = Biome.Ocean;
                        },
                        "#6089b6",
                        true,
                    ),
                ],
            );

            // TODO: move biomeSwitchers, readyButton too

            const makePlayerProfileColumn = (i: number): PlayerProfile => {
                return new PlayerProfile(
                    {
                        w: 74.45,
                        h: 120,
                    },
                    () => this.waveRoomPlayers[i]?.id,
                    () => this.waveRoomPlayers[i]?.name,
                    () => this.waveRoomPlayers[i]?.readyState,
                    () => this.waveRoomPlayers[i] == undefined,
                );
            };

            let codeInput: TextInput;

            this.squadMenuContainer = this.createAddableContainer(
                new (DynamicLayoutable(StaticPanelContainer))(
                    {
                        x: -175,
                        y: -100,

                        alignFromCenterX: true,
                        alignFromCenterY: true,
                    },
                    "#5aa0db",
                ),
                [
                    (this.statusText = new Text(
                        {
                            x: 162,
                            y: 110,
                        },
                        () => this.statusTextRef,
                        14,
                    )),

                    (this.playerProfileContainer = this.createAddableContainer(
                        new StaticHContainer(
                            {
                                x: 9,
                                y: 50,
                            },
                        ),
                        [
                            makePlayerProfileColumn(0),
                            new StaticSpace(5.5, 0),
                            makePlayerProfileColumn(1),
                            new StaticSpace(5.5, 0),
                            makePlayerProfileColumn(2),
                            new StaticSpace(5.5, 0),
                            makePlayerProfileColumn(3),
                        ],
                    )),

                    new Button(
                        {
                            x: 316 - 0.5,
                            y: 1 + 0.5,
                            w: 15,
                            h: 15,
                        },
                        [
                            new SVGLogo(
                                {
                                    x: 0,
                                    y: 0,
                                    w: 10,
                                    h: 10,
                                },
                                CROSS_ICON_SVG,
                            ),
                        ],
                        () => {
                            this.squadMenuContainer.setVisible(false, true, AnimationType.Zoom);

                            readyToggle = false;

                            this.resetWaveState();

                            this.statusTextRef = StatusText.Loading;

                            clientWebsocket.packetServerbound.sendWaveRoomLeave();
                        },
                        "#bb5555",
                        true,
                    ),
                    new CoordinatedStaticSpace(15, 15, 317, 196),

                    (this.publicToggle = new Toggle(
                        {
                            x: 11,
                            y: 24,
                            w: 15,
                            h: 15,
                        },
                        (t: boolean): void => clientWebsocket.packetServerbound.sendWaveRoomChangeVisible(
                            t
                                ? WaveRoomVisibleState.Public
                                : WaveRoomVisibleState.Private,
                        ),
                    )),
                    new Text(
                        {
                            x: 46,
                            y: 24 + 8,
                        },
                        "Public",
                        10,
                    ),

                    new Text(
                        () => ({
                            x:
                                this.waveRoomVisible === WaveRoomVisibleState.Private
                                    ? 103
                                    : 117,
                            y: 24 + 8,
                            w: 0,
                            h: 0,
                        }),
                        () =>
                            this.waveRoomVisible === WaveRoomVisibleState.Private
                                ? "Private squad"
                                : this.waveRoomVisible === WaveRoomVisibleState.Public
                                    ? "Waiting for players..."
                                    : "",
                        8,
                        () =>
                            this.waveRoomVisible === WaveRoomVisibleState.Private
                                ? "#f0666b"
                                : "#ffffff",
                    ),

                    // Code inputer
                    (codeInput = new TextInput(
                        {
                            x: 187,
                            y: 183,
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
                            placeHolderDisplayUnfocusedState: false,

                            borderColor: "#000000",
                            borderRadius: 2,
                            borderWidth: 2,
                            maxlength: 20,

                            padding: 1,
                        },
                    )),
                    new Button(
                        {
                            x: 274,
                            y: 183 + 1,
                            w: 50,
                            h: 18,
                        },
                        [
                            new Text(
                                {
                                    x: 0,
                                    y: 0,
                                },
                                "Join",
                                10,
                            ),
                        ],
                        () => clientWebsocket.packetServerbound.sendWaveRoomJoin(codeInput.value),
                        "#1dd129",
                        () => isWaveRoomCode(codeInput.value),
                    ),

                    new Button(
                        {
                            x: 195,
                            y: 24,
                            w: 72,
                            h: 18,
                        },
                        [
                            new Text(
                                {
                                    x: 0,
                                    y: 0,
                                },
                                "Find public",
                                10,
                            ),
                        ],
                        () => clientWebsocket.packetServerbound.sendWaveRoomFindPublic(this.biome),
                        "#5aa0db",
                        true,
                    ),
                    new Button(
                        {
                            x: 274,
                            y: 24,
                            w: 50,
                            h: 18,
                        },
                        [
                            new Text(
                                {
                                    x: 0,
                                    y: 0,
                                },
                                "New",
                                10,
                            ),
                        ],
                        () => clientWebsocket.packetServerbound.sendWaveRoomCreate(this.biome),
                        "#5aa0db",
                        true,
                    ),

                    (this.codeText = new Text(
                        {
                            x: 10,
                            y: 193,
                        },
                        () => "Code: " + (this.waveRoomCode || ""),
                        9,
                        "#ffffff",
                        "left",
                    )),

                    new Text(
                        {
                            x: 162,
                            y: 10,
                        },
                        "Squad",
                        14,
                    ),
                ],
            );

            this.onLoadedComponents.push(nameInputDescription);
            this.onLoadedComponents.push(nameInput);
            this.onLoadedComponents.push(readyButton);
            this.onLoadedComponents.push(squadButton);
            this.onLoadedComponents.push(biomeSwitcher);

            nameInputDescription.setVisible(false, false);
            nameInput.setVisible(false, false);
            readyButton.setVisible(false, false);
            squadButton.setVisible(false, false);
            biomeSwitcher.setVisible(false, false);
            this.squadMenuContainer.setVisible(false, false);

            this.addComponent(nameInputDescription);
            this.addComponent(nameInput);
            this.addComponent(readyButton);
            this.addComponent(squadButton);
            this.addComponent(biomeSwitcher);
            this.addComponent(this.squadMenuContainer);

            nameInputDescription.addCollidableComponents([this.squadMenuContainer, nameInput]);
            gameNameText.addCollidableComponents([this.squadMenuContainer, nameInputDescription]);

            nameInput.addCollidableComponents([this.squadMenuContainer]);
            readyButton.addCollidableComponents([this.squadMenuContainer]);

            this.toggleShowStatusText(true);
        }

        this.addComponent(gameNameText);
    }

    override animationFrame() {
        const canvas = this.canvas;
        const ctx = canvas.getContext("2d");

        const widthRelative = this.canvas.width / uiScaleFactor;
        const heightRelative = this.canvas.height / uiScaleFactor;

        // Render background tilesets
        this.wavedBackgroundRendererBiome.render({
            canvas,
            tileset: BIOME_TILESETS.get(this.biome),
            tilesetSize: 350,
        });

        backgroundEntities.forEach((v) => {
            if (v.x > widthRelative + 25) {
                backgroundEntities.delete(v);
            }
        });

        if (Date.now() - this.lastBackgroundEntitySpawn > 250) {
            const spawnableMobTypes = [
                PETAL_TYPES,
                // MOB_TYPES,
            ].flat();

            const backgroundEntityType = spawnableMobTypes[Math.floor(Math.random() * spawnableMobTypes.length)];

            const backgroundEntity = new Mob(
                true,
                -1,
                1,
                randomFloat(-100, (this.canvas.height / uiScaleFactor) + 100),
                1,
                1,
                1,
                backgroundEntityType,
                Rarity.Common,
                false,
                false,
            );

            if (isPetal(backgroundEntityType)) {
                backgroundEntity.nSize = backgroundEntity.size = randomFloat(0.7, 1.8) * 5;
            } else {
                backgroundEntity.nSize = backgroundEntity.size = Math.random() * 30 + 25;
            }

            backgroundEntity.x = -backgroundEntity.size * 2;

            backgroundEntity.moveSpeed = (Math.random() * 16 + 16) * backgroundEntity.nSize * 0.02;
            backgroundEntity.angleSpeed = Math.random() * 0.1 + 0.2;

            backgroundEntities.add(backgroundEntity);

            this.lastBackgroundEntitySpawn = Date.now();
        }

        const s3 = Math.min(100, deltaTime) / 60;

        Array.from(backgroundEntities.values()).toSorted((a, b) => a.size + b.size).forEach(e => {
            renderEntity(ctx, e);

            e.x += e.moveSpeed * s3;
            e.y += Math.sin(e.angle * 0.2) * 1.5 * s3;
            e.angle += e.angleSpeed * s3;
            e.moveCounter += deltaTime * 0.002;
        });

        // Ocean pattern background
        if (this.biome === Biome.Ocean && oceanBackgroundPatternTileset) {
            ctx.save();

            ctx.globalAlpha = 0.3;

            this.wavedBackgroundRendererOceanPattern.render({
                canvas,
                tileset: [oceanBackgroundPatternTileset],
                tilesetSize: 350,
            });

            ctx.restore();
        }

        if (this.waveRoomVisible !== this.prevWaveRoomVisible) {
            this.publicToggle.setToggle(this.waveRoomVisible === WaveRoomVisibleState.Public);
        }
        this.prevWaveRoomVisible = this.waveRoomVisible;

        if (this.waveRoomPlayers.length) {
            this.toggleShowStatusText(false);
        } else {
            this.toggleShowStatusText(true);
        }

        this.render();
    }

    override destroy(): void {
        this.wavedBackgroundRendererBiome = this.wavedBackgroundRendererOceanPattern = null;
    }

    override onContextChanged(): void {
        cameraController.zoom = 1;
    }

    public resetWaveState() {
        this.waveRoomPlayers = [];
        this.waveRoomCode = null;
        this.waveRoomVisible = WaveRoomVisibleState.Private;
        this.waveRoomState = WaveRoomState.Waiting;
    }

    public toggleShowStatusText(t: boolean): void {
        this.statusText.setVisible(t, false);

        this.playerProfileContainer.setVisible(!t, false);
        this.codeText.setVisible(!t, false);
    }

    set biome(biome: Biome) {
        titleUiCurrentBiome = biome;
    }

    get biome(): Biome {
        return titleUiCurrentBiome;
    }
}