import Mob from "../../Entity/Mob";
import { Biome } from "../../../../../../Shared/Biome";
import { WaveRoomPlayerReadyState, WaveRoomState, WaveRoomVisibleState } from "../../../../../../Shared/WaveRoom";
import type { WaveRoomCode } from "../../../../../../Shared/WaveRoomCode";
import { isWaveRoomCode } from "../../../../../../Shared/WaveRoomCode";
import { clientWebsocket, cameraController, deltaTime, uiCtx } from "../../../../../Main";
import type { ColorCode } from "../../../../../../Shared/Utils/Color";
import { DARKENED_BASE } from "../../../../../../Shared/Utils/Color";
import { Rarity } from "../../../../../../Shared/Entity/Statics/EntityRarity";
import { PETAL_TYPES } from "../../../../../../Shared/Entity/Statics/EntityType";
import { isPetal } from "../../../../../../Shared/Entity/Dynamics/Mob/Petal/Petal";
import { renderEntity } from "../../Entity/Renderers/RendererRenderingLink";
import type { ComponentCloser, ComponentOpener, Components, FakeSetVisibleToggleType } from "../Layout/Components/Component";
import { AnimationType } from "../Layout/Components/Component";
import type { AnyStaticContainer } from "../Layout/Components/WellKnown/Container";
import { StaticPanelContainer, CoordinatedStaticSpace, StaticHContainer, StaticSpace } from "../Layout/Components/WellKnown/Container";
import Text from "../Layout/Components/WellKnown/Text";
import TextInput from "../Layout/Components/WellKnown/TextInput";
import Toggle from "../Layout/Components/WellKnown/Toggle";
import Collidable from "../Layout/Extensions/ExtensionCollidable";
import AbstractUI, { uiScaleFactor } from "../UI";
import type BinaryReader from "../../../../../../Shared/Websocket/Binary/ReadWriter/Reader/BinaryReader";
import type { ButtonCallback } from "../Layout/Components/WellKnown/Button";
import { Button } from "../Layout/Components/WellKnown/Button";
import { CanvasLogo, SVGLogo } from "../Layout/Components/WellKnown/Logo";
import UITitlePlayerProfile from "./UITitlePlayerProfile";
import UICloseButton from "../Shared/UICloseButton";
import { Clientbound } from "../../../../../../Shared/Websocket/Packet/PacketDirection";
import type { StaticAdheredClientboundHandlers } from "../../Websocket/Packet/PacketClientbound";
import DISCORD_ICON_SVG from "./Assets/discord_icon.svg";
import Tooltip from "../Layout/Extensions/ExtensionTooltip";
import { BIOME_TILESETS } from "../../Utils/Tiled/TilesetRenderer";
import TilesetWavedRenderer from "../../Utils/Tiled/TilesetWavedRenderer";
import UITitleBottomLeftButtonGroup from "./BottomLeftButtons/UITitleBottomLeftButtonGroup";
import { createTitleBottomLeftToolTippedButton } from "./BottomLeftButtons";

const TAU = Math.PI * 2;

function randomFloat(min: number, max: number) {
    return Math.random() * (max - min + 1) + min;
}

type BackgroundMob = Mob & {
    moveSpeed: number;
    angleSpeed: number;
};

const SPAWNABLE_BACKGROUND_ENTITY_TYPES = [
    PETAL_TYPES,
    // MOB_TYPES,
].flat();

const backgroundEntities: Set<BackgroundMob> = new Set();

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

function dynamicJoinArray<T, S>(array: T[], separatorFn: () => S): (T | S)[] {
    return array.flatMap((item, index) => index ? [separatorFn(), item] : [item]);
}

// TODO: send initial data of wave room instead of send 2 packets

export type WaveRoomPlayerInformation = Readonly<{
    id: number;
    name: string;
    readyState: WaveRoomPlayerReadyState;
}>;

export const enum SquadContainerStatusText {
    LOADING = "Loading...",
    CREATING = "Creating...",
    NOT_FOUND = "Squad not found",
}

export default class UITitle extends AbstractUI {
    private wavedBackgroundRendererBiome: TilesetWavedRenderer = new TilesetWavedRenderer();

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

    accessor biome: Biome = Biome.GARDEN;

    override readonly CLIENTBOUND_HANDLERS = {
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
                } as const satisfies WaveRoomPlayerInformation;
            }

            this.waveRoomPlayerInformations = waveRoomPlayerInformations;

            this.waveRoomCode = reader.readString() as WaveRoomCode;

            this.waveRoomState = reader.readUInt8() satisfies WaveRoomState;

            this.waveRoomVisible = reader.readUInt8() satisfies WaveRoomVisibleState;

            this.biome = reader.readUInt8() satisfies Biome;
        },
        [Clientbound.WAVE_STARTED]: (reader: BinaryReader): void => {
            this.squadMenuContainer.setVisible(false, null, true, AnimationType.ZOOM, {
                defaultDurationOverride: 100,
            });

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

            this.statusTextRef = SquadContainerStatusText.NOT_FOUND;
        },
    } as const satisfies StaticAdheredClientboundHandlers;

    constructor(canvas: HTMLCanvasElement) {
        super(canvas);

        document.onmouseout = this.mouseup;

        this.lastBackgroundEntitySpawn = Date.now();

        this.statusTextRef = SquadContainerStatusText.LOADING;

        setTimeout(() => {
            this.connectingText.setVisible(true, null, false);
            setTimeout(() => {
                this.connectingText.setVisible(false, null, true, AnimationType.ZOOM);
                setTimeout(() => {
                    this.loggingInText.setVisible(true, null, true, AnimationType.ZOOM);
                    setTimeout(() => {
                        this.loggingInText.setVisible(false, null, true, AnimationType.ZOOM);
                        setTimeout(() => {
                            this.onLoadedComponents.forEach(c => {
                                c.setVisible(true, null, true, AnimationType.ZOOM);
                            });
                        }, 250);
                    }, 800);
                }, 25);
            }, 1500);
        }, 1);
    }

    protected override initializeComponents(): void {
        this.resetWaveState();

        {
            this.addComponents(new UITitleBottomLeftButtonGroup(
                {
                    x: 13 + .5,
                    y: 260 - 1,

                    invertYCoordinate: true,
                },
            ));

            {
                const discordLinkButton = new (createTitleBottomLeftToolTippedButton(Button, "Link your Discord account to save your progress!", 10, "left"))(
                    {
                        x: 172,
                        y: 6,
                        w: 162,
                        h: 21,

                        invertXCoordinate: true,
                    },

                    2,

                    2,
                    1,

                    [
                        new SVGLogo(
                            {
                                x: 3,
                                y: 0,
                                w: 21,
                                h: 21,
                            },
                            DISCORD_ICON_SVG,
                            0.7,
                        ),

                        new Text(
                            {
                                x: 7,
                                y: 4,
                            },
                            "Sign in with Discord",
                            13,
                        ),
                    ],

                    () => {
                        const windowProxy = window.open("unko");
                        windowProxy.document.write('まだ実装されてないわボケー');
                    },

                    "#5865f2",
                    true,
                );

                this.addComponent(discordLinkButton);
            }
        }

        {
            // Text
            const connectingText = this.connectingText = new (Collidable(Text, "up"))(
                {
                    x: -(200 / 2),
                    y: (-(40 / 2)) - 5,

                    alignFromCenterX: true,
                    alignFromCenterY: true,
                },
                "Connecting...",
                32,
            );

            const loggingInText = this.loggingInText = new (Collidable(Text, "down"))(
                {
                    x: -(200 / 2),
                    y: (-(40 / 2)) - 5,

                    alignFromCenterX: true,
                    alignFromCenterY: true,
                },

                "Logging in...",
                32,
            );

            this.connectingText.setVisible(false, null, false);
            this.loggingInText.setVisible(false, null, false);

            loggingInText.addCollidableComponents(this.connectingText);
            connectingText.addCollidableComponents(this.loggingInText);

            this.addComponent(this.connectingText);
            this.addComponent(this.loggingInText);
        }

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

        gameNameText.addCollidableComponents(this.connectingText, this.loggingInText);

        {
            this.onLoadedComponents = [];

            const nameInputDescription = new (Collidable(Text))(
                {
                    x: -108,
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
                        { y: 2 },
                        "Ready",
                        16,
                    ),
                    new CanvasLogo(
                        {
                            w: 40,
                            h: 40,
                        },
                        (ctx: CanvasRenderingContext2D) => {
                            ctx.fillStyle = "black";
                            ctx.globalAlpha = DARKENED_BASE;

                            drawRoundedPolygon(ctx, 7, (readyButton.h / 2) - 3, 10, 90, 40, 3);

                            ctx.fill();
                        },
                    ),
                ],

                () => {
                    readyToggle = !readyToggle;

                    if (this.squadMenuContainer.visible === false) {
                        clientWebsocket.packetServerbound.sendWaveRoomFindPublic(this.biome);

                        this.squadMenuContainer.setVisible(true, <ComponentOpener><unknown>readyButton, true, AnimationType.ZOOM, {
                            defaultDurationOverride: 100,
                        });

                        this.statusTextRef = SquadContainerStatusText.CREATING;

                        clientWebsocket.packetServerbound.sendWaveRoomChangeReady(WaveRoomPlayerReadyState.READY);
                    } else {
                        clientWebsocket.packetServerbound.sendWaveRoomChangeReady(
                            readyToggle
                                ? WaveRoomPlayerReadyState.READY
                                : WaveRoomPlayerReadyState.PREPARING,
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
                        { y: 2 },

                        "Squad",
                        13,
                    ),
                    new CanvasLogo(
                        {
                            w: 40,
                            h: 40,
                        },

                        (ctx: CanvasRenderingContext2D) => {
                            ctx.fillStyle = "black";
                            ctx.globalAlpha = DARKENED_BASE;

                            drawRoundedPolygon(ctx, 5, (squadButton.h / 2) - 3, 10 - 1, 90, 40, 4);

                            ctx.fill();
                        },
                    ),
                ],

                () => {
                    clientWebsocket.packetServerbound.sendWaveRoomCreate(this.biome);

                    this.squadMenuContainer.setVisible(true, <ComponentOpener><unknown>squadButton, true, AnimationType.ZOOM, {
                        defaultDurationOverride: 100,
                    });

                    this.statusTextRef = SquadContainerStatusText.CREATING;

                    clientWebsocket.packetServerbound.sendWaveRoomChangeVisible(WaveRoomVisibleState.PRIVATE);
                },

                "#5a9fdb",
                true,
            );

            const makeBiomeSwitchButton = (
                biomeName: string,

                color: ColorCode,

                callback: ButtonCallback,
            ): Button => {
                return new Button(
                    {
                        w: 42,
                        h: 11,
                    },

                    3,

                    3,
                    1,

                    [
                        new Text(
                            {},
                            biomeName,
                            10,
                        ),
                    ],

                    callback,

                    color,

                    true,
                );
            };

            const biomeSwitcher = new StaticHContainer(
                {
                    x: -144,
                    y: (-(50 / 2)) + 20 + 15,

                    alignFromCenterX: true,
                    alignFromCenterY: true,
                },
            ).addChildren(...dynamicJoinArray(
                [
                    makeBiomeSwitchButton("Garden", "#2ba35b", () => {
                        this.biome = Biome.GARDEN;
                    }),
                    makeBiomeSwitchButton("Desert", "#ccba73", () => {
                        this.biome = Biome.DESERT;
                    }),
                    makeBiomeSwitchButton("Ocean", "#6089b6", () => {
                        this.biome = Biome.OCEAN;
                    }),
                ],
                // Dynamically create static space
                () => new StaticSpace(5, 0),
            ));

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

            let squadMenuCloser: UICloseButton;

            this.squadMenuContainer = new StaticPanelContainer(
                {
                    x: -170,
                    y: -100,

                    alignFromCenterX: true,
                    alignFromCenterY: true,
                },

                false,

                "#5aa0db",

                1,

                4,
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

                (squadMenuCloser = new UICloseButton(
                    {
                        x: 318 - 1,
                        y: 1 + 0.5,
                    },
                    10,

                    () => {
                        this.squadMenuContainer.setVisible(false, <ComponentCloser><unknown>squadMenuCloser, true, AnimationType.ZOOM, {
                            defaultDurationOverride: 100,
                        });

                        readyToggle = false;

                        this.resetWaveState();

                        this.statusTextRef = SquadContainerStatusText.LOADING;

                        clientWebsocket.packetServerbound.sendWaveRoomLeave();
                    },
                )),

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
                            ? WaveRoomVisibleState.PUBLIC
                            : WaveRoomVisibleState.PRIVATE,
                    ),
                )),
                new Text(
                    {
                        x: 26,
                        y: 26,
                    },

                    "Public",
                    10,
                ),

                new Text(
                    () => ({
                        x: 75,
                        y: 31,
                        w: 0,
                        h: 0,
                    }),

                    () =>
                        this.waveRoomVisible === WaveRoomVisibleState.PRIVATE
                            ? "Private squad"
                            : this.waveRoomVisible === WaveRoomVisibleState.PUBLIC
                                ? "Waiting for players..."
                                : "",
                    8,
                    () =>
                        this.waveRoomVisible === WaveRoomVisibleState.PRIVATE
                            ? "#f0666b"
                            : "#ffffff",
                    "left",
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
                        w: 46,
                        h: 13,
                    },

                    2,

                    2.4,
                    1,

                    [
                        new Text(
                            {
                                x: 7,
                                y: 1,
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
                        x: 208,
                        y: 26,
                        w: 62,
                        h: 12,
                    },

                    2,

                    2.4,
                    1,

                    [
                        new Text(
                            {
                                x: 3,
                                y: 1,
                            },
                            "Find Public",
                            9,
                        ),
                    ],

                    () => clientWebsocket.packetServerbound.sendWaveRoomFindPublic(this.biome),

                    "#5aa0db",
                    true,
                ),
                new Button(
                    {
                        x: 280,
                        y: 26,
                        w: 40,
                        h: 12,
                    },

                    2,

                    2.4,
                    1,

                    [
                        new Text(
                            {
                                x: 5,
                                y: 1,
                            },
                            "New",
                            9,
                        ),
                    ],

                    () => clientWebsocket.packetServerbound.sendWaveRoomCreate(this.biome),

                    "#5aa0db",
                    true,
                ),

                this.codeText = (() => {
                    const DEFAULT_TOOLTIP_LABEL: string = "Copy";
                    const RESET_DELAY: number = 1500;

                    let tooltipLabel: string = DEFAULT_TOOLTIP_LABEL;
                    let resetTimer: NodeJS.Timeout | null = null;

                    const codeText = new (
                        Tooltip(
                            Text,

                            [
                                new CoordinatedStaticSpace(1, 1, 0, 0),
                                new Text(
                                    {
                                        x: 1,
                                        y: 3,
                                    },

                                    () => tooltipLabel,
                                    9,
                                ),
                                new CoordinatedStaticSpace(1, 1, 0, 15),
                            ],
                            2,
                            "top",
                            2,
                            false,
                        )
                    )(
                        {
                            x: 10,
                            y: 187,
                        },

                        () => "Code: " + (this.waveRoomCode || ""),
                        9,
                        "#ffffff",
                        "left",

                        null,

                        true,
                        () => this.waveRoomCode || "",
                    );

                    const resetTooltip = () => {
                        if (resetTimer) clearTimeout(resetTimer);

                        resetTimer = setTimeout(() => {
                            tooltipLabel = DEFAULT_TOOLTIP_LABEL;
                            resetTimer = null;
                        }, RESET_DELAY);
                    };

                    codeText.addListener("onCopySucceed", () => {
                        tooltipLabel = "Copied!";
                        resetTooltip();
                    });

                    codeText.addListener("onCopyFailed", () => {
                        tooltipLabel = "Failed...";
                        resetTooltip();
                    });

                    return codeText;
                })(),

                new Text(
                    {
                        x: 140,
                        y: 3,
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

            nameInputDescription.setVisible(false, null, false);
            nameInput.setVisible(false, null, false);
            readyButton.setVisible(false, null, false);
            squadButton.setVisible(false, null, false);
            biomeSwitcher.setVisible(false, null, false);
            this.squadMenuContainer.setVisible(false, null, false);

            this.addComponents(
                nameInputDescription,
                nameInput,
                readyButton,
                squadButton,
                biomeSwitcher,
                this.squadMenuContainer,
            );

            nameInputDescription.addCollidableComponents(this.squadMenuContainer, nameInput);
            gameNameText.addCollidableComponents(this.squadMenuContainer, nameInputDescription);

            nameInput.addCollidableComponents(this.squadMenuContainer);
            readyButton.addCollidableComponents(this.squadMenuContainer);

            this.toggleShowStatusText(true);
        }

        this.addComponent(gameNameText);
    }

    override render() {
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
            const backgroundEntityType = SPAWNABLE_BACKGROUND_ENTITY_TYPES[Math.floor(Math.random() * SPAWNABLE_BACKGROUND_ENTITY_TYPES.length)];

            const backgroundEntity = new Mob(
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
            ) as BackgroundMob;

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
            renderEntity({
                ctx,
                entity: e,
                isSpecimen: true,
            });

            e.x += e.moveSpeed * s3;
            e.y += Math.sin(e.angle * 0.2) * 1.5 * s3;
            e.angle += e.angleSpeed * s3;
            e.moveCounter += deltaTime * 0.002;
        });

        if (this.waveRoomVisible !== this.prevWaveRoomVisible) {
            this.publicToggle.setToggle(this.waveRoomVisible === WaveRoomVisibleState.PUBLIC);
        }
        this.prevWaveRoomVisible = this.waveRoomVisible;

        if (this.waveRoomPlayerInformations.length) {
            this.toggleShowStatusText(false);
        } else {
            this.toggleShowStatusText(true);
        }

        this.renderComponents();
    }

    override destroy(): void {
        super.destroy();

        this.wavedBackgroundRendererBiome = null;
    }

    override onContextChanged(): void {
        cameraController.zoom = 1;

        document.onmouseout = null;
    }

    public resetWaveState() {
        this.waveRoomPlayerInformations = [];
        this.waveRoomCode = null;
        this.waveRoomVisible = WaveRoomVisibleState.PRIVATE;
        this.waveRoomState = WaveRoomState.WAITING;
    }

    public toggleShowStatusText(toggle: boolean): void {
        if (this.statusText.visible !== toggle) this.statusText.setVisible(<FakeSetVisibleToggleType>toggle, null, false);

        if (this.playerProfileContainer.visible !== !toggle) this.playerProfileContainer.setVisible(<FakeSetVisibleToggleType>!toggle, null, false);
        if (this.codeText.visible !== !toggle) this.codeText.setVisible(<FakeSetVisibleToggleType>!toggle, null, false);
    }
}