import Mob from "../../Entity/Mob";
import Player from "../../Entity/Player";
import { renderEntity } from "../../Entity/Renderers/RendererRenderingLink";
import { interpolate } from "../../Utils/Interpolator";
import AbstractUI, { uiScaleFactor } from "../UI";
import SettingStorage from "../../Utils/SettingStorage";
import StaticText from "../Layout/Components/WellKnown/StaticText";
import TextInput from "../Layout/Components/WellKnown/TextInput";
import type { Rarity } from "../../Native/Rarity";
import { Button } from "../Layout/Components/WellKnown/Button";
import type { StaticAdheredClientboundHandlers } from "../../Websocket/Packet/PacketClientbound";
import UICloseButton from "../Shared/UICloseButton";
import type { AnimationConfigOf, ComponentCloser, DummySetVisibleToggleType } from "../Layout/Components/Component";
import { AnimationType, renderPossibleComponent } from "../Layout/Components/Component";
import { CoordinatedStaticSpace, StaticSpace, StaticTranslucentPanelContainer, StaticVContainer } from "../Layout/Components/WellKnown/Container";
import { InlineRendering } from "../Layout/Extensions/ExtensionInlineRendering";
import UIGameWaveMobIcons from "./UIGameWaveMobIcons";
import UIGameInventory from "./UIGameInventory";
import { Centering } from "../Layout/Extensions/ExtensionCentering";
import Gauge from "../Layout/Components/WellKnown/Gauge";
import UIGameOtherPlayerStatus from "./UIGameOtherPlayerStatus";
import TilesetRenderer, { BIOME_TILESETS } from "../../Utils/Tile/Tileset/TilesetRenderer";
import UIGamePlayerStatuses from "./UIGamePlayerStatuses";
import { MoodFlags } from "../../Native/Entity/Player/PlayerMood";
import { clientWebsocket, deltaTime, antennaScaleFactor, uiCtx } from "../../../../Main";
import { isPetal } from "../../Entity/Petal";
import type BinaryReader from "../../Websocket/Binary/ReadWriter/Reader/BinaryReader";
import { Clientbound } from "../../Websocket/Packet/PacketOpcode";
import { Biome, BIOME_DISPLAY_NAME, BIOME_GAUGE_COLORS } from "../../Native/Biome";

let interpolatedMouseX = 0;
let interpolatedMouseY = 0;

let mouseXOffset = 0;
let mouseYOffset = 0;

const TAU = Math.PI * 2;

function angleToRad(angle: number) {
    return angle / 255 * TAU;
}

/**
 * Calculate wave length.
 * 
 * @param x - Wave progress
 */
export const calculateWaveLength = (x: number) => Math.max(60, x ** 0.2 * 18.9287 + 30);

interface LightningBounce {
    points: Array<[number, number]>;
    t: number;

    path?: Path2D;
}

function prepareLightningBouncePath({ points }: LightningBounce): Path2D {
    const path = new Path2D();

    const addRandomOffset = (value: number, magnitude: number = 2) => {
        const randomFactor = (Math.random() - 0.5) * 2;

        return value + (randomFactor * magnitude);
    };

    // If point is just one, add distorted first point to render correctly
    if (points.length === 1) {
        const [x, y] = points[0];

        points.push([
            addRandomOffset(x),
            addRandomOffset(y),
        ]);
    }

    path.moveTo(...points[0]);

    for (let i = 0; i < points.length - 1; i++) {
        const startPoint = points[i];
        const endPoint = points[i + 1];
        const deltaX = endPoint[0] - startPoint[0];
        const deltaY = endPoint[1] - startPoint[1];
        const totalDistance = Math.hypot(deltaX, deltaY);

        let currentDistance = 0;

        while (currentDistance < totalDistance) {
            const JITTER_AMOUNT = 50;

            const ratio = currentDistance / totalDistance;
            const jitterX = (Math.random() * 2 - 1) * JITTER_AMOUNT;
            const jitterY = (Math.random() * 2 - 1) * JITTER_AMOUNT;

            path.lineTo(
                startPoint[0] + ratio * deltaX + jitterX,
                startPoint[1] + ratio * deltaY + jitterY,
            );

            currentDistance += Math.random() * 40 + 30;
        }

        path.lineTo(...endPoint);
    }

    return path;
}

export default class UIGame extends AbstractUI {
    private static readonly DEAD_BACKGROUND_TARGET_OPACITY = 0.3 as const;
    private static readonly DEAD_BACKGROUND_FADE_DURATION = 0.3 as const;

    private tilesetRenderer: TilesetRenderer = new TilesetRenderer();

    private players: Map<number, Player> = new Map();
    private mobs: Map<number, Mob> = new Map();

    private lightningBounces: Array<LightningBounce> = new Array();

    private waveInformationContainer: StaticVContainer;
    private waveMobIcons: UIGameWaveMobIcons;

    private playerStatuses: UIGamePlayerStatuses;

    private inventory: UIGameInventory;

    private updateT: number;
    private t: number;

    private waveProgress: number;

    private waveProgressTimer: number;
    private waveProgressRedGageTimer: number;

    /**
     * Wave room state is Ended or not.
     */
    private wasWaveEnded: boolean;

    private mapRadius: number;
    private oMapRadius: number;
    private nMapRadius: number;

    private deadMenuBackgroundOpacity: number;

    private static readonly DEAD_MENU_CONTAINER_ANIMATION_CONFIG = {
        defaultDurationOverride: 2500,

        direction: "v",
        offset: 300,
        offsetSign: 1,
        fadeEffectEnabled: false,
    } as const satisfies AnimationConfigOf<AnimationType.SLIDE>;

    private deadMenuContainer: StaticVContainer;
    private wasDeadMenuContinued: boolean;

    private gameOverMenuContainer: StaticVContainer;

    private youWillRespawnNextWaveContainer: StaticTranslucentPanelContainer;

    private chatInput: TextInput;
    private chatContainer: StaticVContainer;

    private currentMoodFlags: number;

    public waveSelfId: number = -1;

    override biome: Biome = Biome.GARDEN;

    override readonly CLIENTBOUND_HANDLERS = {
        [Clientbound.WAVE_SELF_ID]: (reader: BinaryReader): void => {
            this.waveSelfId = reader.readUInt32();
        },
        [Clientbound.WAVE_UPDATE]: (reader: BinaryReader): void => {
            { // Wave informations
                const waveProgress = reader.readUInt16();

                const waveProgressTimer = reader.readFloat64();

                const waveProgressRedGageTimer = reader.readFloat64();

                const waveEnded = reader.readBoolean();

                // World size
                const waveMapRadius = reader.readUInt16();

                this.waveProgress = waveProgress;

                this.waveProgressTimer = waveProgressTimer;

                this.waveProgressRedGageTimer = waveProgressRedGageTimer;

                this.wasWaveEnded = waveEnded;

                this.nMapRadius = waveMapRadius;
                this.oMapRadius = this.mapRadius;

                this.updateT = 0;
            }

            { // Read players
                const playerCount = reader.readUInt16();

                for (let i = 0; i < playerCount; i++) {
                    const playerId = reader.readUInt32();

                    const playerX = reader.readFloat64();
                    const playerY = reader.readFloat64();

                    const playerAngle = angleToRad(reader.readFloat64());

                    const playerHealth = reader.readFloat64();

                    const playerSize = reader.readFloat64();

                    const playerMood = reader.readUInt8();

                    const playerName = reader.readString();

                    // Decode boolean flags
                    const bFlags = reader.readUInt8();

                    const playerIsDead = Boolean(bFlags & 1),
                        playerIsDev = Boolean(bFlags & 2);

                    const player = this.players.get(playerId);
                    if (player) {
                        player.nx = playerX;
                        player.ny = playerY;

                        player.nAngle = playerAngle;

                        player.nSize = playerSize;

                        { // Update health properties
                            if (playerHealth < player.nHealth) {
                                player.redHealthTimer = 1;
                                player.hurtT = 1;
                            } else if (playerHealth > player.nHealth) {
                                player.redHealthTimer = 0;
                            }

                            player.nHealth = playerHealth;
                        }

                        player.mood = playerMood;

                        player.isDead = playerIsDead;

                        player.isDev = playerIsDev;

                        player.ox = player.x;
                        player.oy = player.y;

                        player.oAngle = player.angle;

                        player.oSize = player.size;

                        player.oHealth = player.health;

                        player.updateT = 0;
                    } else {
                        const player = new Player(
                            playerId,

                            playerX,
                            playerY,

                            playerAngle,

                            playerSize,

                            playerHealth,

                            playerMood,

                            playerName,
                        );

                        this.players.set(playerId, player);

                        // Add status
                        this.playerStatuses.addPlayer(player, this.waveSelfId === player.id);
                    }
                }
            }

            { // Read mobs
                const mobCount = reader.readUInt16();

                for (let i = 0; i < mobCount; i++) {
                    const mobId = reader.readUInt32();

                    const mobX = reader.readFloat64();
                    const mobY = reader.readFloat64();

                    const mobAngle = angleToRad(reader.readFloat64());

                    const mobHealth = reader.readFloat64();

                    const mobSize = reader.readFloat64();

                    const mobType = reader.readUInt8();

                    const mobRarity = reader.readUInt8() as Rarity;

                    // Decode boolean flags
                    const bFlags = reader.readUInt8();

                    const mobIsPet = Boolean(bFlags & 1),
                        mobIsFirstSegment = Boolean(bFlags & 2);

                    const mob = this.mobs.get(mobId);
                    if (mob) {
                        mob.nx = mobX;
                        mob.ny = mobY;

                        mob.nAngle = mobAngle;

                        mob.nSize = mobSize;

                        { // Update health properties
                            if (mobHealth < mob.nHealth) {
                                mob.redHealthTimer = 1;
                                mob.hurtT = 1;
                            } else if (mobHealth > mob.nHealth) {
                                mob.redHealthTimer = 0;
                            }

                            mob.nHealth = mobHealth;
                        }

                        mob.ox = mob.x;
                        mob.oy = mob.y;

                        mob.oAngle = mob.angle;

                        mob.oSize = mob.size;

                        mob.oHealth = mob.health;

                        mob.updateT = 0;
                    } else {
                        const mobInstance = new Mob(
                            mobId,

                            mobX,
                            mobY,

                            mobAngle,

                            mobSize,

                            mobHealth,

                            mobType,
                            mobRarity,

                            mobIsPet,

                            mobIsFirstSegment,
                        );

                        if (this.waveMobIcons.isIconableMobInstance(mobInstance)) {
                            this.waveMobIcons.addMobIcon(mobInstance);
                        }

                        this.mobs.set(mobId, mobInstance);
                    }
                }
            }

            { // Read petals
                const petalCount = reader.readUInt16();

                for (let i = 0; i < petalCount; i++) {
                    const petalId = reader.readUInt32();

                    const petalX = reader.readFloat64();
                    const petalY = reader.readFloat64();

                    const petalAngle = angleToRad(reader.readFloat64());

                    const petalHealth = reader.readFloat64();

                    const petalSize = reader.readFloat64();

                    const petalType = reader.readUInt8();

                    const petalRarity = reader.readUInt8() as Rarity;

                    const petal = this.mobs.get(petalId);
                    if (petal) {
                        petal.nx = petalX;
                        petal.ny = petalY;

                        petal.nAngle = petalAngle;

                        petal.nSize = petalSize;

                        { // Update health properties
                            if (petalHealth < petal.nHealth) {
                                petal.redHealthTimer = 1;
                                petal.hurtT = 1;
                            } else if (petalHealth > petal.nHealth) {
                                petal.redHealthTimer = 0;
                            }

                            petal.nHealth = petalHealth;
                        }

                        petal.ox = petal.x;
                        petal.oy = petal.y;

                        petal.oAngle = petal.angle;

                        petal.oSize = petal.size;

                        petal.oHealth = petal.health;

                        petal.updateT = 0;
                    } else {
                        // Petal treated as mob
                        this.mobs.set(petalId, new Mob(
                            petalId,

                            petalX,
                            petalY,

                            petalAngle,

                            petalSize,

                            petalHealth,

                            petalType,
                            petalRarity,

                            false,

                            false,
                        ));
                    }
                }
            }

            { // Read eliminated entities
                const eliminatedEntitiesCount = reader.readUInt16();

                for (let i = 0; i < eliminatedEntitiesCount; i++) {
                    const entityId = reader.readUInt32();

                    if (this.mobs.has(entityId)) {
                        const mob = this.mobs.get(entityId);

                        mob.isDead = true;

                        continue;
                    }

                    if (this.players.has(entityId)) {
                        const player = this.players.get(entityId);

                        player.wasEliminated = true;

                        player.isDead = true;

                        // Maybe player is already dead and got revived, deadT is maybe half
                        player.deadT = 0;
                        player.health = 0;

                        // Remove from status
                        this.playerStatuses.removePlayer(player, this.waveSelfId === player.id);

                        continue;
                    }
                }
            }

            { // Read lightning bounces
                const lightningBouncesCount = reader.readUInt16();

                for (let i = 0; i < lightningBouncesCount; i++) {
                    const positionsCount = reader.readUInt16();

                    const bounce: LightningBounce = {
                        points: [],
                        t: 1,
                    };

                    for (let j = 0; j < positionsCount; j++) {
                        const x = reader.readFloat64();
                        const y = reader.readFloat64();

                        bounce.points.push([x, y]);
                    }

                    bounce.path = prepareLightningBouncePath(bounce);

                    this.lightningBounces.push(bounce);
                }
            }
        },
        [Clientbound.WAVE_CHAT_RECEIV]: (reader: BinaryReader): void => {
            const lines = reader.readString();

            lines.split("\n").forEach(message => {                
                this.chatContainer.addChildren(
                    new StaticText(
                        {
                            y: 2,
                        },
    
                        message,
                        10,
                    ),
                    new StaticSpace(0, 3),
                );
            });
        },
    } as const satisfies StaticAdheredClientboundHandlers;

    constructor(canvas: HTMLCanvasElement) {
        super(canvas);

        this.waveProgress = 0;

        this.updateT = 0;

        this.waveProgressTimer = this.waveProgressRedGageTimer = this.mapRadius = 0;
        this.oMapRadius = 0;
        this.nMapRadius = 0;

        this.wasDeadMenuContinued = false;

        this.deadMenuBackgroundOpacity = 0;

        this.wasWaveEnded = false;

        this.currentMoodFlags = MoodFlags.NORMAL;

        { // Setup listeners
            this.on("onKeyDown", (event: KeyboardEvent) => {
                if (!this.isOperative) return;

                switch (event.key) {
                    // Space mean space
                    case " ": {
                        this.currentMoodFlags |= MoodFlags.ANGRY;

                        clientWebsocket.packetServerbound.sendWaveChangeMood(this.currentMoodFlags);

                        break;
                    }

                    case "Shift": {
                        this.currentMoodFlags |= MoodFlags.SAD;

                        clientWebsocket.packetServerbound.sendWaveChangeMood(this.currentMoodFlags);

                        break;
                    }

                    case "Enter": {
                        if (this.chatInput.isFocused) {
                            this.chatInput.blur();
                        } else {
                            const selfPlayer = this.players.get(this.waveSelfId);
                            if (!selfPlayer) {
                                return;
                            }

                            if (selfPlayer.isDead) {
                                if (this.wasDeadMenuContinued) this.leaveGame();

                                if (!this.wasDeadMenuContinued) {
                                    this.wasDeadMenuContinued = true;
                                }
                            }

                            if (this.chatInput) this.chatInput.focus();
                        }

                        break;
                    }

                    default: {
                        // Slot swapping
                        if (
                            // Dont swap while chatting
                            !this.chatInput.isFocused
                        ) {
                            if (event.code.startsWith("Digit")) {
                                let index = parseInt(event.code.slice(5));
                                if (index === 0) {
                                    index = 10;
                                }

                                index--;

                                clientWebsocket.packetServerbound.sendWaveSwapPetal(index);
                            }
                        }

                        break;
                    }
                }
            });

            this.on("onKeyUp", (event: KeyboardEvent) => {
                if (!this.isOperative) return;

                switch (event.key) {
                    // Space means space
                    case " ": {
                        this.currentMoodFlags &= ~MoodFlags.ANGRY;

                        clientWebsocket.packetServerbound.sendWaveChangeMood(this.currentMoodFlags);

                        break;
                    }

                    case "Shift": {
                        this.currentMoodFlags &= ~MoodFlags.SAD;

                        clientWebsocket.packetServerbound.sendWaveChangeMood(this.currentMoodFlags);

                        break;
                    }
                }
            });

            this.on("onMouseDown", (event: MouseEvent) => {
                if (!this.isOperative) return;

                if (event.button === 0) {
                    this.currentMoodFlags |= MoodFlags.ANGRY;

                    clientWebsocket.packetServerbound.sendWaveChangeMood(this.currentMoodFlags);
                }

                if (event.button === 2) {
                    this.currentMoodFlags |= MoodFlags.SAD;

                    clientWebsocket.packetServerbound.sendWaveChangeMood(this.currentMoodFlags);
                }
            });

            this.on("onMouseUp", (event: MouseEvent) => {
                if (!this.isOperative) return;

                if (event.button === 0) {
                    this.currentMoodFlags &= ~MoodFlags.ANGRY;

                    clientWebsocket.packetServerbound.sendWaveChangeMood(this.currentMoodFlags);
                }

                if (event.button === 2) {
                    this.currentMoodFlags &= ~MoodFlags.SAD;

                    clientWebsocket.packetServerbound.sendWaveChangeMood(this.currentMoodFlags);
                }
            });

            this.on("onMouseMove", (event: MouseEvent) => {
                if (!this.isOperative) return;

                mouseXOffset = event.clientX - document.documentElement.clientWidth / 2;
                mouseYOffset = event.clientY - document.documentElement.clientHeight / 2;

                if (
                    !SettingStorage.get("keyboard_control")
                ) {
                    const angle = Math.atan2(mouseYOffset, mouseXOffset);
                    const distance = Math.hypot(mouseXOffset, mouseYOffset) / uiScaleFactor;

                    clientWebsocket.packetServerbound.sendWaveChangeMove(
                        angle,
                        distance < 100 ? distance / 100 : 1,
                    );
                }
            });
        }
    }

    protected override onInitialize(): void {
        // Leave wave button
        this.addComponent(new UICloseButton(
            {
                x: 6,
                y: 6,
            },

            14,

            () => this.leaveGame(),
        ));

        this.addComponent(this.waveInformationContainer = new (InlineRendering(StaticVContainer))(
            () => ({
                x: -(this.waveInformationContainer.w / 2),
                y: 30,

                alignFromCenterX: true,
            }),
        ).addChildren(
            new (Centering(StaticText))(
                {},

                () => BIOME_DISPLAY_NAME[this.biome],
                16,
            ),

            new StaticSpace(0, 4),

            new (Centering(Gauge))(
                {
                    w: 140,
                    h: 12,
                },

                () => {
                    const maxWaveProgress = calculateWaveLength(this.waveProgress);

                    return [
                        {
                            value: this.waveProgressTimer,
                            maxValue: maxWaveProgress,

                            thickness: 0.75,

                            color: BIOME_GAUGE_COLORS[this.biome],
                            lowBehavior: "lineWidth",
                        },

                        {
                            value: this.waveProgressRedGageTimer,
                            maxValue: maxWaveProgress,

                            thickness: 0.6,

                            color: "#e32933",
                            lowBehavior: "lineWidth",
                        },
                    ];
                },
                0,
                () => "Wave " + this.waveProgress,
            ),

            new StaticSpace(0, 8),

            this.waveMobIcons = new (Centering(UIGameWaveMobIcons))({}),
        ));

        this.addComponent(this.playerStatuses = new (InlineRendering(UIGamePlayerStatuses))(
            () => ({
                x: 55,
                y: 60,
            }),
        ));

        {
            let deadMenuCloser: Button;

            this.deadMenuContainer = new StaticVContainer(
                () => ({
                    x: -(this.deadMenuContainer.w / 2),
                    y: -(this.deadMenuContainer.h / 2),

                    alignFromCenterX: true,
                    alignFromCenterY: true,
                }),

                false,
            ).addChildren(
                new (Centering(StaticText))(
                    {},
                    "You were destroyed by:",
                    12.2,
                ),

                new StaticSpace(2, 2),

                new (Centering(StaticText))(
                    {},
                    "Poison",
                    16.1,
                ),

                new StaticSpace(100, 100),

                (deadMenuCloser = new (Centering(Button))(
                    {
                        w: 88,
                        h: 24,
                    },

                    3,

                    3,
                    1,

                    [
                        new StaticText(
                            {
                                x: 3,
                                y: 2,
                            },

                            "Continue",
                            17,
                        ),
                    ],

                    () => {
                        this.wasDeadMenuContinued = true;

                        this.deadMenuContainer.setVisible(
                            false,
                            <ComponentCloser><unknown>deadMenuCloser,
                            true,
                            AnimationType.SLIDE,
                            UIGame.DEAD_MENU_CONTAINER_ANIMATION_CONFIG,
                        );
                    },

                    "#1dd129",
                    true,
                )),

                new StaticSpace(0, 4),

                new (Centering(StaticText))(
                    {},

                    "(or press enter)",
                    12,
                ),
            );

            this.deadMenuContainer.setVisible(false, null, false);

            this.addComponent(this.deadMenuContainer);
        }

        {
            this.gameOverMenuContainer = new StaticVContainer(
                () => ({
                    x: -(this.gameOverMenuContainer.w / 2),
                    y: -(this.gameOverMenuContainer.h / 2),

                    alignFromCenterX: true,
                    alignFromCenterY: true,
                }),

                false,
            ).addChildren(
                new (Centering(StaticText))(
                    {},

                    "GAME OVER",
                    34,
                    "#f0666b",
                ),

                new StaticSpace(20, 20),

                new (Centering(Button))(
                    {
                        w: 88,
                        h: 24,
                    },

                    3,

                    3,
                    1,

                    [
                        new StaticText(
                            {
                                x: 3,
                                y: 2,
                            },

                            "Continue",
                            17,
                        ),
                    ],

                    () => this.leaveGame(),

                    "#c62327",
                    true,
                ),
                new StaticSpace(0, 4),
                new (Centering(StaticText))(
                    {},

                    "(or press enter)",
                    12,
                ),
            );

            this.gameOverMenuContainer.setVisible(false, null, false);

            this.addComponent(this.gameOverMenuContainer);
        }

        {
            this.youWillRespawnNextWaveContainer = new StaticTranslucentPanelContainer(
                () => ({
                    x: -(this.youWillRespawnNextWaveContainer.w / 2),
                    y: -(this.youWillRespawnNextWaveContainer.h / 2) + 50,

                    alignFromCenterX: true,
                    alignFromCenterY: true,
                }),

                2,
            ).addChildren(
                new StaticText(
                    { y: 3 },

                    "You will respawn next wave",
                    10,
                ),
                new CoordinatedStaticSpace(1, 1, 0, 16),
            );

            this.youWillRespawnNextWaveContainer.setVisible(false, null, false);

            this.addComponent(this.youWillRespawnNextWaveContainer);
        }

        { // Chats
            this.addComponent(this.chatInput = new TextInput(
                {
                    x: 13,
                    y: 34,
                    w: 192,
                    h: 8,

                    invertYCoordinate: true,
                },

                {
                    canvas: this.canvas,

                    text: "",

                    fontSize: 11,
                    fontFamily: 'Ubuntu',
                    textColor: '#212121',
                    fontWeight: 'bold',

                    placeholder: '',
                    placeholderUnfocused: "Press [ENTER] or click here to chat",
                    showPlaceholderWhenUnfocused: true,

                    borderColor: "#000000",
                    borderRadius: 4,
                    borderWidth: 2.2,
                    maxLength: 80,

                    onSubmit: (e, self) => {
                        clientWebsocket.packetServerbound.sendWaveChat(self.value);

                        self.value = "";
                    },
                },
            ));

            let chatContainerParent: StaticTranslucentPanelContainer<StaticVContainer>;

            this.addComponent(
                chatContainerParent = new StaticTranslucentPanelContainer<StaticVContainer>(
                    () => ({
                        x: 11,
                        y: 37 + chatContainerParent.h,

                        invertYCoordinate: true,
                    }),

                    2,
                    () =>
                        this.chatInput.isFocused
                            ? 0.5
                            : 0,
                ).addChild(this.chatContainer = new StaticVContainer({})),
            );
        }

        this.addComponent(this.inventory = new (InlineRendering(UIGameInventory))(
            () => ({
                x: -(this.inventory.w / 2),
                y: 105,

                alignFromCenterX: true,
                invertYCoordinate: true,
            }),
        ));
    }

    override render() {
        // Interpolate
        {
            this.updateT += deltaTime / 100;
            this.t = Math.min(1, this.updateT);

            this.mapRadius = this.oMapRadius + (this.nMapRadius - this.oMapRadius) * this.t;

            interpolatedMouseX = interpolate(interpolatedMouseX, mouseXOffset / antennaScaleFactor, 50);
            interpolatedMouseY = interpolate(interpolatedMouseY, mouseYOffset / antennaScaleFactor, 50);
        }

        const canvas = this.canvas;
        const ctx = canvas.getContext("2d");

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const widthRelative = canvas.width / uiScaleFactor;
        const heightRelative = canvas.height / uiScaleFactor;

        const centerWidth = widthRelative / 2;
        const centerHeight = heightRelative / 2;

        const selfPlayer = this.players.get(this.waveSelfId);
        if (!selfPlayer) return;

        // Render map
        this.tilesetRenderer.renderGameTileset({
            canvas,
            tileset: BIOME_TILESETS.get(this.biome),
            tileSize: 300,
            radius: this.mapRadius,
            playerX: selfPlayer.x,
            playerY: selfPlayer.y,
        });

        // Render mutable functions
        this.drawMutableFunctions(canvas);

        { // Update entities
            this.mobs.forEach((mob, k) => {
                mob.update();

                if (
                    mob.isDead &&
                    mob.deadT > 1
                ) {
                    if (this.waveMobIcons.isIconableMobInstance(mob)) {
                        this.waveMobIcons.removeMobIcon(mob);
                    }

                    this.mobs.delete(k);
                }
            });

            this.players.forEach((player, k) => {
                player.update();

                // Only remove when disconnected
                if (
                    player.isDead &&
                    player.deadT > 1 &&
                    player.wasEliminated
                ) {
                    this.players.delete(k);
                }
            });
        }

        { // Render players & mobs
            const viewportWidth = (canvas.width / uiScaleFactor / antennaScaleFactor) + 500;
            const viewportHeight = (canvas.height / uiScaleFactor / antennaScaleFactor) + 500;
            const halfWidth = viewportWidth / 2;
            const halfHeight = viewportHeight / 2;

            const x0 = selfPlayer.x - halfWidth;
            const x1 = selfPlayer.x + halfWidth;
            const y0 = selfPlayer.y - halfHeight;
            const y1 = selfPlayer.y + halfHeight;

            const entitiesToDraw: (Mob | Player)[] = [];

            for (const [, mob] of this.mobs) {
                if (!isPetal(mob.type)) {
                    if (
                        mob.x >= x0 &&
                        mob.x <= x1 &&
                        mob.y >= y0 &&
                        mob.y <= y1
                    ) {
                        entitiesToDraw.push(mob);
                    }
                }
            }

            for (const [, petal] of this.mobs) {
                if (isPetal(petal.type)) {
                    if (
                        petal.x >= x0 &&
                        petal.x <= x1 &&
                        petal.y >= y0 &&
                        petal.y <= y1
                    ) {
                        entitiesToDraw.push(petal);
                    }
                }
            }

            for (const [, player] of this.players) {
                if (
                    player.x >= x0 &&
                    player.x <= x1 &&
                    player.y >= y0 &&
                    player.y <= y1
                ) {
                    entitiesToDraw.push(player);
                }
            }

            ctx.save();

            ctx.translate(centerWidth, centerHeight);
            ctx.scale(antennaScaleFactor, antennaScaleFactor);
            ctx.translate(-selfPlayer.x, -selfPlayer.y);

            for (const entity of entitiesToDraw) {
                renderEntity({
                    ctx,
                    entity,
                    isSpecimen: false,
                });
            }

            { // Render lightning bounces
                const { lightningBounces } = this;

                ctx.save();

                ctx.strokeStyle = "#fff";
                ctx.lineCap = "round";

                for (let i = lightningBounces.length - 1; i >= 0; i--) {
                    const bounce = lightningBounces[i];

                    bounce.t -= deltaTime / 500;
                    if (bounce.t <= 0) {
                        lightningBounces.splice(i, 1);

                        continue;
                    }

                    ctx.lineWidth = bounce.t * 4;
                    ctx.globalAlpha = bounce.t;

                    ctx.stroke(bounce.path);
                }

                ctx.restore();
            }

            ctx.restore();
        }

        { // Render inlined components
            renderPossibleComponent(ctx, this.waveInformationContainer);

            renderPossibleComponent(ctx, this.playerStatuses);

            renderPossibleComponent(ctx, this.inventory);
        }

        { // Dead menu
            {
                ctx.save();

                ctx.globalAlpha = this.deadMenuBackgroundOpacity;
                ctx.fillStyle = 'black';
                ctx.fillRect(0, 0, widthRelative, heightRelative);

                ctx.restore();
            }

            if (selfPlayer.isDead) {
                if (
                    this.deadMenuBackgroundOpacity < UIGame.DEAD_BACKGROUND_TARGET_OPACITY &&
                    !(this.wasDeadMenuContinued && !this.wasWaveEnded)
                ) {
                    this.deadMenuBackgroundOpacity = Math.min(
                        this.deadMenuBackgroundOpacity + (deltaTime / 1000 / UIGame.DEAD_BACKGROUND_FADE_DURATION) * UIGame.DEAD_BACKGROUND_TARGET_OPACITY,
                        UIGame.DEAD_BACKGROUND_TARGET_OPACITY,
                    );
                }

                if (this.wasDeadMenuContinued) {
                    if (this.wasWaveEnded) {
                        if (!this.gameOverMenuContainer.visible) {
                            this.gameOverMenuContainer.setVisible(true, null, true, AnimationType.FADE);
                        }

                        if (this.youWillRespawnNextWaveContainer.isOutAnimatable) {
                            this.youWillRespawnNextWaveContainer.setVisible(false, null, true, AnimationType.FADE, { defaultDurationOverride: 500 });
                        }
                    } else {
                        // Only fade-out when not game over
                        this.deadMenuBackgroundOpacity = Math.max(
                            this.deadMenuBackgroundOpacity - (deltaTime / 1000 / UIGame.DEAD_BACKGROUND_FADE_DURATION) * UIGame.DEAD_BACKGROUND_TARGET_OPACITY,
                            0,
                        );

                        if (!this.youWillRespawnNextWaveContainer.visible) {
                            this.youWillRespawnNextWaveContainer.setVisible(true, null, true, AnimationType.FADE, { defaultDurationOverride: 500 });
                        }
                    }
                } else {
                    // If not rendered dead menu, render it
                    if (!this.deadMenuContainer.visible) {
                        this.deadMenuContainer.setVisible(true, null, true, AnimationType.SLIDE, UIGame.DEAD_MENU_CONTAINER_ANIMATION_CONFIG);
                    }
                }
            } else {
                // Respawned, or not dead

                this.deadMenuBackgroundOpacity = 0;

                if (this.deadMenuContainer.isOutAnimatable) {
                    this.deadMenuContainer.setVisible(false, null, true, AnimationType.SLIDE, UIGame.DEAD_MENU_CONTAINER_ANIMATION_CONFIG);
                }

                if (this.youWillRespawnNextWaveContainer.isOutAnimatable) {
                    this.youWillRespawnNextWaveContainer.setVisible(false, null, true, AnimationType.FADE, { defaultDurationOverride: 500 });
                }
            }
        }

        this.renderComponents();
    }

    override destroy(): void {
        super.destroy();

        this.tilesetRenderer = null;

        this.players.clear();
        this.mobs.clear();
    }

    override onContextChange(): void {
        // Fake dead animation
        const player = this.players.get(this.waveSelfId);
        if (player && !player.isDead) {
            player.isDead = true;
            player.deadT = 0;
        }
    }

    /**
     * Helper for draw mutable functions (e.g. mouse movement helper).
     */
    private drawMutableFunctions(canvas: HTMLCanvasElement) {
        const ARROW_START_DISTANCE = 30;

        const ctx = canvas.getContext("2d");
        const selfPlayer = this.players.get(this.waveSelfId);

        const widthRelative = canvas.width / uiScaleFactor;
        const heightRelative = canvas.height / uiScaleFactor;

        if (
            !(
                SettingStorage.get("keyboard_control") ||
                !SettingStorage.get("movement_helper")
            ) &&
            selfPlayer &&
            !selfPlayer.isDead
        ) {
            ctx.save();

            ctx.translate(widthRelative / 2, heightRelative / 2);
            ctx.rotate(Math.atan2(interpolatedMouseY, interpolatedMouseX));
            ctx.scale(antennaScaleFactor, antennaScaleFactor);

            const distance = Math.hypot(interpolatedMouseX, interpolatedMouseY) / uiScaleFactor;

            ctx.beginPath();
            ctx.moveTo(ARROW_START_DISTANCE, 0);
            ctx.lineTo(distance, 0);
            ctx.lineTo(distance - 24, -18);
            ctx.moveTo(distance, 0);
            ctx.lineTo(distance - 24, 18);

            ctx.lineWidth = 12;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.globalAlpha = distance < 100
                ? Math.max(distance - 50, 0) / (100 - 50)
                : 1;
            ctx.strokeStyle = "rgba(0,0,0,0.2)";
            ctx.stroke();

            ctx.restore();
        }
    }

    private leaveGame() {
        this.gameOverMenuContainer.setVisible(false, null, true, AnimationType.FADE, {
            defaultDurationOverride: 1000,
        });

        clientWebsocket.packetServerbound.sendWaveLeave();

        uiCtx.switchUI("title");
    }

    private get isOperative(): boolean {
        const selfPlayer = this.players.get(this.waveSelfId);
        if (!selfPlayer) return false;

        if (!clientWebsocket) return false;

        return !selfPlayer.isDead;
    }
}