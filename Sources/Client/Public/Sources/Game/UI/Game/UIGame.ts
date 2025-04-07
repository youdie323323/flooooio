import Mob from "../../Entity/Mob";
import Player from "../../Entity/Player";
import { renderEntity } from "../../Entity/Renderers/RendererRenderingLink";
import { interpolate } from "../../Utils/Interpolator";
import AbstractUI, { uiScaleFactor } from "../UI";
import SettingStorage from "../../Utils/SettingStorage";
import { Biome, BIOME_GAUGE_COLORS, BIOME_DISPLAY_NAME } from "../../../../../../Shared/Biome";
import { calculateWaveLength } from "../../../../../../Shared/Formula";
import { MoodFlags } from "../../../../../../Shared/Mood";
import { clientWebsocket, uiCtx, deltaTime, antennaScaleFactor } from "../../../../../Main";
import { isPetal } from "../../../../../../Shared/Entity/Dynamics/Mob/Petal/Petal";
import Text, { calculateStrokeWidth } from "../Layout/Components/WellKnown/Text";
import TextInput from "../Layout/Components/WellKnown/TextInput";
import type { Rarity } from "../../../../../../Shared/Entity/Statics/EntityRarity";
import type BinaryReader from "../../../../../../Shared/Websocket/Binary/ReadWriter/Reader/BinaryReader";
import { Button } from "../Layout/Components/WellKnown/Button";
import { Clientbound } from "../../../../../../Shared/Websocket/Packet/PacketDirection";
import type { StaticAdheredClientboundHandlers } from "../../Websocket/Packet/PacketClientbound";
import UICloseButton from "../Shared/UICloseButton";
import type { AnimationConfigOf, ComponentCloser, FakeSetVisibleToggleType } from "../Layout/Components/Component";
import { AnimationType, renderPossibleComponent } from "../Layout/Components/Component";
import { CoordinatedStaticSpace, StaticSpace, StaticTranslucentPanelContainer, StaticVContainer } from "../Layout/Components/WellKnown/Container";
import { InlineRendering } from "../Layout/Extensions/ExtensionInlineRendering";
import UIGameWaveMobIcons from "./UIGameWaveMobIcons";
import UIGameInventory from "./UIGameInventory";
import { Centering } from "../Layout/Extensions/ExtensionCentering";
import Gauge from "../Layout/Components/WellKnown/Gauge";
import UIGamePlayerStatusBar from "./UIGamePlayerStatusBar";
import TilesetRenderer, { BIOME_TILESETS } from "../../Utils/Tile/Tileset/TilesetRenderer";

let interpolatedMouseX = 0;
let interpolatedMouseY = 0;

let mouseXOffset = 0;
let mouseYOffset = 0;

const TAU = Math.PI * 2;

function angleToRad(angle: number) {
    return angle / 255 * TAU;
}

export default class UIGame extends AbstractUI {
    private readonly DEAD_BACKGROUND_TARGET_OPACITY: number = 0.3;
    private readonly DEAD_BACKGROUND_FADE_DURATION: number = 0.3;

    private tilesetRenderer: TilesetRenderer = new TilesetRenderer();

    private players: Map<number, Player> = new Map();
    private mobs: Map<number, Mob> = new Map();

    private waveInformationContainer: StaticVContainer;
    private waveMobIcons: UIGameWaveMobIcons;

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
    private commandsContainer: StaticVContainer<StaticTranslucentPanelContainer>;

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
                const clientCount = reader.readUInt16();

                for (let i = 0; i < clientCount; i++) {
                    const clientId = reader.readUInt32();

                    const clientX = reader.readFloat64();
                    const clientY = reader.readFloat64();

                    const clientAngle = angleToRad(reader.readFloat64());

                    const clientHealth = reader.readFloat64();

                    const clientSize = reader.readFloat64();

                    const clientMood = reader.readUInt8();

                    const clientName = reader.readString();

                    // Decode boolean flags
                    const bFlags = reader.readUInt8();

                    const clientIsDead = Boolean(bFlags & 1),
                        clientIsDev = Boolean(bFlags & 2);

                    const client = this.players.get(clientId);
                    if (client) {
                        client.nx = clientX;
                        client.ny = clientY;
                        client.nAngle = clientAngle;
                        client.nSize = clientSize;
                        client.mood = clientMood;
                        client.isDead = clientIsDead;
                        client.isDev = clientIsDev;

                        if (clientHealth < client.nHealth) {
                            client.redHealthTimer = 1;
                        } else if (clientHealth > client.nHealth) {
                            client.redHealthTimer = 0;
                        }

                        if (clientHealth < client.nHealth) {
                            client.hurtT = 1;
                        }

                        client.nHealth = clientHealth;

                        client.ox = client.x;
                        client.oy = client.y;
                        client.oAngle = client.angle;
                        client.oHealth = client.health;
                        client.oSize = client.size;
                        client.updateT = 0;
                    } else {
                        const player = new Player(
                            clientId,
                            clientX,
                            clientY,
                            clientAngle,
                            clientSize,
                            clientHealth,

                            clientMood,

                            clientName,
                        );

                        this.players.set(clientId, player);

                        this.addComponent(new UIGamePlayerStatusBar(
                            {
                                x: 55,
                                y: 60,
                            },

                            player,
                        ));
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

                        if (mob.health < mob.nHealth) {
                            mob.redHealthTimer = 1;
                        } else if (mob.health > mob.nHealth) {
                            mob.redHealthTimer = 0;
                        }

                        if (mobHealth < mob.nHealth) {
                            mob.hurtT = 1;
                        }

                        mob.nHealth = mobHealth;

                        mob.ox = mob.x;
                        mob.oy = mob.y;
                        mob.oAngle = mob.angle;
                        mob.oHealth = mob.health;
                        mob.oSize = mob.size;
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

                        if (petal.health < petal.nHealth) {
                            petal.redHealthTimer = 1;
                        } else if (petal.health > petal.nHealth) {
                            petal.redHealthTimer = 0;
                        }

                        if (petalHealth < petal.nHealth) {
                            petal.hurtT = 1;
                        }

                        petal.nHealth = petalHealth;

                        petal.ox = petal.x;
                        petal.oy = petal.y;
                        petal.oAngle = petal.angle;
                        petal.oHealth = petal.health;
                        petal.oSize = petal.size;
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

                    player.isRemoved = true;

                    player.isDead = true;

                    // Maybe client is already dead and got revived, deadT is maybe halfway
                    player.deadT = 0;
                    player.health = 0;

                    continue;
                }
            }
        },
        [Clientbound.WAVE_CHAT_RECEIV]: (reader: BinaryReader): void => {
            const waveClientId = reader.readUInt32();

            const chatMsg = reader.readString();

            const player = this.players.get(waveClientId);

            if (player) {
                this.chatContainer.addChildren(
                    new Text(
                        {
                            y: 2,
                        },

                        `${player.name}: ${chatMsg}`,
                        10,
                    ),
                    new StaticSpace(0, 3),
                );
            }
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
                        if (this.chatInput.hasFocus) {
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
                            !this.chatInput.hasFocus
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
            new (Centering(Text))(
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
                new (Centering(Text))(
                    {},
                    "You were destroyed by:",
                    12.2,
                ),

                new StaticSpace(2, 2),

                new (Centering(Text))(
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
                        new Text(
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

                new (Centering(Text))(
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
                new (Centering(Text))(
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
                        new Text(
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
                new (Centering(Text))(
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
                new Text(
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

                    value: "",

                    fontSize: 11,
                    fontFamily: 'Ubuntu',
                    fontColor: '#212121',
                    fontWeight: 'bold',

                    placeHolder: '',
                    placeHolderUnfocused: "Press [ENTER] or click here to chat",
                    placeHolderDisplayUnfocusedState: true,

                    borderColor: "#000000",
                    borderRadius: 4,
                    borderWidth: 2.2,
                    maxlength: 80,

                    onsubmit: (e, self) => {
                        clientWebsocket.packetServerbound.sendWaveChat(self.value);

                        self.value = "";
                    },

                    onkeydown: (e, self) => {
                        const show = self.value.startsWith("/");

                        chatContainer.setVisible(<FakeSetVisibleToggleType>!show, null, false);

                        this.commandsContainer.setVisible(<FakeSetVisibleToggleType>show, null, false);
                    },
                },
            ));

            let chatContainer: StaticTranslucentPanelContainer<StaticVContainer>;

            this.addComponent(
                chatContainer = new StaticTranslucentPanelContainer<StaticVContainer>(
                    () => ({
                        x: 11,
                        y: 37 + chatContainer.h,

                        invertYCoordinate: true,
                    }),

                    2,
                    () =>
                        this.chatInput.hasFocus
                            ? 0.5
                            : 0,
                ).addChild(this.chatContainer = new StaticVContainer({})),
            );

            this.addComponent(this.commandsContainer = new StaticVContainer<StaticTranslucentPanelContainer>(
                () => ({
                    x: 11,
                    y: 37 + this.commandsContainer.h,

                    invertYCoordinate: true,
                }),
            ).addChildren(
                new StaticTranslucentPanelContainer(
                    {},

                    0,
                    0,
                ).addChildren(
                    new Text(
                        {
                            y: 2,
                        },

                        `/manko - kusai`,
                        10,
                        "#d2eb34",
                    ),
                    new CoordinatedStaticSpace(0, 0, 0, 14),
                ),
            ));

            this.commandsContainer.setVisible(false, null, false);
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

        // Update entities
        {
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
                    player.isRemoved
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

            ctx.restore();
        }

        { // Render inlined components
            renderPossibleComponent(ctx, this.waveInformationContainer);

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
                    this.deadMenuBackgroundOpacity < this.DEAD_BACKGROUND_TARGET_OPACITY &&
                    !(this.wasDeadMenuContinued && !this.wasWaveEnded)
                ) {
                    this.deadMenuBackgroundOpacity = Math.min(
                        this.deadMenuBackgroundOpacity + (deltaTime / 1000 / this.DEAD_BACKGROUND_FADE_DURATION) * this.DEAD_BACKGROUND_TARGET_OPACITY,
                        this.DEAD_BACKGROUND_TARGET_OPACITY,
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
                            this.deadMenuBackgroundOpacity - (deltaTime / 1000 / this.DEAD_BACKGROUND_FADE_DURATION) * this.DEAD_BACKGROUND_TARGET_OPACITY,
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