import Mob from "../../Entity/Mob";
import Player from "../../Entity/Player";
import { renderEntity } from "../../Entity/Renderers/RendererEntityRenderingLink";
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
import TilesetRenderer, { BIOME_TILESETS, oceanBackgroundPatternTileset } from "../Shared/Tiled/TilesetRenderer";
import TilesetWavedRenderer from "../Shared/Tiled/TilesetWavedRenderer";
import { Clientbound } from "../../../../../../Shared/Websocket/Packet/PacketDirection";
import type { StaticAdherableClientboundHandler } from "../../Websocket/Packet/PacketClientbound";
import UICloseButton from "../Shared/UICloseButton";
import { AnimationType, Components } from "../Layout/Components/Component";
import { StaticHContainer, StaticVContainer } from "../Layout/Components/WellKnown/Container";
import UIGameMobCard from "./UIGameMobCard";
import { InlineRenderingCall } from "../Layout/Extensions/ExtensionInlineRenderingCall";

let interpolatedMouseX = 0;
let interpolatedMouseY = 0;

let mouseXOffset = 0;
let mouseYOffset = 0;

/**
 * Ease out cubic function for smooth animation.
 * 
 * @param t - Normalized time (0 to 1)
 * @returns Eased value
 */
function easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - t, 3);
}

const TAU = Math.PI * 2;

function angleToRad(angle: number) {
    return angle / 255 * TAU;
}

/**
 * Current ui of menu
 */
let gameUiCurrentBiome: Biome = Biome.GARDEN;

export default class UIGame extends AbstractUI {
    private readonly DEAD_BACKGROUND_TARGET_OPACITY: number = 0.3;
    private readonly DEAD_BACKGROUND_FADE_DURATION: number = 0.3;
    private readonly DEAD_MENU_ANIMATION_DURATION: number = 2;

    private tilesetWavedRendererOceanPattern: TilesetWavedRenderer = new TilesetWavedRenderer();
    private tilesetRenderer: TilesetRenderer = new TilesetRenderer();

    private players: Map<number, Player> = new Map();
    private mobs: Map<number, Mob> = new Map();

    private mobCardsContainer: StaticHContainer;

    private updateT: number;
    private t: number;

    private waveProgress: number;

    private waveProgressTimer: number;
    private waveProgressRedGageTimer: number;
    private oWaveProgressTimer: number;
    private oWaveProgressRedGageTimer: number;
    private nWaveProgressTimer: number;
    private nWaveProgressRedGageTimer: number;

    private waveEnded: boolean;

    private mapRadius: number;
    private oMapRadius: number;
    private nMapRadius: number;

    private wasDeadMenuContinued: boolean;
    private wasGameOverContinued: boolean;

    private deadMenuContinueButton: Button;

    private deadMenuBackgroundOpacity: number;

    private gameOverMenuContinueButton: Button;

    private gameOverMenuOpacity: number;

    private youWillRespawnNextWaveOpacity: number;

    private deadMenuContinueButtonY: number;
    private deadMenuAnimationActive: boolean;
    private deadMenuAnimationTimer: number;

    private chats: string[];
    private chatInput: TextInput;

    private currentMoodFlags: number;

    public waveSelfId: number = -1;

    override readonly clientboundHandler: StaticAdherableClientboundHandler = {
        [Clientbound.WAVE_SELF_ID]: (reader: BinaryReader): void => {
            this.waveSelfId = reader.readUInt32();
        },
        [Clientbound.WAVE_UPDATE]: (reader: BinaryReader): void => {
            // Wave informations
            {
                const waveProgress = reader.readUInt16();

                const waveProgressTimer = reader.readFloat64();

                const waveProgressRedGageTimer = reader.readFloat64();

                const waveEnded = reader.readBoolean();

                // World size
                const waveMapRadius = reader.readUInt16();

                this.waveProgress = waveProgress;

                this.nWaveProgressTimer = waveProgressTimer;
                this.oWaveProgressTimer = this.waveProgressTimer;

                this.nWaveProgressRedGageTimer = waveProgressRedGageTimer;
                this.oWaveProgressRedGageTimer = this.waveProgressRedGageTimer;

                this.waveEnded = waveEnded;

                this.nMapRadius = waveMapRadius;
                this.oMapRadius = this.mapRadius;

                this.updateT = 0;
            }

            const clientCount = reader.readUInt16();

            for (let i = 0; i < clientCount; i++) {
                const clientId = reader.readUInt32();

                const clientX = reader.readFloat64();
                const clientY = reader.readFloat64();

                const clientAngle = angleToRad(reader.readUInt8());

                const clientHealth = reader.readFloat64();

                const clientSize = reader.readUInt32();

                const clientMood = reader.readUInt8();

                const clientNickname = reader.readString();

                // Decode boolean flags
                const bFlags = reader.readUInt8();
                const clientIsDead = !!(bFlags & 1);
                const clientIsDev = !!(bFlags & 2);

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
                    this.players.set(
                        clientId,
                        new Player(
                            clientId,
                            clientX,
                            clientY,
                            clientAngle,
                            clientSize,
                            clientHealth,
                            clientMood,
                            clientNickname,
                        ),
                    );
                }
            }

            const mobCount = reader.readUInt16();

            for (let i = 0; i < mobCount; i++) {
                const mobId = reader.readUInt32();

                const mobX = reader.readFloat64();
                const mobY = reader.readFloat64();

                const mobAngle = angleToRad(reader.readFloat64());

                const mobHealth = reader.readFloat64();

                const mobSize = reader.readUInt32();

                const mobType = reader.readUInt8();

                const mobRarity = reader.readUInt8() as Rarity;

                // Decode boolean flags
                const bFlags = reader.readUInt8();
                const mobIsPet = !!(bFlags & 1);
                const mobIsFirstSegment = !!(bFlags & 2);

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

                    if (this.isCardableMobInstance(mobInstance)) {
                        this.addMobCard(mobInstance);
                    }

                    this.mobs.set(mobId, mobInstance);
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
                // TODO: implement
            }
        },
    };

    constructor(canvas: HTMLCanvasElement) {
        super(canvas);

        this.waveProgress = 0;

        this.updateT = 0;

        this.waveProgressTimer = this.waveProgressRedGageTimer = this.mapRadius = 0;
        this.oWaveProgressTimer = this.oWaveProgressRedGageTimer = this.oMapRadius = 0;
        this.nWaveProgressTimer = this.nWaveProgressRedGageTimer = this.nMapRadius = 0;

        this.wasDeadMenuContinued = false;
        this.wasGameOverContinued = false;

        this.deadMenuContinueButtonY = -50;
        this.deadMenuAnimationTimer = 0;
        this.deadMenuAnimationActive = false;

        this.deadMenuBackgroundOpacity = 0;
        this.youWillRespawnNextWaveOpacity = 0;
        this.gameOverMenuOpacity = 0;

        this.waveEnded = false;

        this.chats = [];

        this.currentMoodFlags = MoodFlags.NORMAL;
    }

    override onKeyDown(event: KeyboardEvent): void {
        switch (event.key) {
            // Space means space
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
                    clientWebsocket &&
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
    }

    override onKeyUp(event: KeyboardEvent): void {
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
    }

    override onMouseDown(event: MouseEvent): void {
        if (clientWebsocket) {
            if (event.button === 0) {
                this.currentMoodFlags |= MoodFlags.ANGRY;
                clientWebsocket.packetServerbound.sendWaveChangeMood(this.currentMoodFlags);
            }

            if (event.button === 2) {
                this.currentMoodFlags |= MoodFlags.SAD;
                clientWebsocket.packetServerbound.sendWaveChangeMood(this.currentMoodFlags);
            }
        }
    }

    override onMouseUp(event: MouseEvent): void {
        if (clientWebsocket) {
            if (event.button === 0) {
                this.currentMoodFlags &= ~MoodFlags.ANGRY;
                clientWebsocket.packetServerbound.sendWaveChangeMood(this.currentMoodFlags);
            }

            if (event.button === 2) {
                this.currentMoodFlags &= ~MoodFlags.SAD;
                clientWebsocket.packetServerbound.sendWaveChangeMood(this.currentMoodFlags);
            }
        }
    }

    override onMouseMove(event: MouseEvent): void {
        mouseXOffset = event.clientX - document.documentElement.clientWidth / 2;
        mouseYOffset = event.clientY - document.documentElement.clientHeight / 2;

        if (
            !SettingStorage.get("keyboard_control") &&
            clientWebsocket
        ) {
            const angle = Math.atan2(mouseYOffset, mouseXOffset);
            const distance = Math.hypot(mouseXOffset, mouseYOffset) / uiScaleFactor;

            clientWebsocket.packetServerbound.sendWaveChangeMove(
                angle,
                distance < 100 ? distance / 100 : 1,
            );
        }
    }

    private addMobCard(mobInstance: Mob): void {
        const vContainerToAdd =
            this.mobCardsContainer.getChildren()
                .find(
                    container =>
                        container instanceof StaticVContainer &&
                        container.getChildren().find(
                            c =>
                                c instanceof UIGameMobCard &&
                                c.mobInstance.type === mobInstance.type,
                        ),
                ) as StaticVContainer | undefined;

        const createMobCard = (): UIGameMobCard => {
            const mobCard = new UIGameMobCard(
                {
                    x: 0,
                    y: 0,
                },

                mobInstance,
            );

            // Animation on appear
            mobCard.setVisible(false, false);
            mobCard.setVisible(true, true, AnimationType.CARD);

            return mobCard;
        };

        if (vContainerToAdd) {
            const existingMobCard = vContainerToAdd.getChildren()
                .find(
                    c =>
                        c instanceof UIGameMobCard &&
                        c.mobInstance.type === mobInstance.type &&
                        c.mobInstance.rarity === mobInstance.rarity,
                ) as UIGameMobCard | undefined;

            if (existingMobCard) {
                existingMobCard.mobAmountAccumulator++;
            } else {
                vContainerToAdd.addChild(createMobCard());
            }

            vContainerToAdd.sortChildren(
                (({ mobInstance: mobA }: UIGameMobCard, { mobInstance: mobB }: UIGameMobCard) => mobA.rarity - mobB.rarity) as
                Parameters<typeof vContainerToAdd["sortChildren"]>[0],
            );
        } else {
            const vContainer = new StaticVContainer(
                {
                    x: 0,
                    y: 0,
                },

                true,
                6,
            );

            vContainer.addChild(createMobCard());

            this.mobCardsContainer.addChild(vContainer);
        }
    }

    private removeMobCard(mobInstance: Mob): void {
        const vContainerToRemoveFrom = this.mobCardsContainer.getChildren()
            .find(
                container =>
                    container instanceof StaticVContainer &&
                    container.getChildren().some(
                        c =>
                            c instanceof UIGameMobCard &&
                            c.mobInstance.type === mobInstance.type &&
                            c.mobInstance.rarity === mobInstance.rarity,
                    ),
            ) as StaticVContainer | undefined;

        if (!vContainerToRemoveFrom) return;

        const mobCard = vContainerToRemoveFrom.getChildren()
            .find(
                c =>
                    c instanceof UIGameMobCard &&
                    c.mobInstance.type === mobInstance.type &&
                    c.mobInstance.rarity === mobInstance.rarity,
            ) as UIGameMobCard | undefined;

        if (!mobCard) return;

        const checksumVContainer = (): void => {
            if (vContainerToRemoveFrom.getChildren().length === 0) {
                this.mobCardsContainer.removeChild(vContainerToRemoveFrom);
            }
        };

        if (mobCard.mobAmountAccumulator > 1) {
            mobCard.mobAmountAccumulator--;
        } else {
            mobCard.once("onAnimationHide", () => {
                vContainerToRemoveFrom.removeChild(mobCard);

                checksumVContainer();
            });

            mobCard.setVisible(false, true, AnimationType.CARD);
        }

        checksumVContainer();
    }

    private isCardableMobInstance({ type, isPet }: Mob): boolean {
        return this.mobCardsContainer &&
            !(
                isPetal(type) ||
                isPet
            );
    }

    protected override initializeComponents(): void {
        this.addComponent(new UICloseButton(
            {
                x: 6,
                y: 6,
            },
            14,

            () => {
                clientWebsocket.packetServerbound.sendWaveLeave();

                uiCtx.switchUI("title");
            },
        ));

        this.deadMenuContinueButton = new Button(
            () => ({
                x: -(95 / 2),
                y: this.deadMenuContinueButtonY + 50,
                w: 95,
                h: 27,

                alignFromCenterX: true,
            }),

            2,

            10,
            0.05,

            [
                new Text(
                    {
                        x: 0,
                        y: 0,
                    },
                    "Continue",
                    20,
                ),
            ],

            () => {
                this.wasDeadMenuContinued = true;

                this.gameOverMenuContinueButton.setVisible(true, true, AnimationType.FADE, 1000);
            },

            "#1dd129",
            true,
        );

        // Dont show every frame
        this.deadMenuContinueButton.setVisible(false, false);

        this.addComponent(this.deadMenuContinueButton);

        this.gameOverMenuContinueButton = new Button(
            {
                x: -(95 / 2),
                y: (-(27 / 2)) + 40,
                w: 95,
                h: 27,

                alignFromCenterX: true,
                alignFromCenterY: true,
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
                    "Continue",
                    20,
                ),
            ],

            () => this.leaveGame(),

            "#c62327",
            true,
        );

        // Dont show every frame
        this.gameOverMenuContinueButton.setVisible(false, false);

        this.addComponent(this.gameOverMenuContinueButton);

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
            },
        ));

        this.addComponent(this.mobCardsContainer = new (InlineRenderingCall(StaticHContainer))(
            () => ({
                x: -(this.mobCardsContainer.w / 2),
                y: 52,

                alignFromCenterX: true,
            }),
            false,
            UIGameMobCard.CARD_SIZE + 10 + 1,
        ));
    }

    override animationFrame() {
        // Interpolate
        {
            this.updateT += deltaTime / 100;
            this.t = Math.min(1, this.updateT);

            this.waveProgressTimer = this.oWaveProgressTimer + (this.nWaveProgressTimer - this.oWaveProgressTimer) * this.t;
            this.waveProgressRedGageTimer = this.oWaveProgressRedGageTimer + (this.nWaveProgressRedGageTimer - this.oWaveProgressRedGageTimer) * this.t;
            this.mapRadius = this.oMapRadius + (this.nMapRadius - this.oMapRadius) * this.t;

            interpolatedMouseX = interpolate(interpolatedMouseX, mouseXOffset / antennaScaleFactor, 50);
            interpolatedMouseY = interpolate(interpolatedMouseY, mouseYOffset / antennaScaleFactor, 50);
        }

        const canvas = this.canvas;
        const ctx = canvas.getContext("2d");

        const widthRelative = canvas.width / uiScaleFactor;
        const heightRelative = canvas.height / uiScaleFactor;

        const centerWidth = widthRelative / 2;
        const centerHeight = heightRelative / 2;

        const savedFillStyle = ctx.fillStyle;
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = savedFillStyle;

        const selfPlayer = this.players.get(this.waveSelfId);
        if (!selfPlayer) {
            return;
        }

        // Render map
        this.tilesetRenderer.renderGameTileset({
            canvas,
            tileset: BIOME_TILESETS.get(this.biome),
            tilesetSize: 300,
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
                    if (this.isCardableMobInstance(mob)) {
                        this.removeMobCard(mob);
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

        // Render players & mobs
        {
            const viewportWidth = canvas.width / antennaScaleFactor;
            const viewportHeight = canvas.height / antennaScaleFactor;
            const halfWidth = viewportWidth / 2;
            const halfHeight = viewportHeight / 2;

            const x1 = selfPlayer.x - halfWidth;
            const x2 = selfPlayer.x + halfWidth;
            const y1 = selfPlayer.y - halfHeight;
            const y2 = selfPlayer.y + halfHeight;

            const entitiesToDraw: (Mob | Player)[] = new Array(this.mobs.size + this.players.size);

            let i = 0;
            const filterFunc = (v: Mob | Player) => {
                if (
                    v.x >= x1 &&
                    v.x <= x2 &&
                    v.y >= y1 &&
                    v.y <= y2
                ) entitiesToDraw[i++] = v;
            };

            this.mobs.forEach(filterFunc);

            entitiesToDraw.sort((a, b) => Number(a instanceof Mob && isPetal(a.type)) - Number(b instanceof Mob && isPetal(b.type)));

            this.players.forEach(filterFunc);

            ctx.save();

            ctx.translate(centerWidth, centerHeight);
            ctx.scale(antennaScaleFactor, antennaScaleFactor);
            ctx.translate(-selfPlayer.x, -selfPlayer.y);

            entitiesToDraw.forEach((entity, k) => renderEntity({
                ctx,
                entity,
                entityOnlyRenderGeneralPart: false,
            }));

            ctx.restore();
        }

        // Ocean pattern background
        if (this.biome === Biome.OCEAN && oceanBackgroundPatternTileset) {
            ctx.save();

            ctx.globalAlpha = 0.3;

            this.tilesetWavedRendererOceanPattern.render({
                canvas,
                tileset: [oceanBackgroundPatternTileset],
                tilesetSize: 350,
            });

            ctx.restore();
        }

        // Wave bar
        {
            ctx.save();

            const WAVE_PROGRESS_BAR_LENGTH = 135;
            const WAVE_PROGRESS_BAR_Y = 45;

            ctx.translate(centerWidth, WAVE_PROGRESS_BAR_Y);
            ctx.scale(0.4, 0.4);
            ctx.translate(-centerWidth, -WAVE_PROGRESS_BAR_Y);

            {
                const maxSpawnTime = calculateWaveLength(this.waveProgress);

                {
                    ctx.save();

                    ctx.globalAlpha = 0.9;

                    ctx.lineWidth = 25;
                    ctx.lineCap = "round";
                    ctx.strokeStyle = "black";
                    ctx.beginPath();
                    ctx.lineTo(centerWidth - WAVE_PROGRESS_BAR_LENGTH, WAVE_PROGRESS_BAR_Y);
                    ctx.lineTo(centerWidth + WAVE_PROGRESS_BAR_LENGTH, WAVE_PROGRESS_BAR_Y);
                    ctx.stroke();

                    ctx.restore();
                }

                if (this.waveProgressTimer > 0) {
                    ctx.save();

                    ctx.lineWidth = Math.min((this.waveProgressTimer / maxSpawnTime) * (maxSpawnTime * 16.6666), 18.5);
                    ctx.lineCap = "round";
                    ctx.strokeStyle = BIOME_GAUGE_COLORS[this.biome];
                    ctx.beginPath();
                    ctx.lineTo(centerWidth - WAVE_PROGRESS_BAR_LENGTH, WAVE_PROGRESS_BAR_Y);
                    ctx.lineTo(centerWidth - WAVE_PROGRESS_BAR_LENGTH + (WAVE_PROGRESS_BAR_LENGTH * 2) * (this.waveProgressTimer / maxSpawnTime), WAVE_PROGRESS_BAR_Y);
                    ctx.stroke();

                    ctx.restore();
                }

                if (this.waveProgressRedGageTimer > 0) {
                    ctx.save();

                    ctx.lineWidth = Math.min((this.waveProgressRedGageTimer / maxSpawnTime) * (maxSpawnTime * 16.6666), 15);
                    ctx.lineCap = "round";
                    ctx.strokeStyle = "#e32933";
                    ctx.beginPath();
                    ctx.lineTo(centerWidth - WAVE_PROGRESS_BAR_LENGTH, WAVE_PROGRESS_BAR_Y);
                    ctx.lineTo(centerWidth - WAVE_PROGRESS_BAR_LENGTH + (WAVE_PROGRESS_BAR_LENGTH * 2) * (this.waveProgressRedGageTimer / maxSpawnTime), WAVE_PROGRESS_BAR_Y);
                    ctx.stroke();

                    ctx.restore();
                }

                {
                    ctx.save();

                    ctx.lineJoin = 'round';
                    ctx.lineCap = 'round';
                    ctx.font = "1em Ubuntu";
                    ctx.textBaseline = 'middle';
                    ctx.textAlign = 'center';
                    ctx.lineWidth = 3;
                    ctx.strokeStyle = '#000000';
                    ctx.fillStyle = "white";

                    ctx.strokeText("Wave " + this.waveProgress, centerWidth, WAVE_PROGRESS_BAR_Y);
                    ctx.fillText("Wave " + this.waveProgress, centerWidth, WAVE_PROGRESS_BAR_Y);

                    ctx.restore();
                }

            }

            {
                ctx.save();

                const biomeDisplayName = BIOME_DISPLAY_NAME[this.biome];

                ctx.lineJoin = 'round';
                ctx.lineCap = 'round';
                ctx.font = "2em Ubuntu";
                ctx.textBaseline = 'middle';
                ctx.textAlign = 'center';
                ctx.lineWidth = 4;
                ctx.strokeStyle = '#000000';
                ctx.fillStyle = "white";

                ctx.strokeText(biomeDisplayName, centerWidth, WAVE_PROGRESS_BAR_Y - 36);
                ctx.fillText(biomeDisplayName, centerWidth, WAVE_PROGRESS_BAR_Y - 36);

                ctx.restore();
            }

            ctx.restore();
        }

        // Render mob cards
        this.mobCardsContainer.render(ctx);

        // Dead menu
        {
            {
                ctx.save();

                ctx.globalAlpha = this.deadMenuBackgroundOpacity;
                ctx.fillStyle = 'black';
                ctx.fillRect(0, 0, widthRelative, heightRelative);

                ctx.restore();
            }

            // The reason this is not in the isDead block is to fade-out when revived
            {
                if (this.wasDeadMenuContinued && !this.waveEnded && selfPlayer.isDead) {
                    if (this.youWillRespawnNextWaveOpacity <= 1) {
                        this.youWillRespawnNextWaveOpacity += 0.02;
                    }
                } else {
                    if (this.youWillRespawnNextWaveOpacity >= 0) {
                        this.youWillRespawnNextWaveOpacity -= 0.02;
                    }
                }

                this.youWillRespawnNextWaveOpacity = Math.max(Math.min(this.youWillRespawnNextWaveOpacity, 1), 0);

                {
                    ctx.save();

                    ctx.translate(centerWidth, 300);

                    {
                        ctx.save();

                        ctx.globalAlpha = Math.min(this.youWillRespawnNextWaveOpacity, 0.5);

                        ctx.strokeStyle = 'black';
                        ctx.beginPath();
                        ctx.roundRect(-(116 / 2), -(16 / 2), 116, 16, 1);
                        ctx.fill();

                        ctx.restore();
                    }

                    {
                        ctx.save();

                        ctx.globalAlpha = this.youWillRespawnNextWaveOpacity;

                        ctx.lineJoin = 'round';
                        ctx.lineCap = 'round';
                        ctx.textBaseline = 'middle';
                        ctx.textAlign = 'center';
                        ctx.strokeStyle = '#000000';
                        ctx.fillStyle = "white";
                        ctx.font = "8.4px Ubuntu";
                        ctx.lineWidth = calculateStrokeWidth(8.4);

                        ctx.strokeText("You will respawn next wave", 0, 0);
                        ctx.fillText("You will respawn next wave", 0, 0);

                        ctx.restore();
                    }

                    ctx.restore();
                }
            }

            if (selfPlayer.isDead) {
                if (
                    this.deadMenuBackgroundOpacity < this.DEAD_BACKGROUND_TARGET_OPACITY &&
                    // Stop fade-out blocking
                    !(this.wasDeadMenuContinued && !this.waveEnded)
                ) {
                    this.deadMenuBackgroundOpacity = Math.min(
                        this.deadMenuBackgroundOpacity + (deltaTime / 1000 / this.DEAD_BACKGROUND_FADE_DURATION) * this.DEAD_BACKGROUND_TARGET_OPACITY,
                        this.DEAD_BACKGROUND_TARGET_OPACITY,
                    );
                }

                if (this.wasDeadMenuContinued) {
                    if (!this.waveEnded) {
                        // Only fade-out when not game over
                        this.deadMenuBackgroundOpacity = Math.max(
                            0,
                            this.deadMenuBackgroundOpacity - (deltaTime / 1000 / this.DEAD_BACKGROUND_FADE_DURATION) * this.DEAD_BACKGROUND_TARGET_OPACITY,
                        );
                    } else {
                        if (!this.wasGameOverContinued) {
                            if (this.gameOverMenuOpacity <= 1) {
                                this.gameOverMenuOpacity += 0.005;
                            }
                        } else {
                            if (this.gameOverMenuOpacity >= 0) {
                                // Bit faster than uncontinued i guess
                                this.gameOverMenuOpacity -= 0.01;
                            }
                        }

                        this.gameOverMenuOpacity = Math.max(Math.min(this.gameOverMenuOpacity, 1), 0);

                        ctx.save();

                        ctx.globalAlpha = this.gameOverMenuOpacity;

                        ctx.lineJoin = 'round';
                        ctx.lineCap = 'round';
                        ctx.textBaseline = 'middle';
                        ctx.textAlign = 'center';
                        ctx.strokeStyle = '#000000';

                        ctx.fillStyle = "#f0666b";
                        ctx.font = "34px Ubuntu";
                        ctx.lineWidth = calculateStrokeWidth(34);

                        ctx.strokeText("GAME OVER", centerWidth, centerHeight);
                        ctx.fillText("GAME OVER", centerWidth, centerHeight);

                        ctx.fillStyle = "white";
                        ctx.font = "12px Ubuntu";
                        ctx.lineWidth = calculateStrokeWidth(12);

                        ctx.strokeText("(or press enter)", centerWidth, centerHeight + 75);
                        ctx.fillText("(or press enter)", centerWidth, centerHeight + 75);

                        ctx.restore();
                    }

                    if (this.deadMenuContinueButtonY >= -100) {
                        this.deadMenuAnimationTimer -= deltaTime / 300;
                        this.deadMenuContinueButtonY = -100 + easeOutCubic(Math.max(this.deadMenuAnimationTimer / this.DEAD_MENU_ANIMATION_DURATION, 0)) * (centerHeight - (-100));
                    }
                } else {
                    if (!this.deadMenuAnimationActive) {
                        this.deadMenuContinueButtonY = -50;
                        this.deadMenuAnimationTimer = 0;
                        this.deadMenuAnimationActive = true;
                    }

                    if (this.deadMenuAnimationTimer < this.DEAD_MENU_ANIMATION_DURATION && this.deadMenuContinueButtonY <= centerHeight + 50) {
                        this.deadMenuAnimationTimer += deltaTime / 1000;
                        this.deadMenuContinueButtonY = -50 + easeOutCubic(Math.min(this.deadMenuAnimationTimer / this.DEAD_MENU_ANIMATION_DURATION, 1)) * (centerHeight + 50);
                    }
                }

                {
                    ctx.save();

                    this.deadMenuContinueButton.setVisible(true, false);

                    ctx.translate(centerWidth, this.deadMenuContinueButtonY);

                    ctx.lineJoin = 'round';
                    ctx.lineCap = 'round';
                    ctx.textBaseline = 'middle';
                    ctx.textAlign = 'center';
                    ctx.strokeStyle = '#000000';
                    ctx.fillStyle = "white";

                    ctx.font = "12.2px Ubuntu";
                    ctx.lineWidth = calculateStrokeWidth(12.2);

                    ctx.strokeText("You were destroyed by:", 0, -81);
                    ctx.fillText("You were destroyed by:", 0, -81);

                    ctx.font = "16.1px Ubuntu";
                    ctx.lineWidth = calculateStrokeWidth(16.1);

                    ctx.strokeText("You", 0, -61);
                    ctx.fillText("You", 0, -61);

                    ctx.font = "12px Ubuntu";
                    ctx.lineWidth = calculateStrokeWidth(12);

                    ctx.strokeText("(or press enter)", 0, 90);
                    ctx.fillText("(or press enter)", 0, 90);

                    ctx.restore();
                }
            } else {
                this.deadMenuContinueButton.setVisible(false, false);

                this.deadMenuAnimationActive = false;
                this.deadMenuContinueButtonY = -50;
                this.deadMenuAnimationTimer = 0;

                this.deadMenuBackgroundOpacity = 0;
                this.youWillRespawnNextWaveOpacity = 0;
                this.gameOverMenuOpacity = 0;
            }
        }

        this.render();
    }

    override destroy(): void {
        this.tilesetRenderer = this.tilesetWavedRendererOceanPattern = null;

        this.players.clear();
        this.mobs.clear();
    }

    override onContextChanged(): void {
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
        this.wasGameOverContinued = true;

        this.gameOverMenuContinueButton.setVisible(false, true, AnimationType.FADE, 1000);

        clientWebsocket.packetServerbound.sendWaveLeave();

        uiCtx.switchUI("title");
    }

    set biome(biome: Biome) {
        gameUiCurrentBiome = biome;
    }

    get biome(): Biome {
        return gameUiCurrentBiome;
    }
}