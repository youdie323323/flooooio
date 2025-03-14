import Mob from "../../Entity/Mob";
import Player from "../../Entity/Player";
import { renderEntity } from "../../Entity/Renderers/RendererEntityRenderingLink";
import { interpolate } from "../../Utils/Interpolator";
import TilesetRenderer, { BIOME_TILESETS, oceanBackgroundPatternTileset } from "../Tiled/TilesetRenderer";
import AbstractUI, { uiScaleFactor } from "../UI";
import TilesetWavedRenderer from "../Tiled/TilesetWavedRenderer";
import SettingStorage from "../../Utils/SettingStorage";
import { Biome, BIOME_GAUGE_COLORS, BIOME_DISPLAY_NAME } from "../../../../../Shared/Biome";
import { calculateWaveLength } from "../../../../../Shared/Formula";
import { MoodFlags } from "../../../../../Shared/Mood";
import { clientWebsocket, uiCtx, deltaTime, antennaScaleFactor } from "../../../../Main";
import { isPetal } from "../../../../../Shared/Entity/Dynamics/Mob/Petal/Petal";
import { TextButton, SVGButton } from "../Layout/Components/WellKnown/Button";
import { calculateStrokeWidth } from "../Layout/Components/WellKnown/Text";
import TextInput from "../Layout/Components/WellKnown/TextInput";
import { PacketClientboundOpcode } from "../../../../../Shared/Websocket/Packet/Bound/Client/PacketClientboundOpcode";
import type { StaticAdditionalClientboundListen } from "../../Websocket/Packet/Bound/Client/PacketClientbound";
import type { Rarity } from "../../../../../Shared/Entity/Statics/EntityRarity";
import type BinaryReader from "../../../../../Shared/Websocket/Binary/ReadWriter/Reader/BinaryReader";

let interpolatedMouseX = 0;
let interpolatedMouseY = 0;

let mouseXOffset = 0;
let mouseYOffset = 0;

// Ui svg icons

export const CROSS_ICON_SVG: string = `<?xml version="1.0" encoding="iso-8859-1"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg fill="#cccccc" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="800px" height="800px" viewBox="0 0 41.756 41.756" xml:space="preserve"><g><path d="M27.948,20.878L40.291,8.536c1.953-1.953,1.953-5.119,0-7.071c-1.951-1.952-5.119-1.952-7.07,0L20.878,13.809L8.535,1.465c-1.951-1.952-5.119-1.952-7.07,0c-1.953,1.953-1.953,5.119,0,7.071l12.342,12.342L1.465,33.22c-1.953,1.953-1.953,5.119,0,7.071C2.44,41.268,3.721,41.755,5,41.755c1.278,0,2.56-0.487,3.535-1.464l12.343-12.342l12.343,12.343c0.976,0.977,2.256,1.464,3.535,1.464s2.56-0.487,3.535-1.464c1.953-1.953,1.953-5.119,0-7.071L27.948,20.878z"/></g></svg>`;

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
let gameUiCurrentBiome: Biome = Biome.Garden;

export default class UIGame extends AbstractUI {
    private readonly DEAD_BACKGROUND_TARGET_OPACITY: number = 0.3;
    private readonly DEAD_BACKGROUND_FADE_DURATION: number = 0.3;
    private readonly DEAD_MENU_ANIMATION_DURATION: number = 2;

    private tilesetWavedRendererOceanPattern: TilesetWavedRenderer = new TilesetWavedRenderer();
    private tilesetRenderer: TilesetRenderer = new TilesetRenderer();

    private players: Map<number, Player> = new Map();
    private mobs: Map<number, Mob> = new Map();

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

    private deadMenuContinueButton: TextButton;
    private gameOverContinueButton: TextButton;

    private deadBackgroundOpacity: number;
    private youWillRespawnNextWaveOpacity: number;
    private gameOverOpacity: number;

    private isDeadAnimationActive: boolean;
    private deadContinueButtonY: number;
    private deadAnimationTimer: number;

    private chats: string[];
    private chatInput: TextInput;

    private currentMoodFlags: number;

    public waveSelfId: number = -1;

    override additionalClientboundListen: StaticAdditionalClientboundListen = {
        [PacketClientboundOpcode.WaveSelfId]: (reader: BinaryReader): void => {
            this.waveSelfId = reader.readUInt32();
        },
        [PacketClientboundOpcode.WaveUpdate]: (reader: BinaryReader): void => {
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
                            false,
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
                    this.mobs.set(
                        mobId,
                        new Mob(
                            false,
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
                        ),
                    );
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
        [PacketClientboundOpcode.WaveChatReceiv]: (reader: BinaryReader): void => {
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

        this.deadContinueButtonY = -50;
        this.deadAnimationTimer = 0;
        this.isDeadAnimationActive = false;

        this.deadBackgroundOpacity = 0;
        this.youWillRespawnNextWaveOpacity = 0;
        this.gameOverOpacity = 0;

        this.waveEnded = false;

        this.chats = [];

        this.currentMoodFlags = MoodFlags.Normal;
    }

    override onKeyDown(event: KeyboardEvent): void {
        switch (event.key) {
            // Space means space
            case " ": {
                this.currentMoodFlags |= MoodFlags.Angry;
                clientWebsocket.packetServerbound.sendWaveChangeMood(this.currentMoodFlags);

                break;
            }

            case "Shift": {
                this.currentMoodFlags |= MoodFlags.Sad;
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
                this.currentMoodFlags &= ~MoodFlags.Angry;
                clientWebsocket.packetServerbound.sendWaveChangeMood(this.currentMoodFlags);

                break;
            }

            case "Shift": {
                this.currentMoodFlags &= ~MoodFlags.Sad;
                clientWebsocket.packetServerbound.sendWaveChangeMood(this.currentMoodFlags);

                break;
            }
        }
    }

    override onMouseDown(event: MouseEvent): void {
        if (clientWebsocket) {
            if (event.button === 0) {
                this.currentMoodFlags |= MoodFlags.Angry;
                clientWebsocket.packetServerbound.sendWaveChangeMood(this.currentMoodFlags);
            }

            if (event.button === 2) {
                this.currentMoodFlags |= MoodFlags.Sad;
                clientWebsocket.packetServerbound.sendWaveChangeMood(this.currentMoodFlags);
            }
        }
    }

    override onMouseUp(event: MouseEvent): void {
        if (clientWebsocket) {
            if (event.button === 0) {
                this.currentMoodFlags &= ~MoodFlags.Angry;
                clientWebsocket.packetServerbound.sendWaveChangeMood(this.currentMoodFlags);
            }

            if (event.button === 2) {
                this.currentMoodFlags &= ~MoodFlags.Sad;
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
            const distance = Math.hypot(mouseXOffset, mouseYOffset);
            const angle = Math.atan2(mouseYOffset, mouseXOffset);

            clientWebsocket.packetServerbound.sendWaveChangeMove(
                angle,
                distance < 100 ? distance / 100 : 1,
            );
        }
    }

    protected override initializeComponents(): void {
        const exitButton = new SVGButton(
            {
                x: 6,
                y: 6,
                w: 17.5,
                h: 17.5,
            },
            "#b04c5e",
            () => {
                clientWebsocket.packetServerbound.sendWaveLeave();

                uiCtx.switchUI("title");
            },
            () => true,
            CROSS_ICON_SVG,
        );

        this.addComponent(exitButton);

        // Order is important!

        this.gameOverContinueButton = new TextButton(
            {
                x: 0,
                y: 0,
                w: 95,
                h: 27,
            },
            "#c62327",
            () => this.leaveGame(),
            () => true,
            "Continue",
        );

        // Dont show every frame
        this.gameOverContinueButton.setVisible(false);

        this.addComponent(this.gameOverContinueButton);

        this.deadMenuContinueButton = new TextButton(
            {
                x: 0,
                y: 0,
                w: 95,
                h: 27,
            },
            "#1dd129",
            () => {
                this.wasDeadMenuContinued = true;
            },
            () => true,
            "Continue",
        );

        // Dont show every frame
        this.deadMenuContinueButton.setVisible(false);

        this.addComponent(this.deadMenuContinueButton);

        this.chatInput = new TextInput(
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
        );

        this.addComponent(this.chatInput);
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

                if (mob.isDead && mob.deadT > 1) {
                    this.mobs.delete(k);
                }
            });

            this.players.forEach((player, k) => {
                player.update();

                // Only remove when disconnected
                if (
                    player.isDead && player.deadT > 1 &&
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

            entitiesToDraw.forEach((v, k) => renderEntity(ctx, v));

            ctx.restore();
        }

        // Ocean pattern background
        if (this.biome === Biome.Ocean && oceanBackgroundPatternTileset) {
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

        // Dead menu
        {
            {
                ctx.save();

                ctx.globalAlpha = this.deadBackgroundOpacity;
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
                    this.deadBackgroundOpacity < this.DEAD_BACKGROUND_TARGET_OPACITY &&
                    // Stop fade-out blocking
                    !(this.wasDeadMenuContinued && !this.waveEnded)
                ) {
                    this.deadBackgroundOpacity = Math.min(
                        this.deadBackgroundOpacity + (deltaTime / 1000 / this.DEAD_BACKGROUND_FADE_DURATION) * this.DEAD_BACKGROUND_TARGET_OPACITY,
                        this.DEAD_BACKGROUND_TARGET_OPACITY,
                    );
                }

                if (this.wasDeadMenuContinued) {
                    if (!this.waveEnded) {
                        // Only fade-out when not game over
                        this.deadBackgroundOpacity = Math.max(
                            0,
                            this.deadBackgroundOpacity - (deltaTime / 1000 / this.DEAD_BACKGROUND_FADE_DURATION) * this.DEAD_BACKGROUND_TARGET_OPACITY,
                        );
                    } else {
                        if (!this.wasGameOverContinued) {
                            if (this.gameOverOpacity <= 1) {
                                this.gameOverOpacity += 0.005;
                            }
                        } else {
                            if (this.gameOverOpacity >= 0) {
                                // Bit faster than uncontinued i guess
                                this.gameOverOpacity -= 0.01;
                            }
                        }

                        this.gameOverOpacity = Math.max(Math.min(this.gameOverOpacity, 1), 0);

                        this.gameOverContinueButton.globalAlpha = this.gameOverOpacity;
                        this.gameOverContinueButton.setX(centerWidth - (this.gameOverContinueButton.w / 2));
                        this.gameOverContinueButton.setY(centerHeight + 35);
                        this.gameOverContinueButton.setVisible(true);

                        ctx.save();

                        ctx.globalAlpha = this.gameOverOpacity;

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

                    if (this.deadContinueButtonY >= -100) {
                        this.deadAnimationTimer -= deltaTime / 300;
                        this.deadContinueButtonY = -100 + easeOutCubic(Math.max(this.deadAnimationTimer / this.DEAD_MENU_ANIMATION_DURATION, 0)) * (centerHeight - (-100));
                    }
                } else {
                    if (!this.isDeadAnimationActive) {
                        this.deadContinueButtonY = -50;
                        this.deadAnimationTimer = 0;
                        this.isDeadAnimationActive = true;
                    }

                    if (this.deadAnimationTimer < this.DEAD_MENU_ANIMATION_DURATION && this.deadContinueButtonY <= centerHeight + 50) {
                        this.deadAnimationTimer += deltaTime / 1000;
                        this.deadContinueButtonY = -50 + easeOutCubic(Math.min(this.deadAnimationTimer / this.DEAD_MENU_ANIMATION_DURATION, 1)) * (centerHeight + 50);
                    }
                }

                {
                    ctx.save();

                    this.deadMenuContinueButton.setX(centerWidth - (this.deadMenuContinueButton.w / 2));
                    this.deadMenuContinueButton.setY(this.deadContinueButtonY + 50);
                    this.deadMenuContinueButton.setVisible(true);

                    ctx.translate(centerWidth, this.deadContinueButtonY);

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
                this.deadMenuContinueButton.setVisible(false);

                this.isDeadAnimationActive = false;
                this.deadContinueButtonY = -50;
                this.deadAnimationTimer = 0;

                this.deadBackgroundOpacity = 0;
                this.youWillRespawnNextWaveOpacity = 0;
                this.gameOverOpacity = 0;
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
            !SettingStorage.get("keyboard_control") &&
            selfPlayer && !selfPlayer.isDead
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
            ctx.globalAlpha = distance < 110 ? Math.max(distance - 60, 0) / 50 : 1;
            ctx.strokeStyle = "rgba(0,0,0,0.2)";
            ctx.stroke();

            ctx.restore();
        }
    }

    private leaveGame() {
        this.wasGameOverContinued = true;

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