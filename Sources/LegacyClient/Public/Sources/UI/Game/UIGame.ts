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
import UIGamePlayerStatuses from "./UIGamePlayerStatuses";
import { MoodFlags } from "../../Native/Entity/Player/PlayerMood";
import { clientWebsocket, deltaTime, antennaScaleFactor, uiCtx } from "../../../../Application";
import { isPetal } from "../../Entity/Petal";
import type BinaryReader from "../../Websocket/Binary/ReadWriter/Reader/BinaryReader";
import { Clientbound } from "../../Websocket/Packet/PacketOpcode";
import { Biome, BIOME_DISPLAY_NAME, BIOME_GAUGE_COLORS } from "../../Native/Biome";
import TileRenderer, { BIOME_TILESETS } from "../Shared/Tile/Tileset/TilesetRenderer";
import { MobType } from "../../Native/Entity/EntityType";

let interpolatedMouseX = 0;
let interpolatedMouseY = 0;

let mouseXOffset = 0;
let mouseYOffset = 0;

const TAU = 2 * Math.PI;

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
        const dx = endPoint[0] - startPoint[0];
        const dy = endPoint[1] - startPoint[1];
        const totalDistance = Math.hypot(dx, dy);

        let currentDistance = 0;

        while (currentDistance < totalDistance) {
            const JITTER_AMOUNT = 25;

            const ratio = currentDistance / totalDistance;
            const jitterX = (Math.random() * 2 - 1) * JITTER_AMOUNT;
            const jitterY = (Math.random() * 2 - 1) * JITTER_AMOUNT;

            path.lineTo(
                startPoint[0] + ratio * dx + jitterX,
                startPoint[1] + ratio * dy + jitterY,
            );

            currentDistance += Math.random() * 50 + 50;
        }

        path.lineTo(...endPoint);
    }

    return path;
}

export default class UIGame extends AbstractUI {
    private static readonly DEAD_BACKGROUND_TARGET_OPACITY = 0.3 as const;
    private static readonly DEAD_BACKGROUND_FADE_DURATION = 0.3 as const;

    private tilesetRenderer: TileRenderer = new TileRenderer();

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

    // W,A,S,D
    private movementKeys: [boolean, boolean, boolean, boolean] = [false, false, false, false];
    private lastMovementKeyAngle: number = 0;

    override biome: Biome = Biome.GARDEN;

    override readonly CLIENTBOUND_HANDLERS = {
        [Clientbound.WAVE_SELF_ID]: (reader: BinaryReader): void => {
            this.waveSelfId = reader.readUInt32();
        },
        [Clientbound.WAVE_UPDATE]: (reader: BinaryReader): void => {
            const currentTick = reader.readUInt32();

            { // Wave informations
                const waveProgress = reader.readUInt16();

                const waveProgressTimer = reader.readFloat32();

                const waveProgressRedGageTimer = reader.readFloat32();

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

            {
                const entityCount = reader.readUInt16();

                for (let i = 0; i < entityCount; i++) {
                    const entityType = reader.readUInt8();

                    switch (entityType) {
                        case 0: {
                            const playerId = reader.readUInt32();

                            const playerX = reader.readFloat32();
                            const playerY = reader.readFloat32();

                            const playerAngle = angleToRad(reader.readFloat32());

                            const playerHealth = reader.readFloat32();

                            const playerSize = reader.readFloat32();

                            const playerMood = reader.readUInt8();

                            const playerName = reader.readString();

                            // Decode boolean flags
                            const bFlags = reader.readUInt8();

                            const playerIsDead = Boolean(bFlags & 1),
                                playerIsDev = Boolean(bFlags & 2),
                                playerIsPoisoned = Boolean(bFlags & 4);

                            const player = this.players.get(playerId);
                            if (player) {
                                player.nx = playerX;
                                player.ny = playerY;

                                player.nAngle = playerAngle;

                                player.nSize = playerSize;

                                { // Update health properties
                                    if (!player.isPoison && playerHealth < player.nHealth) {
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

                                player.isPoison = playerIsPoisoned;

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

                            break;
                        }

                        case 1: {
                            const mobId = reader.readUInt32();

                            const mobX = reader.readFloat32();
                            const mobY = reader.readFloat32();

                            const mobAngle = angleToRad(reader.readFloat32());

                            const mobHealth = reader.readFloat32();

                            const mobSize = reader.readFloat32();

                            const mobType = reader.readUInt8();

                            const mobRarity = reader.readUInt8() as Rarity;

                            // Decode boolean flags
                            const bFlags = reader.readUInt8();

                            const mobIsPet = Boolean(bFlags & 1),
                                mobIsFirstSegment = Boolean(bFlags & 2),
                                mobHasConnectingSegment = Boolean(bFlags & 4),
                                mobIsPoisoned = Boolean(bFlags & 8);

                            let mobConnectingSegment: Mob = null;

                            if (mobHasConnectingSegment) {
                                const connectingSegmentModId = reader.readUInt32();

                                mobConnectingSegment = this.mobs.get(connectingSegmentModId);
                            }

                            let mob = this.mobs.get(mobId);
                            if (mob) {
                                mob.nx = mobX;
                                mob.ny = mobY;

                                mob.nAngle = mobAngle;

                                mob.nSize = mobSize;

                                mob.connectingSegment = mobConnectingSegment;

                                { // Update health properties
                                    const parentMob = Mob.traverseSegments(mob);

                                    // TODO: original game can hurtT = 1 when poisoned
                                    // But do that can affect to color always
                                    if (!mob.isPoison && mobHealth < mob.nHealth) {
                                        parentMob.redHealthTimer = 1;
                                        parentMob.hurtT = 1;
                                    } else if (mobHealth > mob.nHealth) {
                                        parentMob.redHealthTimer = 0;
                                    }

                                    mob.nHealth = mobHealth;
                                }

                                mob.ox = mob.x;
                                mob.oy = mob.y;

                                mob.oAngle = mob.angle;

                                mob.oSize = mob.size;

                                mob.oHealth = mob.health;

                                mob.isPoison = mobIsPoisoned;

                                mob.updateT = 0;
                            } else {
                                mob = new Mob(
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

                                    mobConnectingSegment,
                                );

                                if (this.waveMobIcons.isIconableMobInstance(mob)) {
                                    this.waveMobIcons.addMobIcon(mob);
                                }

                                this.mobs.set(mobId, mob);
                            }

                            if (mobConnectingSegment && !mobConnectingSegment.connectedSegments.has(mob)) {
                                mobConnectingSegment.connectedSegments.add(mob);
                            }

                            break;
                        }

                        case 2: {
                            const petalId = reader.readUInt32();

                            const petalX = reader.readFloat32();
                            const petalY = reader.readFloat32();

                            const petalAngle = angleToRad(reader.readFloat32());

                            const petalHealth = reader.readFloat32();

                            const petalSize = reader.readFloat32();

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

                                    null,
                                ));
                            }

                            break;
                        }
                    }
                }
            }

            { // Read eliminated entities
                const destroyedCount = reader.readUInt16();

                for (let i = 0; i < destroyedCount; i++) {
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
                        const x = reader.readFloat32();
                        const y = reader.readFloat32();

                        bounce.points.push([x, y]);
                    }

                    bounce.path = prepareLightningBouncePath(bounce);

                    this.lightningBounces.push(bounce);
                }
            }

            clientWebsocket.packetServerbound.sendAck(currentTick);
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

            { // Setup WASD movement listeners
                this.on("onKeyDown", (event: KeyboardEvent) => {
                    if (!this.isOperative) return;

                    if (!SettingStorage.get("keyboard_control")) return;

                    switch (event.key.toLowerCase()) {
                        case "w": this.movementKeys[0] = true; break;
                        case "a": this.movementKeys[1] = true; break;
                        case "s": this.movementKeys[2] = true; break;
                        case "d": this.movementKeys[3] = true; break;
                    }

                    this.updateKeyboardMovement();
                });

                this.on("onKeyUp", (event: KeyboardEvent) => {
                    if (!this.isOperative) return;

                    if (!SettingStorage.get("keyboard_control")) return;

                    switch (event.key.toLowerCase()) {
                        case "w": this.movementKeys[0] = false; break;
                        case "a": this.movementKeys[1] = false; break;
                        case "s": this.movementKeys[2] = false; break;
                        case "d": this.movementKeys[3] = false; break;
                    }

                    this.updateKeyboardMovement();
                });
            }
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
                    textColor: "#212121",

                    placeholder: "",
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

        const { canvas } = this;
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

                    this.mobs.forEach((innerMob, k) => {
                        if (innerMob.connectedSegments.has(mob)) innerMob.connectedSegments.delete(mob);
                    });

                    if (mob.connectingSegment) mob.connectingSegment = null;
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
            const scaledWidth = canvas.width / (uiScaleFactor * antennaScaleFactor);
            const scaledHeight = canvas.height / (uiScaleFactor * antennaScaleFactor);
            const viewportWidth = scaledWidth + 500;
            const viewportHeight = scaledHeight + 500;

            const halfWidth = viewportWidth * 0.5;
            const halfHeight = viewportHeight * 0.5;

            const x0 = selfPlayer.x - halfWidth;
            const x1 = selfPlayer.x + halfWidth;
            const y0 = selfPlayer.y - halfHeight;
            const y1 = selfPlayer.y + halfHeight;

            const getEntitiesInViewport = () => {
                const viewportEntities: Array<Mob | Player> = [];

                const isInViewport = (entity: Mob | Player) => (
                    entity.x >= x0 &&
                    entity.x <= x1 &&
                    entity.y >= y0 &&
                    entity.y <= y1
                );

                for (const [, mob] of this.mobs) {
                    if (isInViewport(mob)) {
                        if (isPetal(mob.type)) {
                            viewportEntities.push(mob);
                        } else if (mob.type === MobType.WEB_PROJECTILE) {
                            viewportEntities.unshift(mob);
                        } else {
                            viewportEntities.push(mob);
                        }
                    }
                }

                for (const [, player] of this.players) {
                    if (isInViewport(player)) {
                        viewportEntities.push(player);
                    }
                }

                return viewportEntities;
            };

            const renderLightningBounces = () => {
                const { lightningBounces } = this;
                if (!lightningBounces.length) return;

                ctx.strokeStyle = "#FFF";
                ctx.lineCap = "round";

                const dtScale = deltaTime / 500;
                let i = lightningBounces.length;

                while (i--) {
                    const bounce = lightningBounces[i];
                    bounce.t -= dtScale;

                    if (bounce.t <= 0) {
                        lightningBounces.splice(i, 1);

                        continue;
                    }

                    ctx.globalAlpha = bounce.t;
                    ctx.lineWidth = bounce.t * 5;
                    ctx.stroke(bounce.path);
                }
            };

            const entitiesToDraw = getEntitiesInViewport();

            ctx.save();

            const viewScale = uiScaleFactor * antennaScaleFactor;

            ctx.setTransform(
                viewScale,
                0,
                0,
                viewScale,
                centerWidth * uiScaleFactor - selfPlayer.x * viewScale,
                centerHeight * uiScaleFactor - selfPlayer.y * viewScale,
            );

            for (const entity of entitiesToDraw) {
                renderEntity({ ctx, entity, isSpecimen: false });
            }

            renderLightningBounces();

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
                ctx.fillStyle = "black";
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

    private updateKeyboardMovement() {
        const [w, a, s, d] = this.movementKeys;

        // Calculate the movement vector
        let dx = 0;
        let dy = 0;

        if (w) dy -= 1;
        if (s) dy += 1;
        if (a) dx -= 1;
        if (d) dx += 1;

        // If no keys are pressed or opposing keys are pressed
        if (dx === 0 && dy === 0) {
            clientWebsocket.packetServerbound.sendWaveChangeMove(this.lastMovementKeyAngle, 0);

            return;
        }

        // Normalize diagonal movement
        if (dx !== 0 && dy !== 0) {
            dx /= Math.SQRT2;
            dy /= Math.SQRT2;
        }

        const angle = this.lastMovementKeyAngle = Math.atan2(dy, dx);

        // Send movement to server
        clientWebsocket.packetServerbound.sendWaveChangeMove(angle, 1);
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