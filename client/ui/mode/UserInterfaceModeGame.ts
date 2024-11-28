import { players, mobs, deltaTime, ws, uiCtx, antennaScaleFactor, networking } from "../../main";
import TerrainGenerator, { BIOME_TILESETS } from "../../utils/TerrainGenerator";
import { Button, SVGButton, TextButton } from "../components/Button";
import UserInterface, { BiomeSetter, uiScaleFactor } from "../UserInterface";
import Networking, { wameSelfId } from "../../Networking";
import TextInput from "../components/TextInput";
import { Biomes, Mood } from "../../../shared/enum";
import { interpolate } from "../../utils/Interpolator";
import { ServerBound } from "../../../shared/packet";

let interpolatedMouseX = 0;
let interpolatedMouseY = 0;

let mouseXOffset = 0;
let mouseYOffset = 0;

// Ui svg icons

export const CROSS_ICON_SVG: string = `<?xml version="1.0" encoding="iso-8859-1"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg fill="#e0e0e0" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="800px" height="800px" viewBox="0 0 41.756 41.756" xml:space="preserve"><g><path d="M27.948,20.878L40.291,8.536c1.953-1.953,1.953-5.119,0-7.071c-1.951-1.952-5.119-1.952-7.07,0L20.878,13.809L8.535,1.465c-1.951-1.952-5.119-1.952-7.07,0c-1.953,1.953-1.953,5.119,0,7.071l12.342,12.342L1.465,33.22c-1.953,1.953-1.953,5.119,0,7.071C2.44,41.268,3.721,41.755,5,41.755c1.278,0,2.56-0.487,3.535-1.464l12.343-12.342l12.343,12.343c0.976,0.977,2.256,1.464,3.535,1.464s2.56-0.487,3.535-1.464c1.953-1.953,1.953-5.119,0-7.071L27.948,20.878z"/></g></svg>`;

/**
 * Helper for draw mutable functions. (e.g. mouse movement helper)
 */
function renderMutableFunctions(canvas: HTMLCanvasElement) {
    const ARROW_START_DISTANCE = 30;

    const ctx = canvas.getContext("2d");
    const selfPlayer = players.get(wameSelfId);

    const widthRelative = canvas.width / uiScaleFactor;
    const heightRelative = canvas.height / uiScaleFactor;

    if (selfPlayer && !selfPlayer.isDead) {
        ctx.save();

        const adjustedScaleFactor = antennaScaleFactor * devicePixelRatio;

        ctx.translate(widthRelative / 2, heightRelative / 2);
        ctx.rotate(Math.atan2(interpolatedMouseY, interpolatedMouseX));
        ctx.scale(adjustedScaleFactor, adjustedScaleFactor);

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

/**
 * Calculate wave length.
 * 
 * @param x - Wave progress, number.
 */
export function calculateWaveLength(x: number) {
    return Math.max(60, x ** 0.2 * 18.9287 + 30)
}

/**
 * Ease out cubic function for smooth animation.
 * @param t - Normalized time (0 to 1).
 * @returns Eased value.
 */
function easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - t, 3);
}

/**
 * Current ui of menu.
 * 
 * @remarks
 * 
 * To store biome when ui switched.
 */
let gameUiCurrentBiome: Biomes = Biomes.GARDEN;

export default class UserInterfaceGame extends UserInterface implements BiomeSetter {
    private readonly DEAD_BACKGROUND_TARGET_OPACITY: number = 0.3;
    private readonly DEAD_BACKGROUND_FADE_DURATION: number = 0.3;
    private readonly DEAD_MENU_ANIMATION_DURATION: number = 2;

    public static readonly MAX_MESSAGE_QUEUE_AMOUNT = 128;

    public updateT: number;
    public t: number;

    public waveProgress: number;

    public waveProgressTimer: number;
    public waveProgressRedGageTimer: number;
    public oWaveProgressTimer: number;
    public oWaveProgressRedGageTimer: number;
    public nWaveProgressTimer: number;
    public nWaveProgressRedGageTimer: number;

    public worldSize: number;
    public oWorldSize: number;
    public nWorldSize: number;

    public waveEnded: boolean;

    private isDeadContinued: boolean;
    private isGameOverContinued: boolean;

    private deadMenuContinueButton: Button;
    private gameOverContinueButton: Button;

    private deadBackgroundOpacity: number;
    private youWillRespawnNextWaveOpacity: number;
    private gameOverOpacity: number;

    private isDeadAnimationActive: boolean;
    private deadContinueButtonY: number;
    private deadAnimationTimer: number;

    private chatInput: TextInput;
    public chats: string[];

    private terrainGenerator: TerrainGenerator;

    constructor(canvas: HTMLCanvasElement) {
        super(canvas);

        this.terrainGenerator = new TerrainGenerator();

        this.waveProgress = 0;

        this.updateT = 0;

        this.waveProgressTimer = this.waveProgressRedGageTimer = this.worldSize = 0;
        this.oWaveProgressTimer = this.oWaveProgressRedGageTimer = this.oWorldSize = 0;
        this.nWaveProgressTimer = this.nWaveProgressRedGageTimer = this.nWorldSize = 0;

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
    }

    onKeyDown(event: KeyboardEvent): void {
        switch (event.key) {
            // Space means space
            case " ":
            case "Shift": {
                networking.sendMood(event.key === " " ? Mood.ANGRY : Mood.SAD);

                break;
            }
            case "Enter": {
                // So basically user entered while chat input, blur it
                // No blur in onsubmit because of race condition
                if (this.chatInput.hasFocus()) {
                    this.chatInput.blur();
                } else {
                    const selfPlayer = players.get(wameSelfId);
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
    onKeyUp(event: KeyboardEvent): void {
        switch (event.key) {
            // Space means space
            case " ":
            case "Shift": {
                networking.sendMood(Mood.NORMAL);

                break;
            }
        }
    }

    onMouseDown(event: MouseEvent): void {
        if (networking) {
            if (event.button === 0 || event.button === 2) {
                networking.sendMood(event.button === 0 ? Mood.ANGRY : event.button === 2 ? Mood.SAD : Mood.NORMAL);
            }
        }
    }
    onMouseUp(event: MouseEvent): void {
        if (networking) {
            if (event.button === 0 || event.button === 2) {
                networking.sendMood(Mood.NORMAL);
            }
        }
    }
    onMouseMove(event: MouseEvent): void {
        mouseXOffset = event.clientX - document.documentElement.clientWidth / 2;
        mouseYOffset = event.clientY - document.documentElement.clientHeight / 2;

        if (networking) {
            const distance = Math.hypot(mouseXOffset, mouseYOffset);
            const angle = Math.atan2(mouseYOffset, mouseXOffset);
            networking.sendAngle(angle, distance < 50 ? distance / 100 : 1);
        }
    }

    private leaveGame() {
        this.isGameOverContinued = true;

        ws.send(new Uint8Array([ServerBound.WAVE_LEAVE]));

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
                ws.send(new Uint8Array([ServerBound.WAVE_LEAVE]));
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

        // TODO: dont continue if 

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

                borderColor: "#000000",
                borderRadius: 4,
                borderWidth: 2.2,
                maxlength: 80,

                unfocusedState: true,

                onsubmit: (e, self) => {
                    const chatMessage = self.value();
                    // Send chat
                    ws.send(new Uint8Array([ServerBound.WAVE_CHAT_SENT, chatMessage.length, ...new TextEncoder().encode(chatMessage)]));

                    self.value("");
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
            this.worldSize = this.oWorldSize + (this.nWorldSize - this.oWorldSize) * this.t;
        }

        const canvas = this.canvas;
        const ctx = canvas.getContext("2d");

        interpolatedMouseX = interpolate(interpolatedMouseX, mouseXOffset / antennaScaleFactor, 50);
        interpolatedMouseY = interpolate(interpolatedMouseY, mouseYOffset / antennaScaleFactor, 50);

        const widthRelative = canvas.width / uiScaleFactor;
        const heightRelative = canvas.height / uiScaleFactor;

        const centerWidth = widthRelative / 2;
        const centerHeight = heightRelative / 2;

        const selfPlayer = players.get(wameSelfId);
        if (!selfPlayer) {
            return;
        }

        // Update entities
        {
            for (const mob of mobs.values()) {
                mob.update();
            }

            for (const player of players.values()) {
                player.update();
            }
        }

        // Render map
        this.terrainGenerator.renderMap(canvas, BIOME_TILESETS.get(this.biome), this.worldSize, selfPlayer.x, selfPlayer.y);

        // Render players&mobs
        {
            ctx.save();

            ctx.translate(centerWidth, centerHeight);
            ctx.scale(antennaScaleFactor, antennaScaleFactor);
            ctx.translate(-selfPlayer.x, -selfPlayer.y);

            mobs.forEach((v, k) => {
                v.draw(ctx);
                if (v.isDead && v.deadT > 1) {
                    mobs.delete(k);
                }
            });

            players.forEach((v, k) => {
                v.draw(ctx);
                if (v.isDead && v.deadT > 1 && v.isDeleted) {
                    players.delete(k);
                }
            });

            ctx.restore();
        }

        // Ocean background (its pattern but i dont know how)
        if (this.biome === Biomes.OCEAN) {
            ctx.save();

            ctx.globalCompositeOperation = "multiply";
            ctx.fillStyle = "#CCDBF2";
            ctx.fillRect(0, 0, widthRelative, heightRelative);

            ctx.restore();
        }

        // Render mutable functions
        renderMutableFunctions(canvas);

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

                // ctx.globalAlpha = 0.9;

                {
                    ctx.save();

                    ctx.lineWidth = 25;
                    ctx.lineCap = "round";
                    ctx.strokeStyle = "black";
                    ctx.beginPath();
                    ctx.lineTo(centerWidth - WAVE_PROGRESS_BAR_LENGTH, WAVE_PROGRESS_BAR_Y);
                    ctx.lineTo(centerWidth + WAVE_PROGRESS_BAR_LENGTH, WAVE_PROGRESS_BAR_Y);
                    ctx.stroke();

                    ctx.restore();
                }

                {
                    ctx.save();

                    ctx.lineWidth = Math.min((this.waveProgressTimer / maxSpawnTime) * (maxSpawnTime * 16.6666), 18.5);
                    ctx.lineCap = "round";
                    ctx.strokeStyle = "#6dbd7f";
                    ctx.beginPath();
                    ctx.lineTo(centerWidth - WAVE_PROGRESS_BAR_LENGTH, WAVE_PROGRESS_BAR_Y);
                    ctx.lineTo(centerWidth - WAVE_PROGRESS_BAR_LENGTH + (WAVE_PROGRESS_BAR_LENGTH * 2) * (this.waveProgressTimer / maxSpawnTime), WAVE_PROGRESS_BAR_Y);
                    ctx.stroke();

                    ctx.restore();
                }

                {
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

                const biomeText = Biomes[this.biome].toLocaleLowerCase();
                const capitalizedBiomeText = biomeText[0].toUpperCase() + biomeText.slice(1);

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
                        ctx.lineWidth = 1;

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

                        this.gameOverContinueButton.setX(centerWidth - (this.gameOverContinueButton.w / 2));
                        this.gameOverContinueButton.setY(centerHeight + 35);
                        this.gameOverContinueButton.setVisible(true);
                        this.gameOverContinueButton.setGlobalAlpha(this.gameOverOpacity);

                        ctx.save();

                        ctx.globalAlpha = this.gameOverOpacity;

                        ctx.lineJoin = 'round';
                        ctx.lineCap = 'round';
                        ctx.textBaseline = 'middle';
                        ctx.textAlign = 'center';
                        ctx.strokeStyle = '#000000';
                        ctx.fillStyle = "#f0666b";
                        ctx.font = "34px Ubuntu";

                        ctx.lineWidth = 3;

                        ctx.strokeText("GAME OVER", centerWidth, centerHeight);
                        ctx.fillText("GAME OVER", centerWidth, centerHeight);

                        ctx.fillStyle = "white";
                        ctx.font = "12px Ubuntu";
                        ctx.lineWidth = 1.2;

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
                    ctx.lineWidth = 1.5;

                    ctx.strokeText("You were destroyed by:", 0, -81);
                    ctx.fillText("You were destroyed by:", 0, -81);

                    ctx.font = "16.1px Ubuntu";
                    ctx.lineWidth = 2;

                    ctx.strokeText("You", 0, -61);
                    ctx.fillText("You", 0, -61);

                    ctx.font = "12px Ubuntu";
                    ctx.lineWidth = 1.2;

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

    public cleanup(): void {
        this.terrainGenerator = undefined;

        players.clear();
        mobs.clear();
    }

    set biome(biome: Biomes) {
        gameUiCurrentBiome = biome;
    }

    get biome(): Biomes {
        return gameUiCurrentBiome;
    }
}