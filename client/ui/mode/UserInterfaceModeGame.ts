import { ARROW_START_DISTANCE, CROSS_ICON_SVG, MOLECULE_SVG, SCROLL_UNFURLED_SVG, SWAP_BAG_SVG } from "../../constants";
import EntityMob from "../../entity/EntityMob";
import { players, mobs, scaleFactor, interpolatedMouseX, interpolatedMouseY, deltaTime, ws, uiManager, antennaScaleFactor } from "../../main";
import TilesetManager, { BIOME_TILESETS } from "../../utils/WorldManager";
import { ComponentButton, ComponentSVGButton, ComponentTextButton } from "../components/ComponentButton";
import UserInterface from "../UserInterface";
import { selfId } from "../../Networking";
import { Biomes } from "../../../shared/biomes";
import { PacketKind } from "../../../shared/packet";

/**
 * Helper for draw mutable functions. (e.g. mouse movement helper)
 */
function drawMutableFunctions(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    const selfPlayer = players.get(selfId);

    const widthRelative = canvas.width / scaleFactor;
    const heightRelative = canvas.height / scaleFactor;

    if (selfPlayer && !selfPlayer.isDead) {
        ctx.save();

        const adjustedScaleFactor = antennaScaleFactor * devicePixelRatio;

        ctx.translate(widthRelative / 2, heightRelative / 2);
        ctx.rotate(Math.atan2(interpolatedMouseY, interpolatedMouseX));
        ctx.scale(adjustedScaleFactor, adjustedScaleFactor);

        const distance = Math.hypot(interpolatedMouseX, interpolatedMouseY) / scaleFactor;

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

export default class UserInterfaceGame extends UserInterface {
    private readonly DEAD_BACKGROUND_TARGET_OPACITY: number = 0.3;
    private readonly DEAD_BACKGROUND_FADE_DURATION: number = 0.3;
    private readonly DEAD_MENU_ANIMATION_DURATION: number = 2;

    private worldManager: TilesetManager;

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

    private isDeadMenuContinued: boolean;
    private isGameOverContinued: boolean;

    private deadMenuContinueButton: ComponentButton;
    private gameOverContinueButton: ComponentButton;

    private deadBackgroundOpacity: number;
    private youWillRespawnNextWaveOpacity: number;
    private gameOverOpacity: number;

    private isDeadAnimationActive: boolean;
    private deadAnimationY: number;
    private deadAnimationTimer: number;

    public waveEnded: boolean;

    constructor(canvas: HTMLCanvasElement) {
        super(canvas);

        this.worldManager = new TilesetManager();

        this.waveProgress = 0;

        this.updateT = 0;

        this.waveProgressTimer = this.waveProgressRedGageTimer = this.worldSize = 0;
        this.oWaveProgressTimer = this.oWaveProgressRedGageTimer = this.oWorldSize = 0;
        this.nWaveProgressTimer = this.nWaveProgressRedGageTimer = this.nWorldSize = 0;

        this.isDeadMenuContinued = false;
        this.isGameOverContinued = false;

        this.deadAnimationY = -50;
        this.deadAnimationTimer = 0;
        this.isDeadAnimationActive = false;

        this.deadBackgroundOpacity = 0;
        this.youWillRespawnNextWaveOpacity = 0;
        this.gameOverOpacity = 0;

        this.waveEnded = false;
    }

    protected initializeComponents(): void {
        const widthRelative = this.canvas.width / scaleFactor;
        const heightRelative = this.canvas.height / scaleFactor;

        const exitButton = new ComponentSVGButton(
            {
                x: 6,
                y: 6,
                width: 17.5,
                height: 17.5,
            },
            "#b04c5e",
            () => {
                ws.send(new Uint8Array([PacketKind.WAVE_ROOM_GAME_LEAVE]));
                uiManager.switchUI("menu");
            },
            CROSS_ICON_SVG,
        );

        this.addComponent(exitButton);

        // Order is important!
        
        this.gameOverContinueButton = new ComponentTextButton(
            {
                x: 0,
                y: 0,
                width: 95,
                height: 27,
            },
            "#c62327",
            () => {
                this.isGameOverContinued = true;

                ws.send(new Uint8Array([PacketKind.WAVE_ROOM_GAME_LEAVE]));
                uiManager.switchUI("menu");
            },
            "Continue"
        );

        // Dont show every frame
        this.gameOverContinueButton.visible = false;

        this.addComponent(this.gameOverContinueButton);

        this.deadMenuContinueButton = new ComponentTextButton(
            {
                x: 0,
                y: 0,
                width: 95,
                height: 27,
            },
            "#1dd129",
            () => {
                this.isDeadMenuContinued = true;
            },
            "Continue"
        );

        // Dont show every frame
        this.deadMenuContinueButton.visible = false;

        this.addComponent(this.deadMenuContinueButton);
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

        const widthRelative = canvas.width / scaleFactor;
        const heightRelative = canvas.height / scaleFactor;

        const centerWidth = widthRelative / 2;
        const centerHeight = heightRelative / 2;

        const selfPlayer = players.get(selfId);
        if (!selfPlayer) {
            return;
        }

        for (const mob of mobs.values()) {
            mob.update();
        }

        for (const player of players.values()) {
            player.update();
        }

        this.worldManager.constructWorld(canvas, BIOME_TILESETS.get(gameUiCurrentBiome), this.worldSize, selfPlayer.x, selfPlayer.y);

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
        });

        ctx.restore();

        // Ocean background (its pattern but i dont know how)
        {
            if (gameUiCurrentBiome === Biomes.OCEAN) {
                ctx.save();

                ctx.globalCompositeOperation = "multiply";
                ctx.fillStyle = "#CCDBF2";
                ctx.fillRect(0, 0, widthRelative, heightRelative);

                ctx.restore();
            }
        }

        drawMutableFunctions(canvas);

        // Wave bar
        {
            ctx.save();

            const WAVE_PROGRESS_BAR_LENGTH = 135;
            const WAVE_PROGRESS_BAR_Y = 45;

            ctx.translate(centerWidth, WAVE_PROGRESS_BAR_Y);
            ctx.scale(0.4, 0.4);
            ctx.translate(-centerWidth, -WAVE_PROGRESS_BAR_Y);

            {
                ctx.save();

                const maxSpawnTime = calculateWaveLength(this.waveProgress);

                ctx.globalAlpha = 0.9;

                ctx.save();

                ctx.lineWidth = 25;
                ctx.lineCap = "round";
                ctx.strokeStyle = "black";
                ctx.beginPath();
                ctx.lineTo(centerWidth - WAVE_PROGRESS_BAR_LENGTH, WAVE_PROGRESS_BAR_Y);
                ctx.lineTo(centerWidth + WAVE_PROGRESS_BAR_LENGTH, WAVE_PROGRESS_BAR_Y);
                ctx.stroke();

                ctx.restore();

                ctx.save();

                ctx.lineWidth = Math.min((this.waveProgressTimer / maxSpawnTime) * (maxSpawnTime * 16.6666), 18.5);
                ctx.lineCap = "round";
                ctx.strokeStyle = "#6dbd7f";
                ctx.beginPath();
                ctx.lineTo(centerWidth - WAVE_PROGRESS_BAR_LENGTH, WAVE_PROGRESS_BAR_Y);
                ctx.lineTo(centerWidth - WAVE_PROGRESS_BAR_LENGTH + (WAVE_PROGRESS_BAR_LENGTH * 2) * (this.waveProgressTimer / maxSpawnTime), WAVE_PROGRESS_BAR_Y);
                ctx.stroke();

                ctx.restore();

                ctx.save();

                ctx.lineWidth = Math.min((this.waveProgressRedGageTimer / maxSpawnTime) * (maxSpawnTime * 16.6666), 15);
                ctx.lineCap = "round";
                ctx.strokeStyle = "#e32933";
                ctx.beginPath();
                ctx.lineTo(centerWidth - WAVE_PROGRESS_BAR_LENGTH, WAVE_PROGRESS_BAR_Y);
                ctx.lineTo(centerWidth - WAVE_PROGRESS_BAR_LENGTH + (WAVE_PROGRESS_BAR_LENGTH * 2) * (this.waveProgressRedGageTimer / maxSpawnTime), WAVE_PROGRESS_BAR_Y);
                ctx.stroke();

                ctx.restore();

                ctx.font = "1em Ubuntu, sans-serif";
                ctx.textBaseline = 'middle';
                ctx.textAlign = 'center';
                ctx.lineWidth = 3;
                ctx.strokeStyle = '#000000';
                ctx.strokeText("Wave " + this.waveProgress, centerWidth, WAVE_PROGRESS_BAR_Y);
                ctx.fillStyle = "white";
                ctx.fillText("Wave " + this.waveProgress, centerWidth, WAVE_PROGRESS_BAR_Y);

                ctx.restore();
            }

            {
                ctx.save();

                const _biomeText = Biomes[gameUiCurrentBiome].toLocaleLowerCase();
                const biomeText = _biomeText[0].toUpperCase() + _biomeText.slice(1);

                ctx.font = "2em Ubuntu, sans-serif";
                ctx.textBaseline = 'middle';
                ctx.textAlign = 'center';
                ctx.lineWidth = 4;
                ctx.strokeStyle = '#000000';
                ctx.strokeText(biomeText, centerWidth, WAVE_PROGRESS_BAR_Y - 36);
                ctx.fillStyle = "white";
                ctx.fillText(biomeText, centerWidth, WAVE_PROGRESS_BAR_Y - 36);

                ctx.restore();
            }

            ctx.restore();
        }

        // Dead menu
        {
            const resetFunc = () => {
                this.deadMenuContinueButton.visible = false;
                // this.gameOverContinueButton.visible = false;

                this.isDeadAnimationActive = false;
                this.deadAnimationY = -50;
                this.deadAnimationTimer = 0;

                this.deadBackgroundOpacity = 0;
                this.youWillRespawnNextWaveOpacity = 0;
                this.gameOverOpacity = 0;
            };

            {
                ctx.save();

                ctx.globalAlpha = this.deadBackgroundOpacity;
                ctx.fillStyle = 'black';
                ctx.fillRect(0, 0, widthRelative, heightRelative);

                ctx.restore()
            };

            // The reason this is not in the isDead block is to fade-out when revived
            {
                if (this.isDeadMenuContinued && !this.waveEnded && selfPlayer.isDead) {
                    if (this.youWillRespawnNextWaveOpacity <= 1) {
                        this.youWillRespawnNextWaveOpacity += 0.02;
                    }
                } else {
                    if (this.youWillRespawnNextWaveOpacity >= 0) {
                        this.youWillRespawnNextWaveOpacity -= 0.02;
                    }
                }

                this.youWillRespawnNextWaveOpacity = Math.max(Math.min(this.youWillRespawnNextWaveOpacity, 1), 0);

                ctx.save();

                ctx.translate(centerWidth, 300);

                ctx.save();

                ctx.globalAlpha = Math.min(this.youWillRespawnNextWaveOpacity, 0.5);

                ctx.strokeStyle = 'black';
                ctx.beginPath();
                ctx.roundRect(-(116 / 2), -(16 / 2), 116, 16, 1);
                ctx.fill();

                ctx.restore();

                ctx.save();

                ctx.globalAlpha = this.youWillRespawnNextWaveOpacity;

                ctx.textBaseline = 'middle';
                ctx.textAlign = 'center';
                ctx.strokeStyle = '#000000';
                ctx.fillStyle = "white";
                ctx.font = "8.4px Ubuntu, sans-serif";
                ctx.lineWidth = 1;
                ctx.strokeText("You will respawn next wave", 0, 0);
                ctx.fillText("You will respawn next wave", 0, 0);

                ctx.restore();

                ctx.restore();
            }

            if (selfPlayer.isDead) {
                if (
                    this.deadBackgroundOpacity < this.DEAD_BACKGROUND_TARGET_OPACITY && 
                    // Stop fade-out blocking
                    !(this.isDeadMenuContinued && !this.waveEnded)
                ) {
                    this.deadBackgroundOpacity = Math.min(
                        this.deadBackgroundOpacity + (deltaTime / 1000 / this.DEAD_BACKGROUND_FADE_DURATION) * this.DEAD_BACKGROUND_TARGET_OPACITY,
                        this.DEAD_BACKGROUND_TARGET_OPACITY
                    );
                }

                if (this.isDeadMenuContinued) {
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

                        this.gameOverContinueButton.x = centerWidth - (this.gameOverContinueButton.w / 2);
                        this.gameOverContinueButton.y = centerHeight + 35;
                        this.gameOverContinueButton.visible = true;
                        this.gameOverContinueButton.opacity = this.gameOverOpacity;

                        ctx.save();

                        ctx.globalAlpha = this.gameOverOpacity;

                        ctx.textBaseline = 'middle';
                        ctx.textAlign = 'center';
                        ctx.strokeStyle = '#000000';
                        ctx.fillStyle = "#f0666b";
                        ctx.font = "34px Ubuntu, sans-serif";
                        ctx.lineWidth = 3;
                        ctx.strokeText("GAME OVER", centerWidth, centerHeight);
                        ctx.fillText("GAME OVER", centerWidth, centerHeight);

                        ctx.restore();
                    };

                    if (this.deadAnimationY >= -100) {
                        this.deadAnimationTimer -= deltaTime / 300;
                        this.deadAnimationY = -100 + easeOutCubic(Math.max(this.deadAnimationTimer / this.DEAD_MENU_ANIMATION_DURATION, 0)) * (centerHeight - (-100));
                    }
                } else {
                    if (!this.isDeadAnimationActive) {
                        this.deadAnimationY = -50;
                        this.deadAnimationTimer = 0;
                        this.isDeadAnimationActive = true;
                    }

                    if (this.deadAnimationTimer < this.DEAD_MENU_ANIMATION_DURATION && this.deadAnimationY <= centerHeight + 50) {
                        this.deadAnimationTimer += deltaTime / 1000;
                        this.deadAnimationY = -50 + easeOutCubic(Math.min(this.deadAnimationTimer / this.DEAD_MENU_ANIMATION_DURATION, 1)) * (centerHeight + 50);
                    }
                }

                {
                    ctx.save();

                    this.deadMenuContinueButton.x = centerWidth - (this.deadMenuContinueButton.w / 2);
                    this.deadMenuContinueButton.y = this.deadAnimationY + 50;
                    this.deadMenuContinueButton.visible = true;

                    ctx.translate(centerWidth, this.deadAnimationY);

                    ctx.textBaseline = 'middle';
                    ctx.textAlign = 'center';
                    ctx.strokeStyle = '#000000';
                    ctx.fillStyle = "white";

                    ctx.font = "12.2px Ubuntu, sans-serif";
                    ctx.lineWidth = 1.5;

                    ctx.strokeText("You were destroyed by:", 0, -81);
                    ctx.fillText("You were destroyed by:", 0, -81);

                    ctx.font = "16.1px Ubuntu, sans-serif";
                    ctx.lineWidth = 2;

                    ctx.strokeText("Poison", 0, -61);
                    ctx.fillText("Poison", 0, -61);

                    ctx.restore();
                };
            } else {
                resetFunc();
            }
        }

        this.render();
    }

    public cleanup(): void {
        this.worldManager = undefined;
    }

    public setBiome(biome: Biomes) {
        gameUiCurrentBiome = biome;
    }
}