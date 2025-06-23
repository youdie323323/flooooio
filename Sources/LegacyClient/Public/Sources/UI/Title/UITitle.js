"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Mob_1 = __importDefault(require("../../Entity/Mob"));
const EntityType_1 = require("../../Native/Entity/EntityType");
const RendererRenderingLink_1 = require("../../Entity/Renderers/RendererRenderingLink");
const Container_1 = require("../Layout/Components/WellKnown/Container");
const StaticText_1 = __importDefault(require("../Layout/Components/WellKnown/StaticText"));
const TextInput_1 = __importDefault(require("../Layout/Components/WellKnown/TextInput"));
const Toggle_1 = __importDefault(require("../Layout/Components/WellKnown/Toggle"));
const ExtensionCollidable_1 = __importDefault(require("../Layout/Extensions/ExtensionCollidable"));
const UI_1 = __importStar(require("../UI"));
const Button_1 = require("../Layout/Components/WellKnown/Button");
const Logo_1 = require("../Layout/Components/WellKnown/Logo");
const UITitlePlayerProfile_1 = __importDefault(require("./UITitlePlayerProfile"));
const UICloseButton_1 = __importDefault(require("../Shared/UICloseButton"));
const discord_icon_svg_1 = __importDefault(require("./Assets/discord_icon.svg"));
const ExtensionTooltip_1 = __importDefault(require("../Layout/Extensions/ExtensionTooltip"));
const UITitleBottomLeftButtonGroup_1 = __importDefault(require("./BottomLeftButtonGroup/UITitleBottomLeftButtonGroup"));
const WaveRoomCode_1 = require("../../../../private/Sources/Wave/WaveRoomCode");
const Application_1 = require("../../../../Application");
const Petal_1 = require("../../Entity/Petal");
const Color_1 = require("../../Utils/Color");
const UITitleInventory_1 = __importDefault(require("./UITitleInventory"));
const Gauge_1 = __importStar(require("../Layout/Components/WellKnown/Gauge"));
const ExtensionCentering_1 = require("../Layout/Extensions/ExtensionCentering");
const TilesetRenderer_1 = require("../Shared/Tile/Tileset/TilesetRenderer");
const TilesetWavedRenderer_1 = __importDefault(require("../Shared/Tile/Tileset/TilesetWavedRenderer"));
const TAU = 2 * Math.PI;
function randomFloat(min, max) {
    return Math.random() * (max - min + 1) + min;
}
const SPAWNABLE_BACKGROUND_ENTITY_TYPES = [
    EntityType_1.PETAL_TYPES,
    // MOB_TYPES,
].flat();
const backgroundEntities = new Set();
function drawRoundedPolygon(ctx, x, y, radius, rotation, cornerPercent, numberOfCorners) {
    function getPolygonCorner(index, numberOfCorners) {
        const angle = ((index + 0.5) * TAU) / numberOfCorners;
        return [Math.sin(angle), Math.cos(angle)];
    }
    function lerp(p1, p2, t) {
        return [p1[0] * (1 - t) + p2[0] * t, p1[1] * (1 - t) + p2[1] * t];
    }
    ctx.translate(x, y);
    ctx.scale(radius, radius);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.beginPath();
    const corners = new Array(numberOfCorners);
    for (let i = 0; i < numberOfCorners; i++)
        corners[i] = getPolygonCorner(i, numberOfCorners);
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
function dynamicJoinArray(array, separatorFn) {
    return array.flatMap((item, index) => index ? [separatorFn(), item] : [item]);
}
class UITitle extends UI_1.default {
    constructor(canvas) {
        super(canvas);
        this.wavedBackgroundRendererBiome = new TilesetWavedRenderer_1.default();
        // Network dynamics
        this.waveRoomSelfId = -1;
        this.biome = 0 /* Biome.GARDEN */;
        this.CLIENTBOUND_HANDLERS = {
            [1 /* Clientbound.WAVE_ROOM_SELF_ID */]: (reader) => {
                this.waveRoomSelfId = reader.readUInt32();
            },
            [3 /* Clientbound.WAVE_ROOM_UPDATE */]: (reader) => {
                { // Read player informations
                    const waveClientCount = reader.readUInt8();
                    const informations = new Array(waveClientCount);
                    for (let i = 0; i < waveClientCount; i++) {
                        const id = reader.readUInt32();
                        const name = reader.readString() || "Unnamed";
                        const readyState = reader.readUInt8();
                        informations[i] = {
                            id,
                            name,
                            readyState,
                        };
                    }
                    this.waveRoomPlayerInformations = informations;
                }
                this.waveRoomCode = reader.readString();
                this.waveRoomState = reader.readUInt8();
                this.waveRoomVisible = reader.readUInt8();
                this.biome = reader.readUInt8();
            },
            [5 /* Clientbound.WAVE_STARTED */]: (reader) => {
                this.setVisibleSquadMenuContainer(false);
                Application_1.uiCtx.switchUI("game");
                const waveBiome = reader.readUInt8();
                if (Application_1.uiCtx.previousContext) {
                    Application_1.uiCtx.previousContext.biome = waveBiome;
                }
                if (Application_1.uiCtx.currentContext) {
                    Application_1.uiCtx.currentContext.biome = waveBiome;
                }
            },
            [4 /* Clientbound.WAVE_ROOM_JOIN_FAILED */]: (reader) => {
                // Reset squad state to render status text
                this.resetWaveState();
                this.statusTextRef = "Squad not found" /* SquadContainerStatusText.NOT_FOUND */;
            },
        };
        document.onmouseout = this.mouseup;
        this.lastBackgroundEntitySpawn = Date.now();
        this.statusTextRef = "Loading..." /* SquadContainerStatusText.LOADING */;
        setTimeout(() => {
            this.connectingText.setVisible(true, null, false);
            setTimeout(() => {
                this.connectingText.setVisible(false, null, true, 0 /* AnimationType.ZOOM */);
                setTimeout(() => {
                    this.loggingInText.setVisible(true, null, true, 0 /* AnimationType.ZOOM */);
                    setTimeout(() => {
                        this.loggingInText.setVisible(false, null, true, 0 /* AnimationType.ZOOM */);
                        setTimeout(() => {
                            this.onLoadedComponents.forEach(c => {
                                c.setVisible(true, null, true, 0 /* AnimationType.ZOOM */);
                            });
                        }, 250);
                    }, 800);
                }, 25);
            }, 1500);
        }, 1);
    }
    onInitialize() {
        this.resetWaveState();
        { // Buttons
            this.addComponents(new UITitleBottomLeftButtonGroup_1.default({
                x: 13 + .5,
                y: 260 - 1,
                invertYCoordinate: true,
            }));
            {
                const discordLinkButton = new ((0, ExtensionTooltip_1.default)(Button_1.Button, [
                    new StaticText_1.default({ y: 5 }, "Link your Discord account to save your progress!", 11),
                    new Container_1.CoordinatedStaticSpace(1, 1, 0, 22),
                ], 10, "left", false))({
                    x: 172,
                    y: 6,
                    w: 162,
                    h: 21,
                    invertXCoordinate: true,
                }, 2, 2, 1, [
                    new Logo_1.SVGLogo({
                        x: 3,
                        y: 0,
                        w: 21,
                        h: 21,
                    }, discord_icon_svg_1.default, 0.7),
                    new StaticText_1.default({
                        x: 7,
                        y: 4,
                    }, "Sign in with Discord", 13),
                ], () => {
                    const windowProxy = window.open("unko");
                    windowProxy.document.write("まだ実装されてないわボケー");
                }, "#5865f2", true);
                this.addComponent(discordLinkButton);
            }
        }
        { // Texts
            const connectingText = this.connectingText = new ((0, ExtensionCollidable_1.default)(StaticText_1.default, "up"))({
                x: -(200 / 2),
                y: (-(40 / 2)) - 5,
                alignFromCenterX: true,
                alignFromCenterY: true,
            }, "Connecting...", 32);
            const loggingInText = this.loggingInText = new ((0, ExtensionCollidable_1.default)(StaticText_1.default, "down"))({
                x: -(200 / 2),
                y: (-(40 / 2)) - 5,
                alignFromCenterX: true,
                alignFromCenterY: true,
            }, "Logging in...", 32);
            this.connectingText.setVisible(false, null, false);
            this.loggingInText.setVisible(false, null, false);
            loggingInText.addCollidableComponents(this.connectingText);
            connectingText.addCollidableComponents(this.loggingInText);
            this.addComponent(this.connectingText);
            this.addComponent(this.loggingInText);
        }
        const gameNameText = new ((0, ExtensionCollidable_1.default)(StaticText_1.default))({
            x: -(250 / 2),
            y: (-(80 / 2)) - 40,
            alignFromCenterX: true,
            alignFromCenterY: true,
        }, "floooo.io", 54);
        gameNameText.addCollidableComponents(this.connectingText, this.loggingInText);
        {
            this.onLoadedComponents = [];
            const nameInputDescription = new ((0, ExtensionCollidable_1.default)(StaticText_1.default))({
                x: -108,
                y: (-(50 / 2)) - 5,
                alignFromCenterX: true,
                alignFromCenterY: true,
            }, "This pretty little flower is called...", 12);
            const nameInput = new ((0, ExtensionCollidable_1.default)(TextInput_1.default))({
                x: (-(100 / 2)) - 95,
                y: (-(50 / 2)) + 3,
                w: 220,
                h: 22,
                alignFromCenterX: true,
                alignFromCenterY: true,
            }, {
                canvas: this.canvas,
                text: "",
                fontSize: 15,
                textColor: "#212121",
                placeholder: "",
                showPlaceholderWhenUnfocused: false,
                borderColor: "#000000",
                maxLength: 80,
                paddingSize: 1,
                onKeyUp(e, self) {
                    const name = self.value;
                    Application_1.clientWebsocket.packetServerbound.sendWaveRoomChangeName(name);
                },
            });
            let readyToggle = false;
            const readyButton = new ((0, ExtensionCollidable_1.default)(Button_1.Button))({
                x: (-(100 / 2)) + 140,
                y: (-(50 / 2)) + 4,
                w: 76,
                h: 21,
                alignFromCenterX: true,
                alignFromCenterY: true,
            }, 2, 3, 1, [
                new StaticText_1.default({ y: 2 }, "Ready", 16),
                new Logo_1.CanvasLogo({
                    w: 40,
                    h: 40,
                }, (ctx) => {
                    ctx.fillStyle = "black";
                    ctx.globalAlpha = Color_1.DARKENED_BASE;
                    drawRoundedPolygon(ctx, 7, (readyButton.h / 2) - 3, 10, 90, 40, 3);
                    ctx.fill();
                }),
            ], () => {
                readyToggle = !readyToggle;
                if (this.squadMenuContainer.visible === false) {
                    Application_1.clientWebsocket.packetServerbound.sendWaveRoomFindPublic(this.biome);
                    this.setVisibleSquadMenuContainer(true);
                    this.statusTextRef = "Creating..." /* SquadContainerStatusText.CREATING */;
                    Application_1.clientWebsocket.packetServerbound.sendWaveRoomChangeReady(1 /* WaveRoomPlayerReadyState.READY */);
                }
                else {
                    Application_1.clientWebsocket.packetServerbound.sendWaveRoomChangeReady(readyToggle
                        ? 1 /* WaveRoomPlayerReadyState.READY */
                        : 0 /* WaveRoomPlayerReadyState.PREPARING */);
                }
            }, "#1dd129", true);
            const squadButton = new Button_1.Button({
                x: (-(100 / 2)) + 140 + 12,
                y: (-(50 / 2)) + 20 + 17,
                w: 63,
                h: 16,
                alignFromCenterX: true,
                alignFromCenterY: true,
            }, 2, 3.4, 1, [
                new StaticText_1.default({ y: 1 }, "Squad", 13),
                new Logo_1.CanvasLogo({
                    w: 40,
                    h: 40,
                }, (ctx) => {
                    ctx.fillStyle = "black";
                    ctx.globalAlpha = Color_1.DARKENED_BASE;
                    drawRoundedPolygon(ctx, 5, (squadButton.h / 2) - 3.5, 10 - 1.5, 90, 40, 4);
                    ctx.fill();
                }),
            ], () => {
                Application_1.clientWebsocket.packetServerbound.sendWaveRoomCreate(this.biome);
                this.setVisibleSquadMenuContainer(true);
                this.statusTextRef = "Creating..." /* SquadContainerStatusText.CREATING */;
                Application_1.clientWebsocket.packetServerbound.sendWaveRoomChangeVisible(1 /* WaveRoomVisibleState.PRIVATE */);
            }, "#5a9fdb", true);
            const makeBiomeSwitchButton = (biomeName, color, callback) => {
                return new Button_1.Button({
                    w: 42,
                    h: 11,
                }, 3, 3.4, 1, [
                    new StaticText_1.default({}, biomeName, 10),
                ], callback, color, true);
            };
            const biomeSwitcher = new Container_1.StaticHContainer({
                x: -144,
                y: (-(50 / 2)) + 20 + 17,
                alignFromCenterX: true,
                alignFromCenterY: true,
            }).addChildren(...dynamicJoinArray([
                makeBiomeSwitchButton("Garden", "#2ba35b", () => {
                    this.biome = 0 /* Biome.GARDEN */;
                }),
                makeBiomeSwitchButton("Desert", "#ccba73", () => {
                    this.biome = 1 /* Biome.DESERT */;
                }),
                makeBiomeSwitchButton("Ocean", "#6089b6", () => {
                    this.biome = 2 /* Biome.OCEAN */;
                }),
            ], 
            // Dynamically create static space
            () => new Container_1.StaticSpace(5, 0)));
            const makePlayerProfileColumn = (i) => {
                return new UITitlePlayerProfile_1.default({
                    w: 74.45,
                    h: 120,
                }, () => this.waveRoomPlayerInformations[i]?.id, () => this.waveRoomPlayerInformations[i]?.name, () => this.waveRoomPlayerInformations[i]?.readyState, () => this.waveRoomPlayerInformations[i] == undefined);
            };
            let codeInput;
            let squadMenuCloser;
            this.squadMenuContainer = new Container_1.StaticPanelContainer({
                x: -170,
                y: -100,
                alignFromCenterX: true,
                alignFromCenterY: true,
            }, false, "#5aa0db", 1, 4).addChildren(
            // TODO: interstringly this doesnt centering the text
            (this.statusText = new StaticText_1.default({
                x: 162,
                y: 110,
            }, () => this.statusTextRef, 14)), (this.playerProfileContainer = new Container_1.StaticHContainer({
                x: 9,
                y: 50,
            }).addChildren(makePlayerProfileColumn(0), new Container_1.StaticSpace(5.5, 0), makePlayerProfileColumn(1), new Container_1.StaticSpace(5.5, 0), makePlayerProfileColumn(2), new Container_1.StaticSpace(5.5, 0), makePlayerProfileColumn(3))), (squadMenuCloser = new UICloseButton_1.default({
                x: 318 - 1,
                y: 1 + 0.5,
            }, 10, () => {
                this.setVisibleSquadMenuContainer(false);
                readyToggle = false;
                this.resetWaveState();
                this.statusTextRef = "Loading..." /* SquadContainerStatusText.LOADING */;
                Application_1.clientWebsocket.packetServerbound.sendWaveRoomLeave();
            })), new Container_1.CoordinatedStaticSpace(15, 15, 318, 196), (this.publicToggle = new Toggle_1.default({
                x: 11,
                y: 24,
                w: 15,
                h: 15,
            }, (t) => Application_1.clientWebsocket.packetServerbound.sendWaveRoomChangeVisible(t
                ? 0 /* WaveRoomVisibleState.PUBLIC */
                : 1 /* WaveRoomVisibleState.PRIVATE */))), new StaticText_1.default({
                x: 26,
                y: 26,
            }, "Public", 10), new StaticText_1.default(() => ({
                x: 75,
                y: 31,
                w: 0,
                h: 0,
            }), () => this.waveRoomVisible === 1 /* WaveRoomVisibleState.PRIVATE */
                ? "Private squad"
                : this.waveRoomVisible === 0 /* WaveRoomVisibleState.PUBLIC */
                    ? "Waiting for players..."
                    : "", 8, () => this.waveRoomVisible === 1 /* WaveRoomVisibleState.PRIVATE */
                ? "#f0666b"
                : "#ffffff", "left"), 
            // Code inputer
            (codeInput = new TextInput_1.default({
                x: 187,
                y: 183,
                w: 75,
                h: 14,
            }, {
                canvas: this.canvas,
                text: "",
                fontSize: 10,
                textColor: "#212121",
                placeholder: "",
                showPlaceholderWhenUnfocused: false,
                borderColor: "#000000",
                borderWidth: 2.2,
                maxLength: 20,
                paddingSize: 1,
            })), new Button_1.Button({
                x: 274,
                y: 183 + 1,
                w: 46,
                h: 13,
            }, 2, 2.4, 1, [
                new StaticText_1.default({
                    x: 7,
                    y: 1,
                }, "Join", 10),
            ], () => Application_1.clientWebsocket.packetServerbound.sendWaveRoomJoin(codeInput.value), "#1dd129", () => (0, WaveRoomCode_1.isWaveRoomCode)(codeInput.value)), new Button_1.Button({
                x: 208,
                y: 26,
                w: 62,
                h: 12,
            }, 2, 2.4, 1, [
                new StaticText_1.default({
                    x: 3,
                    y: 1,
                }, "Find Public", 9),
            ], () => Application_1.clientWebsocket.packetServerbound.sendWaveRoomFindPublic(this.biome), "#5aa0db", true), new Button_1.Button({
                x: 280,
                y: 26,
                w: 40,
                h: 12,
            }, 2, 2.4, 1, [
                new StaticText_1.default({
                    x: 5,
                    y: 1,
                }, "New", 9),
            ], () => Application_1.clientWebsocket.packetServerbound.sendWaveRoomCreate(this.biome), "#5aa0db", true), this.codeText = (() => {
                const DEFAULT_TOOLTIP_LABEL = "Copy";
                const RESET_DELAY = 1500;
                let tooltipLabel = DEFAULT_TOOLTIP_LABEL;
                let resetTimer = null;
                const codeText = new ((0, ExtensionTooltip_1.default)(StaticText_1.default, [
                    new Container_1.CoordinatedStaticSpace(1, 1, 0, 0),
                    new StaticText_1.default({
                        x: 1,
                        y: 3,
                    }, () => tooltipLabel, 9),
                    new Container_1.CoordinatedStaticSpace(1, 1, 0, 15),
                ], 2, "top", false, 2))({
                    x: 10,
                    y: 187,
                }, () => "Code: " + (this.waveRoomCode || ""), 9, "#ffffff", "left", null, true, () => this.waveRoomCode || "");
                const resetTooltip = () => {
                    if (resetTimer)
                        clearTimeout(resetTimer);
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
            })(), new StaticText_1.default({
                x: 140,
                y: 3,
            }, "Squad", 14));
            const xpBarAndInventory = new ((0, ExtensionCollidable_1.default)(Container_1.StaticVContainer, "down"))(() => ({
                x: -(xpBarAndInventory.w / 2),
                y: 50 - 8,
                alignFromCenterX: true,
                alignFromCenterY: true,
            }), false)
                .addChildren(new Container_1.StaticSpace(0, 8), new ((0, ExtensionCentering_1.Centering)(Gauge_1.default))({
                w: 200,
                h: 25,
            }, (0, Gauge_1.xpGaugeSources)(), 0, "Lvl 191945450721 Flower", 0.4, Gauge_1.GAUGE_XP_BACKGROUND_COLOR_CODE, false), new Container_1.StaticSpace(0, 15), new ((0, ExtensionCentering_1.Centering)(UITitleInventory_1.default))({}));
            this.onLoadedComponents.push(nameInputDescription);
            this.onLoadedComponents.push(nameInput);
            this.onLoadedComponents.push(readyButton);
            this.onLoadedComponents.push(squadButton);
            this.onLoadedComponents.push(biomeSwitcher);
            this.onLoadedComponents.push(xpBarAndInventory);
            nameInputDescription.setVisible(false, null, false);
            nameInput.setVisible(false, null, false);
            readyButton.setVisible(false, null, false);
            squadButton.setVisible(false, null, false);
            biomeSwitcher.setVisible(false, null, false);
            xpBarAndInventory.setVisible(false, null, false);
            this.squadMenuContainer.setVisible(false, null, false);
            this.addComponents(nameInputDescription, nameInput, readyButton, squadButton, biomeSwitcher, xpBarAndInventory, this.squadMenuContainer);
            nameInputDescription.addCollidableComponents(this.squadMenuContainer, nameInput);
            gameNameText.addCollidableComponents(this.squadMenuContainer, nameInputDescription);
            nameInput.addCollidableComponents(this.squadMenuContainer);
            readyButton.addCollidableComponents(this.squadMenuContainer);
            xpBarAndInventory.addCollidableComponents(this.squadMenuContainer);
            this.toggleShowStatusText(true);
        }
        this.addComponent(gameNameText);
    }
    render() {
        const canvas = this.canvas;
        const ctx = canvas.getContext("2d");
        const widthRelative = this.canvas.width / UI_1.uiScaleFactor;
        const heightRelative = this.canvas.height / UI_1.uiScaleFactor;
        // Render background tilesets
        this.wavedBackgroundRendererBiome.render({
            canvas,
            tileset: TilesetRenderer_1.BIOME_TILESETS.get(this.biome),
            tileSize: 350,
        });
        backgroundEntities.forEach((v) => {
            if (v.x > widthRelative + 25) {
                backgroundEntities.delete(v);
            }
        });
        if (Date.now() - this.lastBackgroundEntitySpawn > 250) {
            const backgroundEntityType = SPAWNABLE_BACKGROUND_ENTITY_TYPES[Math.floor(Math.random() * SPAWNABLE_BACKGROUND_ENTITY_TYPES.length)];
            const backgroundEntity = new Mob_1.default(-1, 1, randomFloat(-100, (this.canvas.height / UI_1.uiScaleFactor) + 100), 1, 1, 1, backgroundEntityType, 0 /* Rarity.COMMON */, false, false, null);
            if ((0, Petal_1.isPetal)(backgroundEntityType)) {
                backgroundEntity.nSize = backgroundEntity.size = randomFloat(0.7, 1.8) * 5;
            }
            else {
                backgroundEntity.nSize = backgroundEntity.size = Math.random() * 30 + 25;
            }
            backgroundEntity.x = -backgroundEntity.size * 2;
            backgroundEntity.moveSpeed = (Math.random() * 16 + 16) * backgroundEntity.nSize * 0.02;
            backgroundEntity.angleSpeed = Math.random() * 0.1 + 0.2;
            backgroundEntities.add(backgroundEntity);
            this.lastBackgroundEntitySpawn = Date.now();
        }
        const s3 = Math.min(100, Application_1.deltaTime) / 60;
        Array.from(backgroundEntities.values()).toSorted((a, b) => a.size + b.size).forEach(e => {
            (0, RendererRenderingLink_1.renderEntity)({
                ctx,
                entity: e,
                isSpecimen: true,
            });
            e.x += e.moveSpeed * s3;
            e.y += Math.sin(e.angle * 0.2) * 1.5 * s3;
            e.angle += e.angleSpeed * s3;
            e.moveCounter += Application_1.deltaTime * 0.002;
        });
        if (this.waveRoomVisible !== this.prevWaveRoomVisible) {
            this.publicToggle.setToggle(this.waveRoomVisible === 0 /* WaveRoomVisibleState.PUBLIC */);
        }
        this.prevWaveRoomVisible = this.waveRoomVisible;
        if (this.waveRoomPlayerInformations.length) {
            this.toggleShowStatusText(false);
        }
        else {
            this.toggleShowStatusText(true);
        }
        this.renderComponents();
    }
    destroy() {
        super.destroy();
        this.wavedBackgroundRendererBiome = null;
    }
    onContextChange() {
        Application_1.cameraController.zoom = 1;
        document.onmouseout = null;
    }
    resetWaveState() {
        this.waveRoomPlayerInformations = [];
        this.waveRoomCode = null;
        this.waveRoomVisible = 1 /* WaveRoomVisibleState.PRIVATE */;
        this.waveRoomState = 0 /* WaveRoomState.WAITING */;
    }
    toggleShowStatusText(toggle) {
        if (this.statusText.visible !== toggle)
            this.statusText.setVisible(toggle, null, false);
        if (this.playerProfileContainer.visible !== !toggle)
            this.playerProfileContainer.setVisible(!toggle, null, false);
        if (this.codeText.visible !== !toggle)
            this.codeText.setVisible(!toggle, null, false);
    }
    setVisibleSquadMenuContainer(toggle) {
        this.squadMenuContainer.setVisible(toggle, null, true, 0 /* AnimationType.ZOOM */, {
            defaultDurationOverride: 300,
        });
    }
}
exports.default = UITitle;
