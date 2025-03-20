import Mob from "../../Entity/Mob";
import { Biome } from "../../../../../../Shared/Biome";
import { WaveRoomPlayerReadyState, WaveRoomState, WaveRoomVisibleState } from "../../../../../../Shared/WaveRoom";
import type { WaveRoomCode } from "../../../../../../Shared/WaveRoomCode";
import { isWaveRoomCode } from "../../../../../../Shared/WaveRoomCode";
import { clientWebsocket, cameraController, deltaTime, uiCtx } from "../../../../../Main";
import { DARKEND_BASE } from "../../../../../../Shared/Utils/Color";
import { Rarity } from "../../../../../../Shared/Entity/Statics/EntityRarity";
import { PETAL_TYPES } from "../../../../../../Shared/Entity/Statics/EntityType";
import { isPetal } from "../../../../../../Shared/Entity/Dynamics/Mob/Petal/Petal";
import { renderEntity } from "../../Entity/Renderers/RendererEntityRenderingLink";
import type { FlooooIoDefaultSettingKeys } from "../../Utils/SettingStorage";
import SettingStorage from "../../Utils/SettingStorage";
import type { Components } from "../Layout/Components/Component";
import { AnimationType } from "../Layout/Components/Component";
import type { AnyStaticContainer } from "../Layout/Components/WellKnown/Container";
import { StaticPanelContainer, CoordinatedStaticSpace, StaticHContainer, StaticSpace, StaticTranslucentPanelContainer } from "../Layout/Components/WellKnown/Container";
import Text from "../Layout/Components/WellKnown/Text";
import TextInput from "../Layout/Components/WellKnown/TextInput";
import Toggle from "../Layout/Components/WellKnown/Toggle";
import Collidable from "../Layout/Extensions/ExtensionCollidable";
import AbstractUI, { uiScaleFactor } from "../UI";
import type BinaryReader from "../../../../../../Shared/Websocket/Binary/ReadWriter/Reader/BinaryReader";
import { Button } from "../Layout/Components/WellKnown/Button";
import { CanvasLogo, SVGLogo } from "../Layout/Components/WellKnown/Logo";
import { BIOME_TILESETS, oceanBackgroundPatternTileset } from "../Shared/Tiled/TilesetRenderer";
import TilesetWavedRenderer from "../Shared/Tiled/TilesetWavedRenderer";
import UITitlePlayerProfile from "./UITitlePlayerProfile";
import UICloseButton from "../Shared/UICloseButton";
import { Clientbound } from "../../../../../../Shared/Websocket/Packet/PacketDirection";
import type { StaticAdherableClientboundHandler } from "../../Websocket/Packet/PacketClientbound";
import SWAP_BAG_SVG from "./Assets/swap_bag.svg";
import MOLECULE_SVG from "./Assets/molecule.svg";
import SCROLL_UNFURLED_SVG from "./Assets/scroll_unfurled.svg";
import DISCORD_ICON_SVG from "./Assets/discord_icon.svg";
import Tooltip from "../Layout/Extensions/ExtensionTooltip";

const TAU = Math.PI * 2;

function randomFloat(min: number, max: number) {
    return Math.random() * (max - min + 1) + min;
}

const backgroundEntities: Set<Mob> = new Set();

/**
 * Current ui of title.
 */
let titleUiCurrentBiome: Biome = Biome.GARDEN;

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

    const corners: Array<Array<number>> = new Array(numberOfCorners);

    for (let i = 0; i < numberOfCorners; i++) corners[i] = getPolygonCorner(i, numberOfCorners);

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

export const enum SquadContainerStatusText {
    SQUAD_LOADING = "Loading...",
    SQUAD_CREATING = "Creating...",
    SQUAD_NOT_FOUND = "Squad not found",
}

export default class UITitle extends AbstractUI {
    private wavedBackgroundRendererBiome: TilesetWavedRenderer = new TilesetWavedRenderer();
    private wavedBackgroundRendererOceanPattern: TilesetWavedRenderer = new TilesetWavedRenderer();

    private lastBackgroundEntitySpawn: number;

    private connectingText: Text;
    private loggingInText: Text;
    private onLoadedComponents: Components[];

    // Make this public to close this from networking
    private squadMenuContainer: AnyStaticContainer;

    private publicToggle: Toggle;

    private statusText: Text;
    private statusTextRef: SquadContainerStatusText;

    private playerProfileContainer: AnyStaticContainer;

    private codeText: Text;

    // Wave informations

    private waveRoomPlayerInformations: Array<WaveRoomPlayerInformation>;
    private waveRoomCode: WaveRoomCode | null;
    private waveRoomState: WaveRoomState;
    private waveRoomVisible: WaveRoomVisibleState;
    private prevWaveRoomVisible: WaveRoomVisibleState;

    // Network dynamics

    public waveRoomSelfId: number = -1;

    override readonly clientboundHandler: StaticAdherableClientboundHandler = {
        [Clientbound.WAVE_ROOM_SELF_ID]: (reader: BinaryReader): void => {
            this.waveRoomSelfId = reader.readUInt32();
        },
        [Clientbound.WAVE_ROOM_UPDATE]: (reader: BinaryReader): void => {
            const waveClientCount = reader.readUInt8();

            const waveRoomPlayerInformations: Array<WaveRoomPlayerInformation> = new Array(waveClientCount);

            for (let i = 0; i < waveClientCount; i++) {
                const id = reader.readUInt32();

                const name = reader.readString() || "Unnamed";

                const readyState = reader.readUInt8() satisfies WaveRoomPlayerReadyState;

                waveRoomPlayerInformations[i] = {
                    id,
                    name,
                    readyState,
                } satisfies WaveRoomPlayerInformation;
            }

            const waveRoomCode = reader.readString() as WaveRoomCode;

            const waveRoomBiome = reader.readUInt8() satisfies Biome;

            const waveRoomState = reader.readUInt8() satisfies WaveRoomState;

            const waveRoomVisibleState = reader.readUInt8() satisfies WaveRoomVisibleState;

            this.waveRoomPlayerInformations = waveRoomPlayerInformations;
            this.waveRoomCode = waveRoomCode;
            this.waveRoomState = waveRoomState;
            this.waveRoomVisible = waveRoomVisibleState;

            this.biome = waveRoomBiome;
        },
        [Clientbound.WAVE_STARTED]: (reader: BinaryReader): void => {
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
        [Clientbound.WAVE_ROOM_JOIN_FAILED]: (reader: BinaryReader): void => {
            // Reset squad state to render status text
            this.resetWaveState();

            this.statusTextRef = SquadContainerStatusText.SQUAD_NOT_FOUND;
        },
    } as const;

    constructor(canvas: HTMLCanvasElement) {
        super(canvas);

        this.lastBackgroundEntitySpawn = Date.now();

        this.statusTextRef = SquadContainerStatusText.SQUAD_LOADING;

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

        {
            const makeLowerLeftToolTippedButton = (desc: string) => {
                return Tooltip(
                    Button,
                    [
                        new CoordinatedStaticSpace(1, 1, 0, 0),
                        new Text(
                            {
                                x: 0,
                                y: 4,
                            },
                            desc,
                            11,
                        ),
                        new CoordinatedStaticSpace(1, 1, 0, 20),
                    ],
                    6,
                    ["right"] as const,
                );
            };

            {
                const discordButton = new (makeLowerLeftToolTippedButton("Join our Discord community!"))(
                    {
                        x: 15,
                        y: 286,
                        w: 40,
                        h: 40,

                        invertYCoordinate: true,
                    },

                    3,

                    3,
                    1,

                    [
                        new SVGLogo(
                            {
                                x: 0,
                                y: 0,
                                w: 40,
                                h: 40,
                            },
                            DISCORD_ICON_SVG,
                            0.7,
                        ),
                    ],

                    () => {
                        const windowProxy = window.open("unko");
                        windowProxy.document.write('まだ実装されてないわボケー');
                    },

                    "#5865f2",
                    true,
                );

                this.addComponent(discordButton);
            }

            {
                const makeSettingComponents = (y: number, storageKey: FlooooIoDefaultSettingKeys, description: string): [
                    Toggle,
                    Text,
                ] => {
                    const settingToggle = new Toggle(
                        {
                            x: 5,
                            y: y - 1,
                            w: 17,
                            h: 17,
                        },
                        (t: boolean): void => {
                            settingToggle.setToggle(t);

                            SettingStorage.set(storageKey, t);
                        },
                    )
                        // Load existed setting
                        .setToggle(SettingStorage.get(storageKey));

                    return [
                        settingToggle,
                        new Text(
                            {
                                x: 26,
                                y,
                            },
                            description,
                            11,
                        ),
                    ];
                };

                const settingContainer = new StaticPanelContainer(
                    {
                        x: 72,
                        y: 225,

                        invertYCoordinate: true,
                    },
                    "#aaaaaa",
                    0.1,
                ).addChildren(
                    new UICloseButton(
                        {
                            x: 150 - 4,
                            y: 2,
                        },
                        12,

                        () => {
                            settingIsOpen = false;

                            settingContainer.setVisible(settingIsOpen, true, AnimationType.Slide, "v");
                        },
                    ),

                    new Text(
                        {
                            x: 44,
                            y: 4,
                        },
                        "Settings",
                        16,
                    ),

                    // Keyboard movement
                    ...makeSettingComponents(40, "keyboard_control", "Keyboard movement"),

                    // Movement helper
                    ...makeSettingComponents(40 + 30, "movement_helper", "Movement helper"),

                    new CoordinatedStaticSpace(15, 15, 150, 190 - 4),
                );

                let settingIsOpen = false;

                const settingButton = new (makeLowerLeftToolTippedButton("Inventory"))(
                    {
                        x: 15,
                        y: 229,
                        w: 40,
                        h: 40,

                        invertYCoordinate: true,
                    },

                    3,

                    3,
                    1,

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

                this.addComponent(settingContainer);

                this.addComponent(settingButton);
            }

            {
                const craftButton = new (makeLowerLeftToolTippedButton("Crafting"))(
                    {
                        x: 15,
                        y: 173,
                        w: 40,
                        h: 40,

                        invertYCoordinate: true,
                    },

                    3,

                    3,
                    1,

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
            }

            {
                const changelogButton = new (makeLowerLeftToolTippedButton("Changelog"))(
                    {
                        x: 15,
                        y: 116,
                        w: 40,
                        h: 40,

                        invertYCoordinate: true,
                    },

                    3,

                    3,
                    1,

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
            }
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

        this.addComponents(this.connectingText);
        this.addComponents(this.loggingInText);

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
                    y: (-(50 / 2)) + 4,
                    w: 76,
                    h: 21,

                    alignFromCenterX: true,
                    alignFromCenterY: true,
                },

                4,

                3,
                1,

                [
                    new Text(
                        {
                            x: 0,
                            y: 1,
                        },
                        "Ready",
                        16,
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

                            drawRoundedPolygon(ctx, 7, (readyButton.h / 2) - 3, 10, 90, 40, 3);

                            ctx.fill();
                        },
                    ),
                ],

                () => {
                    readyToggle = !readyToggle;

                    if (this.squadMenuContainer.visible === false) {
                        clientWebsocket.packetServerbound.sendWaveRoomFindPublic(this.biome);

                        this.squadMenuContainer.setVisible(true, true, AnimationType.Zoom);

                        this.statusTextRef = SquadContainerStatusText.SQUAD_CREATING;

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
                    y: (-(50 / 2)) + 20 + 17,
                    w: 63,
                    h: 18,

                    alignFromCenterX: true,
                    alignFromCenterY: true,
                },

                4,

                3,
                1,

                [
                    new Text(
                        {
                            x: 0,
                            y: 1,
                        },
                        "Squad",
                        13,
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

                            drawRoundedPolygon(ctx, 5, (squadButton.h / 2) - 3, 10 - 1, 90, 40, 4);

                            ctx.fill();
                        },
                    ),
                ],

                () => {
                    clientWebsocket.packetServerbound.sendWaveRoomCreate(this.biome);

                    this.squadMenuContainer.setVisible(true, true, AnimationType.Zoom);

                    this.statusTextRef = SquadContainerStatusText.SQUAD_CREATING;

                    clientWebsocket.packetServerbound.sendWaveRoomChangeVisible(WaveRoomVisibleState.Private);
                },

                "#5a9fdb",
                true,
            );

            const biomeSwitcher = new StaticHContainer(
                {
                    x: -144,
                    y: (-(50 / 2)) + 20 + 15,

                    alignFromCenterX: true,
                    alignFromCenterY: true,
                },
            ).addChildren(
                new Button(
                    {
                        w: 42,
                        h: 14,
                    },

                    2,

                    10,
                    0.05,

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
                        this.biome = Biome.GARDEN;
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

                    2,

                    10,
                    0.05,

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
                        this.biome = Biome.DESERT;
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

                    2,

                    10,
                    0.05,

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
                        this.biome = Biome.OCEAN;
                    },

                    "#6089b6",
                    true,
                ),
            );

            // TODO: move biomeSwitchers, readyButton too

            const makePlayerProfileColumn = (i: number): UITitlePlayerProfile => {
                return new UITitlePlayerProfile(
                    {
                        w: 74.45,
                        h: 120,
                    },
                    () => this.waveRoomPlayerInformations[i]?.id,
                    () => this.waveRoomPlayerInformations[i]?.name,
                    () => this.waveRoomPlayerInformations[i]?.readyState,
                    () => this.waveRoomPlayerInformations[i] == undefined,
                );
            };

            let codeInput: TextInput;

            this.squadMenuContainer = new StaticPanelContainer(
                {
                    x: -172,
                    y: -100,

                    alignFromCenterX: true,
                    alignFromCenterY: true,
                },
                "#5aa0db",
            ).addChildren(
                (this.statusText = new Text(
                    {
                        x: 162,
                        y: 110,
                    },
                    () => this.statusTextRef,
                    14,
                )),

                (
                    this.playerProfileContainer = new StaticHContainer(
                        {
                            x: 9,
                            y: 50,
                        },
                    ).addChildren(
                        makePlayerProfileColumn(0),
                        new StaticSpace(5.5, 0),
                        makePlayerProfileColumn(1),
                        new StaticSpace(5.5, 0),
                        makePlayerProfileColumn(2),
                        new StaticSpace(5.5, 0),
                        makePlayerProfileColumn(3),
                    )
                ),

                new UICloseButton(
                    {
                        x: 318 - 1,
                        y: 1 + 0.5,
                    },
                    10,

                    () => {
                        this.squadMenuContainer.setVisible(false, true, AnimationType.Zoom);

                        readyToggle = false;

                        this.resetWaveState();

                        this.statusTextRef = SquadContainerStatusText.SQUAD_LOADING;

                        clientWebsocket.packetServerbound.sendWaveRoomLeave();
                    },
                ),
                new CoordinatedStaticSpace(15, 15, 318, 196),

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

                    2,

                    10,
                    0.05,

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

                    2,

                    10,
                    0.05,

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

                    2,

                    10,
                    0.05,

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

            this.addComponents(nameInputDescription);
            this.addComponents(nameInput);
            this.addComponents(readyButton);
            this.addComponents(squadButton);
            this.addComponents(biomeSwitcher);
            this.addComponents(this.squadMenuContainer);

            nameInputDescription.addCollidableComponents([this.squadMenuContainer, nameInput]);
            gameNameText.addCollidableComponents([this.squadMenuContainer, nameInputDescription]);

            nameInput.addCollidableComponents([this.squadMenuContainer]);
            readyButton.addCollidableComponents([this.squadMenuContainer]);

            this.toggleShowStatusText(true);
        }

        this.addComponents(gameNameText);
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
                Rarity.COMMON,
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
        if (this.biome === Biome.OCEAN && oceanBackgroundPatternTileset) {
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

        if (this.waveRoomPlayerInformations.length) {
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
        this.waveRoomPlayerInformations = [];
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