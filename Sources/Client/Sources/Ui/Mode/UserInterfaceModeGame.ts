import { Biomes, biomeToCapitalizedBiomeString, WAVE_BIOME_GAUGE_COLORS } from "../../../../Shared/biome";
import { calculateWaveLength } from "../../../../Shared/formula";
import { Mood } from "../../../../Shared/mood";
import { networking, players, uiCtx, deltaTime, antennaScaleFactor, mobs } from "../../../main";
import Entity from "../../Entity/Entity";
import Mob from "../../Entity/Mob";
import { isPetal } from "../../Utils/common";
import { interpolate } from "../../Utils/Interpolator";
import { waveSelfId } from "../../Utils/Networking";
import { isSettingTrue } from "../../Utils/settingStorage";
import TerrainGenerator, { BIOME_TILESETS, oceanBackgroundPatternTileset } from "../../Utils/TerrainGenerator";
import { TextButton, SVGButton } from "../Components/Button";
import { calculateStrokeWidth } from "../Components/Text";
import TextInput from "../Components/TextInput";
import UserInterface, { uiScaleFactor } from "../UserInterface";

let interpolatedMouseX = 0;
let interpolatedMouseY = 0;

let mouseXOffset = 0;
let mouseYOffset = 0;

// Ui svg icons

export const CROSS_ICON_SVG: string = `<?xml version="1.0" encoding="iso-8859-1"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg fill="#cccccc" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="800px" height="800px" viewBox="0 0 41.756 41.756" xml:space="preserve"><g><path d="M27.948,20.878L40.291,8.536c1.953-1.953,1.953-5.119,0-7.071c-1.951-1.952-5.119-1.952-7.07,0L20.878,13.809L8.535,1.465c-1.951-1.952-5.119-1.952-7.07,0c-1.953,1.953-1.953,5.119,0,7.071l12.342,12.342L1.465,33.22c-1.953,1.953-1.953,5.119,0,7.071C2.44,41.268,3.721,41.755,5,41.755c1.278,0,2.56-0.487,3.535-1.464l12.343-12.342l12.343,12.343c0.976,0.977,2.256,1.464,3.535,1.464s2.56-0.487,3.535-1.464c1.953-1.953,1.953-5.119,0-7.071L27.948,20.878z"/></g></svg>`;

/**
 * Ease out cubic function for smooth animation.
 * @param t - Normalized time (0 to 1).
 * @returns Eased value.
 */
function easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - t, 3);
}

/**
 * Current ui of menu
 */
let gameUiCurrentBiome: Biomes = Biomes.Garden;

export default class UserInterfaceGame extends UserInterface {
    private readonly DEAD_BACKGROUND_TARGET_OPACITY: number = 0.3;
    private readonly DEAD_BACKGROUND_FADE_DURATION: number = 0.3;
    private readonly DEAD_MENU_ANIMATION_DURATION: number = 2;

    public updateT: number;
    public t: number;

    public waveProgress: number;

    public waveProgressTimer: number;
    public waveProgressRedGageTimer: number;
    public oWaveProgressTimer: number;
    public oWaveProgressRedGageTimer: number;
    public nWaveProgressTimer: number;
    public nWaveProgressRedGageTimer: number;

    public waveEnded: boolean;

    public mapRadius: number;
    public oMapRadius: number;
    public nMapRadius: number;

    private isDeadContinued: boolean;
    private isGameOverContinued: boolean;

    private deadMenuContinueButton: TextButton;
    private gameOverContinueButton: TextButton;

    private deadBackgroundOpacity: number;
    private youWillRespawnNextWaveOpacity: number;
    private gameOverOpacity: number;

    private isDeadAnimationActive: boolean;
    private deadContinueButtonY: number;
    private deadAnimationTimer: number;

    public chats: string[];
    private chatInput: TextInput;

    private terrainGenerator: TerrainGenerator;

    private currentMoodFlags: number;

    private oceanBackgroundX: number;
    private oceanBackgroundY: number;
    private oceanBackgroundWaveStep: number;

    constructor(canvas: HTMLCanvasElement) {
        super(canvas);

        this.terrainGenerator = new TerrainGenerator();

        this.waveProgress = 0;

        this.updateT = 0;

        this.waveProgressTimer = this.waveProgressRedGageTimer = this.mapRadius = 0;
        this.oWaveProgressTimer = this.oWaveProgressRedGageTimer = this.oMapRadius = 0;
        this.nWaveProgressTimer = this.nWaveProgressRedGageTimer = this.nMapRadius = 0;

        this.isDeadContinued = false;
        this.isGameOverContinued = false;

        this.deadContinueButtonY = -50;
        this.deadAnimationTimer = 0;
        this.isDeadAnimationActive = false;

        this.deadBackgroundOpacity = 0;
        this.youWillRespawnNextWaveOpacity = 0;
        this.gameOverOpacity = 0;

        this.waveEnded = false;

        this.chats = [];

        this.currentMoodFlags = Mood.Normal;

        this.oceanBackgroundX = 0;
        this.oceanBackgroundY = 0;
        this.oceanBackgroundWaveStep = 0;
    }

    public onKeyDown(event: KeyboardEvent): void {
        switch (event.key) {
            // Space means space
            case " ": {
                this.currentMoodFlags |= Mood.Angry;
                networking.sendChangeMood(this.currentMoodFlags);

                break;
            }
            case "Shift": {
                this.currentMoodFlags |= Mood.Sad;
                networking.sendChangeMood(this.currentMoodFlags);

                break;
            }

            case "Enter": {
                if (this.chatInput.hasFocus) {
                    this.chatInput.blur();
                } else {
                    const selfPlayer = players.get(waveSelfId);
                    if (!selfPlayer) {
                        return;
                    }

                    if (selfPlayer.isDead) {
                        if (this.isDeadContinued) this.leaveGame();

                        if (!this.isDeadContinued) {
                            this.isDeadContinued = true;
                        }
                    }

                    if (this.chatInput) this.chatInput.focus();
                }

                break;
            }

            default: {
                // Slot swapping
                if (networking) {
                    if (event.code.startsWith("Digit")) {
                        let index = parseInt(event.code.slice(5));
                        if (index === 0) {
                            index = 10;
                        }

                        index--;
                        networking.sendSwapPetal(index);
                    }
                }

                break;
            }
        }
    }
    public onKeyUp(event: KeyboardEvent): void {
        switch (event.key) {
            // Space means space
            case " ": {
                this.currentMoodFlags &= ~Mood.Angry;
                networking.sendChangeMood(this.currentMoodFlags);
                break;
            }
            case "Shift": {
                this.currentMoodFlags &= ~Mood.Sad;
                networking.sendChangeMood(this.currentMoodFlags);
                break;
            }
        }
    }

    public onMouseDown(event: MouseEvent): void {
        if (networking) {
            if (event.button === 0) {
                this.currentMoodFlags |= Mood.Angry;
                networking.sendChangeMood(this.currentMoodFlags);
            }

            if (event.button === 2) {
                this.currentMoodFlags |= Mood.Sad;
                networking.sendChangeMood(this.currentMoodFlags);
            }
        }
    }
    public onMouseUp(event: MouseEvent): void {
        if (networking) {
            if (event.button === 0) {
                this.currentMoodFlags &= ~Mood.Angry;
                networking.sendChangeMood(this.currentMoodFlags);
            }

            if (event.button === 2) {
                this.currentMoodFlags &= ~Mood.Sad;
                networking.sendChangeMood(this.currentMoodFlags);
            }
        }
    }
    public onMouseMove(event: MouseEvent): void {
        mouseXOffset = event.clientX - document.documentElement.clientWidth / 2;
        mouseYOffset = event.clientY - document.documentElement.clientHeight / 2;

        if (
            !isSettingTrue("keyboard_control") &&
            networking
        ) {
            const distance = Math.hypot(mouseXOffset, mouseYOffset);
            const angle = Math.atan2(mouseYOffset, mouseXOffset);
            networking.sendChangeMove(angle, distance < 100 ? distance / 100 : 1);
        }
    }

    private leaveGame() {
        this.isGameOverContinued = true;

        networking.sendLeave();

        uiCtx.switchUI("title");
    }

    protected initializeComponents(): void {
        const exitButton = new SVGButton(
            {
                x: 6,
                y: 6,
                w: 17.5,
                h: 17.5,
            },
            "#b04c5e",
            () => {
                networking.sendLeave();
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
            "Continue"
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
                this.isDeadContinued = true;
            },
            () => true,
            "Continue"
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
                    networking.sendChat(self.value);

                    self.value = "";
                },
            },
        );

        this.addComponent(this.chatInput);
    }

    public animationFrame() {
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

        let savedFillStyle = ctx.fillStyle;
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = savedFillStyle;

        const selfPlayer = players.get(waveSelfId);
        if (!selfPlayer) {
            return;
        }

        // Render map
        this.terrainGenerator.renderMap({
            canvas,
            tilesets: BIOME_TILESETS.get(this.biome),
            tilesetSize: 300,
            radius: this.mapRadius,
            playerX: selfPlayer.x,
            playerY: selfPlayer.y,
        });

        // Render mutable functions
        this.drawMutableFunctions(canvas);

        // Update entities
        {
            mobs.forEach((mob, k) => {
                mob.update();

                if (mob.isDead && mob.deadT > 1) {
                    mobs.delete(k);
                }
            });

            players.forEach((player, k) => {
                player.update();

                // Only remove when disconnected
                if (
                    player.isDead && player.deadT > 1 &&
                    player.isRemoved
                ) {
                    players.delete(k);
                }
            });
        }

        // Render players & mobs
        {
            const viewportWidth = canvas.width / antennaScaleFactor;
            const viewportHeight = canvas.height / antennaScaleFactor;
            const halfWidth = viewportWidth / 2;
            const halfHeight = viewportHeight / 2;

            const a1 = selfPlayer.x - halfWidth;
            const a2 = selfPlayer.x + halfWidth;
            const b1 = selfPlayer.y - halfHeight;
            const b2 = selfPlayer.y + halfHeight;

            const entitiesToDraw: Entity[] = new Array(mobs.size + players.size);

            let i = 0;
            const filterFunc = (v: Entity) => {
                if (
                    v.x >= a1 &&
                    v.x <= a2 &&
                    v.y >= b1 &&
                    v.y <= b2
                ) entitiesToDraw[i++] = v;
            };

            mobs.forEach(filterFunc);

            entitiesToDraw.sort((a, b) => Number(a instanceof Mob && isPetal(a.type)) - Number(b instanceof Mob && isPetal(b.type)));

            players.forEach(filterFunc);

            ctx.save();

            ctx.translate(centerWidth, centerHeight);
            ctx.scale(antennaScaleFactor, antennaScaleFactor);
            ctx.translate(-selfPlayer.x, -selfPlayer.y);

            entitiesToDraw.forEach((v, k) => v.draw(ctx));

            ctx.restore();
        }

        // Ocean pattern background
        if (this.biome === Biomes.Ocean) {
            this.oceanBackgroundX += 0.4;
            this.oceanBackgroundY += Math.sin(this.oceanBackgroundWaveStep / 20) * 0.4;
            this.oceanBackgroundWaveStep += 0.07;

            if (oceanBackgroundPatternTileset) {
                ctx.save();

                ctx.globalAlpha = 0.3;

                this.terrainGenerator.renderMapMenu({
                    canvas,
                    tilesets: [oceanBackgroundPatternTileset],
                    tilesetSize: 350,
                    translateX: this.oceanBackgroundX,
                    translateY: this.oceanBackgroundY,
                });

                ctx.restore();
            }
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
                    ctx.strokeStyle = WAVE_BIOME_GAUGE_COLORS[this.biome];
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

                const capitalizedBiomeText = biomeToCapitalizedBiomeString(this.biome);

                ctx.lineJoin = 'round';
                ctx.lineCap = 'round';
                ctx.font = "2em Ubuntu";
                ctx.textBaseline = 'middle';
                ctx.textAlign = 'center';
                ctx.lineWidth = 4;
                ctx.strokeStyle = '#000000';
                ctx.fillStyle = "white";

                ctx.strokeText(capitalizedBiomeText, centerWidth, WAVE_PROGRESS_BAR_Y - 36);
                ctx.fillText(capitalizedBiomeText, centerWidth, WAVE_PROGRESS_BAR_Y - 36);

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

                ctx.restore()
            };

            // The reason this is not in the isDead block is to fade-out when revived
            {
                if (this.isDeadContinued && !this.waveEnded && selfPlayer.isDead) {
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
                    !(this.isDeadContinued && !this.waveEnded)
                ) {
                    this.deadBackgroundOpacity = Math.min(
                        this.deadBackgroundOpacity + (deltaTime / 1000 / this.DEAD_BACKGROUND_FADE_DURATION) * this.DEAD_BACKGROUND_TARGET_OPACITY,
                        this.DEAD_BACKGROUND_TARGET_OPACITY
                    );
                }

                if (this.isDeadContinued) {
                    if (!this.waveEnded) {
                        // Only fade-out when not game over
                        this.deadBackgroundOpacity = Math.max(
                            0,
                            this.deadBackgroundOpacity - (deltaTime / 1000 / this.DEAD_BACKGROUND_FADE_DURATION) * this.DEAD_BACKGROUND_TARGET_OPACITY
                        );
                    } else {
                        if (!this.isGameOverContinued) {
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
                    };

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
                };
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

    public dispose(): void {
        this.terrainGenerator = undefined;

        players.clear();
        mobs.clear();
    }

    public onContextChanged(): void {
        // Fake dead animation
        const player = players.get(waveSelfId);
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
        const selfPlayer = players.get(waveSelfId);

        const widthRelative = canvas.width / uiScaleFactor;
        const heightRelative = canvas.height / uiScaleFactor;

        if (
            !isSettingTrue("keyboard_control") &&
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

    set biome(biome: Biomes) {
        gameUiCurrentBiome = biome;
    }

    get biome(): Biomes {
        return gameUiCurrentBiome;
    }
}