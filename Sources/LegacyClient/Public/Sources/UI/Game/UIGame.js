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
exports.calculateWaveLength = void 0;
const Mob_1 = __importDefault(require("../../Entity/Mob"));
const Player_1 = __importDefault(require("../../Entity/Player"));
const RendererRenderingLink_1 = require("../../Entity/Renderers/RendererRenderingLink");
const Interpolator_1 = require("../../Utils/Interpolator");
const UI_1 = __importStar(require("../UI"));
const SettingStorage_1 = __importDefault(require("../../Utils/SettingStorage"));
const StaticText_1 = __importDefault(require("../Layout/Components/WellKnown/StaticText"));
const TextInput_1 = __importDefault(require("../Layout/Components/WellKnown/TextInput"));
const Button_1 = require("../Layout/Components/WellKnown/Button");
const UICloseButton_1 = __importDefault(require("../Shared/UICloseButton"));
const Component_1 = require("../Layout/Components/Component");
const Container_1 = require("../Layout/Components/WellKnown/Container");
const ExtensionInlineRendering_1 = require("../Layout/Extensions/ExtensionInlineRendering");
const UIGameWaveMobIcons_1 = __importDefault(require("./UIGameWaveMobIcons"));
const UIGameInventory_1 = __importDefault(require("./UIGameInventory"));
const ExtensionCentering_1 = require("../Layout/Extensions/ExtensionCentering");
const Gauge_1 = __importDefault(require("../Layout/Components/WellKnown/Gauge"));
const UIGamePlayerStatuses_1 = __importDefault(require("./UIGamePlayerStatuses"));
const Application_1 = require("../../../../Application");
const Petal_1 = require("../../Entity/Petal");
const Biome_1 = require("../../Native/Biome");
const TilesetRenderer_1 = __importStar(require("../Shared/Tile/Tileset/TilesetRenderer"));
let interpolatedMouseX = 0;
let interpolatedMouseY = 0;
let mouseXOffset = 0;
let mouseYOffset = 0;
const TAU = 2 * Math.PI;
function angleToRad(angle) {
    return angle / 255 * TAU;
}
/**
 * Calculate wave length.
 *
 * @param x - Wave progress
 */
const calculateWaveLength = (x) => Math.max(60, x ** 0.2 * 18.9287 + 30);
exports.calculateWaveLength = calculateWaveLength;
function prepareLightningBouncePath({ points }) {
    const path = new Path2D();
    const addRandomOffset = (value, magnitude = 2) => {
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
            path.lineTo(startPoint[0] + ratio * dx + jitterX, startPoint[1] + ratio * dy + jitterY);
            currentDistance += Math.random() * 50 + 50;
        }
        path.lineTo(...endPoint);
    }
    return path;
}
class UIGame extends UI_1.default {
    static { this.DEAD_BACKGROUND_TARGET_OPACITY = 0.3; }
    static { this.DEAD_BACKGROUND_FADE_DURATION = 0.3; }
    static { this.DEAD_MENU_CONTAINER_ANIMATION_CONFIG = {
        defaultDurationOverride: 2500,
        direction: "v",
        offset: 300,
        offsetSign: 1,
        fadeEffectEnabled: false,
    }; }
    constructor(canvas) {
        super(canvas);
        this.tilesetRenderer = new TilesetRenderer_1.default();
        this.players = new Map();
        this.mobs = new Map();
        this.lightningBounces = new Array();
        this.waveSelfId = -1;
        // W,A,S,D
        this.movementKeys = [false, false, false, false];
        this.lastMovementKeyAngle = 0;
        this.biome = 0 /* Biome.GARDEN */;
        this.CLIENTBOUND_HANDLERS = {
            [0 /* Clientbound.WAVE_SELF_ID */]: (reader) => {
                this.waveSelfId = reader.readUInt32();
            },
            [2 /* Clientbound.WAVE_UPDATE */]: (reader) => {
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
                        const bounce = {
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
                { // Read entities
                    const entityCount = reader.readUInt16();
                    for (let i = 0; i < entityCount; i++) {
                        const entityKind = reader.readUInt8();
                        switch (entityKind) {
                            case 0 /* EntityKind.PLAYER */: {
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
                                const playerIsDead = Boolean(bFlags & 1), playerIsDev = Boolean(bFlags & 2), playerIsPoisoned = Boolean(bFlags & 4);
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
                                        }
                                        else if (playerHealth > player.nHealth) {
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
                                }
                                else {
                                    const player = new Player_1.default(playerId, playerX, playerY, playerAngle, playerSize, playerHealth, playerMood, playerName);
                                    this.players.set(playerId, player);
                                    // Add status
                                    this.playerStatuses.addPlayer(player, this.waveSelfId === player.id);
                                }
                                break;
                            }
                            case 1 /* EntityKind.MOB */: {
                                const mobId = reader.readUInt32();
                                const mobX = reader.readFloat32();
                                const mobY = reader.readFloat32();
                                const mobAngle = angleToRad(reader.readFloat32());
                                const mobHealth = reader.readFloat32();
                                const mobSize = reader.readFloat32();
                                const mobType = reader.readUInt8();
                                const mobRarity = reader.readUInt8();
                                // Decode boolean flags
                                const bFlags = reader.readUInt8();
                                const mobIsPet = Boolean(bFlags & 1), mobIsFirstSegment = Boolean(bFlags & 2), mobHasConnectingSegment = Boolean(bFlags & 4), mobIsPoisoned = Boolean(bFlags & 8);
                                let mobConnectingSegment = null;
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
                                        const parentMob = Mob_1.default.traverseSegments(mob);
                                        // TODO: original game can hurtT = 1 when poisoned
                                        // But do that can affect to color always
                                        if (!mob.isPoison && mobHealth < mob.nHealth) {
                                            parentMob.redHealthTimer = 1;
                                            parentMob.hurtT = 1;
                                        }
                                        else if (mobHealth > mob.nHealth) {
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
                                }
                                else {
                                    mob = new Mob_1.default(mobId, mobX, mobY, mobAngle, mobSize, mobHealth, mobType, mobRarity, mobIsPet, mobIsFirstSegment, mobConnectingSegment);
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
                            case 2 /* EntityKind.PETAL */: {
                                const petalId = reader.readUInt32();
                                const petalX = reader.readFloat32();
                                const petalY = reader.readFloat32();
                                const petalAngle = angleToRad(reader.readFloat32());
                                const petalHealth = reader.readFloat32();
                                const petalSize = reader.readFloat32();
                                const petalType = reader.readUInt8();
                                const petalRarity = reader.readUInt8();
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
                                        }
                                        else if (petalHealth > petal.nHealth) {
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
                                }
                                else {
                                    // Petal treated as mob
                                    this.mobs.set(petalId, new Mob_1.default(petalId, petalX, petalY, petalAngle, petalSize, petalHealth, petalType, petalRarity, false, false, null));
                                }
                                break;
                            }
                        }
                    }
                }
                // Send ack
                Application_1.clientWebsocket.packetServerbound.sendAck([
                    this.canvas.width / UI_1.uiScaleFactor + 500,
                    this.canvas.height / UI_1.uiScaleFactor + 500,
                ]);
            },
            [6 /* Clientbound.WAVE_CHAT_RECEIV */]: (reader) => {
                const lines = reader.readString();
                lines.split("\n").forEach(message => {
                    this.chatContainer.addChildren(new StaticText_1.default({
                        y: 2,
                    }, message, 10), new Container_1.StaticSpace(0, 3));
                });
            },
        };
        this.waveProgress = 0;
        this.updateT = 0;
        this.waveProgressTimer = this.waveProgressRedGageTimer = this.mapRadius = 0;
        this.oMapRadius = 0;
        this.nMapRadius = 0;
        this.wasDeadMenuContinued = false;
        this.deadMenuBackgroundOpacity = 0;
        this.wasWaveEnded = false;
        this.currentMoodFlags = 0;
        { // Setup listeners
            this.on("onKeyDown", (event) => {
                if (!this.isOperative)
                    return;
                switch (event.key) {
                    // Space mean space
                    case " ": {
                        this.currentMoodFlags |= 0 /* MoodFlags.ANGRY */;
                        Application_1.clientWebsocket.packetServerbound.sendWaveChangeMood(this.currentMoodFlags);
                        break;
                    }
                    case "Shift": {
                        this.currentMoodFlags |= 1 /* MoodFlags.SAD */;
                        Application_1.clientWebsocket.packetServerbound.sendWaveChangeMood(this.currentMoodFlags);
                        break;
                    }
                    case "Enter": {
                        if (this.chatInput.isFocused) {
                            this.chatInput.blur();
                        }
                        else {
                            const selfPlayer = this.players.get(this.waveSelfId);
                            if (!selfPlayer) {
                                return;
                            }
                            if (selfPlayer.isDead) {
                                if (this.wasDeadMenuContinued)
                                    this.leaveGame();
                                if (!this.wasDeadMenuContinued) {
                                    this.wasDeadMenuContinued = true;
                                }
                            }
                            if (this.chatInput)
                                this.chatInput.focus();
                        }
                        break;
                    }
                    default: {
                        // Slot swapping
                        if (
                        // Dont swap while chatting
                        !this.chatInput.isFocused) {
                            if (event.code.startsWith("Digit")) {
                                let index = parseInt(event.code.slice(5));
                                if (index === 0) {
                                    index = 10;
                                }
                                index--;
                                Application_1.clientWebsocket.packetServerbound.sendWaveSwapPetal(index);
                            }
                        }
                        break;
                    }
                }
            });
            this.on("onKeyUp", (event) => {
                if (!this.isOperative)
                    return;
                switch (event.key) {
                    // Space means space
                    case " ": {
                        this.currentMoodFlags &= ~0 /* MoodFlags.ANGRY */;
                        Application_1.clientWebsocket.packetServerbound.sendWaveChangeMood(this.currentMoodFlags);
                        break;
                    }
                    case "Shift": {
                        this.currentMoodFlags &= ~1 /* MoodFlags.SAD */;
                        Application_1.clientWebsocket.packetServerbound.sendWaveChangeMood(this.currentMoodFlags);
                        break;
                    }
                }
            });
            this.on("onMouseDown", (event) => {
                if (!this.isOperative)
                    return;
                if (event.button === 0) {
                    this.currentMoodFlags |= 0 /* MoodFlags.ANGRY */;
                    Application_1.clientWebsocket.packetServerbound.sendWaveChangeMood(this.currentMoodFlags);
                }
                if (event.button === 2) {
                    this.currentMoodFlags |= 1 /* MoodFlags.SAD */;
                    Application_1.clientWebsocket.packetServerbound.sendWaveChangeMood(this.currentMoodFlags);
                }
            });
            this.on("onMouseUp", (event) => {
                if (!this.isOperative)
                    return;
                if (event.button === 0) {
                    this.currentMoodFlags &= ~0 /* MoodFlags.ANGRY */;
                    Application_1.clientWebsocket.packetServerbound.sendWaveChangeMood(this.currentMoodFlags);
                }
                if (event.button === 2) {
                    this.currentMoodFlags &= ~1 /* MoodFlags.SAD */;
                    Application_1.clientWebsocket.packetServerbound.sendWaveChangeMood(this.currentMoodFlags);
                }
            });
            this.on("onMouseMove", (event) => {
                if (!this.isOperative)
                    return;
                mouseXOffset = event.clientX - document.documentElement.clientWidth / 2;
                mouseYOffset = event.clientY - document.documentElement.clientHeight / 2;
                if (!SettingStorage_1.default.get("keyboard_control")) {
                    const angle = Math.atan2(mouseYOffset, mouseXOffset);
                    const distance = Math.hypot(mouseXOffset, mouseYOffset) / UI_1.uiScaleFactor;
                    Application_1.clientWebsocket.packetServerbound.sendWaveChangeMove(angle, distance < 100 ? distance / 100 : 1);
                }
            });
            { // Setup WASD movement listeners
                this.on("onKeyDown", (event) => {
                    if (!this.isOperative)
                        return;
                    if (!SettingStorage_1.default.get("keyboard_control"))
                        return;
                    switch (event.key.toLowerCase()) {
                        case "w":
                            this.movementKeys[0] = true;
                            break;
                        case "a":
                            this.movementKeys[1] = true;
                            break;
                        case "s":
                            this.movementKeys[2] = true;
                            break;
                        case "d":
                            this.movementKeys[3] = true;
                            break;
                    }
                    this.updateKeyboardMovement();
                });
                this.on("onKeyUp", (event) => {
                    if (!this.isOperative)
                        return;
                    if (!SettingStorage_1.default.get("keyboard_control"))
                        return;
                    switch (event.key.toLowerCase()) {
                        case "w":
                            this.movementKeys[0] = false;
                            break;
                        case "a":
                            this.movementKeys[1] = false;
                            break;
                        case "s":
                            this.movementKeys[2] = false;
                            break;
                        case "d":
                            this.movementKeys[3] = false;
                            break;
                    }
                    this.updateKeyboardMovement();
                });
            }
        }
    }
    onInitialize() {
        // Leave wave button
        this.addComponent(new UICloseButton_1.default({
            x: 6,
            y: 6,
        }, 14, () => this.leaveGame()));
        this.addComponent(this.waveInformationContainer = new ((0, ExtensionInlineRendering_1.InlineRendering)(Container_1.StaticVContainer))(() => ({
            x: -(this.waveInformationContainer.w / 2),
            y: 30,
            alignFromCenterX: true,
        })).addChildren(new ((0, ExtensionCentering_1.Centering)(StaticText_1.default))({}, () => Biome_1.BIOME_DISPLAY_NAME[this.biome], 16), new Container_1.StaticSpace(0, 4), new ((0, ExtensionCentering_1.Centering)(Gauge_1.default))({
            w: 140,
            h: 12,
        }, () => {
            const maxWaveProgress = (0, exports.calculateWaveLength)(this.waveProgress);
            return [
                {
                    value: this.waveProgressTimer,
                    maxValue: maxWaveProgress,
                    thickness: 0.75,
                    color: Biome_1.BIOME_GAUGE_COLORS[this.biome],
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
        }, 0, () => "Wave " + this.waveProgress), new Container_1.StaticSpace(0, 8), this.waveMobIcons = new ((0, ExtensionCentering_1.Centering)(UIGameWaveMobIcons_1.default))({})));
        this.addComponent(this.playerStatuses = new ((0, ExtensionInlineRendering_1.InlineRendering)(UIGamePlayerStatuses_1.default))(() => ({
            x: 55,
            y: 60,
        })));
        {
            let deadMenuCloser;
            this.deadMenuContainer = new Container_1.StaticVContainer(() => ({
                x: -(this.deadMenuContainer.w / 2),
                y: -(this.deadMenuContainer.h / 2),
                alignFromCenterX: true,
                alignFromCenterY: true,
            }), false).addChildren(new ((0, ExtensionCentering_1.Centering)(StaticText_1.default))({}, "You were destroyed by:", 12.2), new Container_1.StaticSpace(2, 2), new ((0, ExtensionCentering_1.Centering)(StaticText_1.default))({}, "Poison", 16.1), new Container_1.StaticSpace(100, 100), (deadMenuCloser = new ((0, ExtensionCentering_1.Centering)(Button_1.Button))({
                w: 88,
                h: 24,
            }, 3, 3, 1, [
                new StaticText_1.default({
                    x: 3,
                    y: 2,
                }, "Continue", 17),
            ], () => {
                this.wasDeadMenuContinued = true;
                this.deadMenuContainer.setVisible(false, deadMenuCloser, true, 1 /* AnimationType.SLIDE */, UIGame.DEAD_MENU_CONTAINER_ANIMATION_CONFIG);
            }, "#1dd129", true)), new Container_1.StaticSpace(0, 4), new ((0, ExtensionCentering_1.Centering)(StaticText_1.default))({}, "(or press enter)", 12));
            this.deadMenuContainer.setVisible(false, null, false);
            this.addComponent(this.deadMenuContainer);
        }
        {
            this.gameOverMenuContainer = new Container_1.StaticVContainer(() => ({
                x: -(this.gameOverMenuContainer.w / 2),
                y: -(this.gameOverMenuContainer.h / 2),
                alignFromCenterX: true,
                alignFromCenterY: true,
            }), false).addChildren(new ((0, ExtensionCentering_1.Centering)(StaticText_1.default))({}, "GAME OVER", 34, "#f0666b"), new Container_1.StaticSpace(20, 20), new ((0, ExtensionCentering_1.Centering)(Button_1.Button))({
                w: 88,
                h: 24,
            }, 3, 3, 1, [
                new StaticText_1.default({
                    x: 3,
                    y: 2,
                }, "Continue", 17),
            ], () => this.leaveGame(), "#c62327", true), new Container_1.StaticSpace(0, 4), new ((0, ExtensionCentering_1.Centering)(StaticText_1.default))({}, "(or press enter)", 12));
            this.gameOverMenuContainer.setVisible(false, null, false);
            this.addComponent(this.gameOverMenuContainer);
        }
        {
            this.youWillRespawnNextWaveContainer = new Container_1.StaticTranslucentPanelContainer(() => ({
                x: -(this.youWillRespawnNextWaveContainer.w / 2),
                y: -(this.youWillRespawnNextWaveContainer.h / 2) + 50,
                alignFromCenterX: true,
                alignFromCenterY: true,
            }), 2).addChildren(new StaticText_1.default({ y: 3 }, "You will respawn next wave", 10), new Container_1.CoordinatedStaticSpace(1, 1, 0, 16));
            this.youWillRespawnNextWaveContainer.setVisible(false, null, false);
            this.addComponent(this.youWillRespawnNextWaveContainer);
        }
        { // Chats
            this.addComponent(this.chatInput = new TextInput_1.default({
                x: 13,
                y: 34,
                w: 192,
                h: 8,
                invertYCoordinate: true,
            }, {
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
                    Application_1.clientWebsocket.packetServerbound.sendWaveChat(self.value);
                    self.value = "";
                },
            }));
            let chatContainerParent;
            this.addComponent(chatContainerParent = new Container_1.StaticTranslucentPanelContainer(() => ({
                x: 11,
                y: 37 + chatContainerParent.h,
                invertYCoordinate: true,
            }), 2, () => this.chatInput.isFocused
                ? 0.5
                : 0).addChild(this.chatContainer = new Container_1.StaticVContainer({})));
        }
        this.addComponent(this.inventory = new ((0, ExtensionInlineRendering_1.InlineRendering)(UIGameInventory_1.default))(() => ({
            x: -(this.inventory.w / 2),
            y: 105,
            alignFromCenterX: true,
            invertYCoordinate: true,
        })));
    }
    render() {
        // Interpolate
        {
            this.updateT += Application_1.deltaTime / 100;
            this.t = Math.min(1, this.updateT);
            this.mapRadius = this.oMapRadius + (this.nMapRadius - this.oMapRadius) * this.t;
            interpolatedMouseX = (0, Interpolator_1.interpolate)(interpolatedMouseX, mouseXOffset / Application_1.antennaScaleFactor, 50);
            interpolatedMouseY = (0, Interpolator_1.interpolate)(interpolatedMouseY, mouseYOffset / Application_1.antennaScaleFactor, 50);
        }
        const { canvas } = this;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const widthRelative = canvas.width / UI_1.uiScaleFactor;
        const heightRelative = canvas.height / UI_1.uiScaleFactor;
        const centerWidth = widthRelative / 2;
        const centerHeight = heightRelative / 2;
        const selfPlayer = this.players.get(this.waveSelfId);
        if (!selfPlayer)
            return;
        // Render map
        this.tilesetRenderer.renderGameTileset({
            canvas,
            tileset: TilesetRenderer_1.BIOME_TILESETS.get(this.biome),
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
                if (mob.isDead &&
                    mob.deadT > 1) {
                    if (this.waveMobIcons.isIconableMobInstance(mob)) {
                        this.waveMobIcons.removeMobIcon(mob);
                    }
                    this.mobs.delete(k);
                    this.mobs.forEach((innerMob, k) => {
                        if (innerMob.connectedSegments.has(mob))
                            innerMob.connectedSegments.delete(mob);
                    });
                    if (mob.connectingSegment)
                        mob.connectingSegment = null;
                }
            });
            this.players.forEach((player, k) => {
                player.update();
                // Only remove when disconnected
                if (player.isDead &&
                    player.deadT > 1 &&
                    player.wasEliminated) {
                    this.players.delete(k);
                }
            });
        }
        { // Render players & mobs
            const scaledWidth = canvas.width / (UI_1.uiScaleFactor * Application_1.antennaScaleFactor);
            const scaledHeight = canvas.height / (UI_1.uiScaleFactor * Application_1.antennaScaleFactor);
            const viewportWidth = scaledWidth + 500;
            const viewportHeight = scaledHeight + 500;
            const halfWidth = viewportWidth * 0.5;
            const halfHeight = viewportHeight * 0.5;
            const x0 = selfPlayer.x - halfWidth;
            const x1 = selfPlayer.x + halfWidth;
            const y0 = selfPlayer.y - halfHeight;
            const y1 = selfPlayer.y + halfHeight;
            const getEntitiesInViewport = () => {
                const viewportEntities = [];
                const isInViewport = (entity) => (entity.x >= x0 &&
                    entity.x <= x1 &&
                    entity.y >= y0 &&
                    entity.y <= y1);
                for (const [, mob] of this.mobs) {
                    if (isInViewport(mob)) {
                        if ((0, Petal_1.isPetal)(mob.type)) {
                            viewportEntities.push(mob);
                        }
                        else if (mob.type === 19 /* MobType.WEB_PROJECTILE */) {
                            viewportEntities.unshift(mob);
                        }
                        else {
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
                if (!lightningBounces.length)
                    return;
                ctx.strokeStyle = "#FFF";
                ctx.lineCap = "round";
                const dt500 = Application_1.deltaTime / 500;
                let i = lightningBounces.length;
                while (i--) {
                    const bounce = lightningBounces[i];
                    bounce.t -= dt500;
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
            const viewScale = UI_1.uiScaleFactor * Application_1.antennaScaleFactor;
            ctx.setTransform(viewScale, 0, 0, viewScale, centerWidth * UI_1.uiScaleFactor - selfPlayer.x * viewScale, centerHeight * UI_1.uiScaleFactor - selfPlayer.y * viewScale);
            for (const entity of entitiesToDraw) {
                (0, RendererRenderingLink_1.renderEntity)({ ctx, entity, isSpecimen: false });
            }
            renderLightningBounces();
            ctx.restore();
        }
        { // Render inlined components
            (0, Component_1.renderPossibleComponent)(ctx, this.waveInformationContainer);
            (0, Component_1.renderPossibleComponent)(ctx, this.playerStatuses);
            (0, Component_1.renderPossibleComponent)(ctx, this.inventory);
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
                if (this.deadMenuBackgroundOpacity < UIGame.DEAD_BACKGROUND_TARGET_OPACITY &&
                    !(this.wasDeadMenuContinued && !this.wasWaveEnded)) {
                    this.deadMenuBackgroundOpacity = Math.min(this.deadMenuBackgroundOpacity + (Application_1.deltaTime / 1000 / UIGame.DEAD_BACKGROUND_FADE_DURATION) * UIGame.DEAD_BACKGROUND_TARGET_OPACITY, UIGame.DEAD_BACKGROUND_TARGET_OPACITY);
                }
                if (this.wasDeadMenuContinued) {
                    if (this.wasWaveEnded) {
                        if (!this.gameOverMenuContainer.visible) {
                            this.gameOverMenuContainer.setVisible(true, null, true, 2 /* AnimationType.FADE */);
                        }
                        if (this.youWillRespawnNextWaveContainer.isOutAnimatable) {
                            this.youWillRespawnNextWaveContainer.setVisible(false, null, true, 2 /* AnimationType.FADE */, { defaultDurationOverride: 500 });
                        }
                    }
                    else {
                        // Only fade-out when not game over
                        this.deadMenuBackgroundOpacity = Math.max(this.deadMenuBackgroundOpacity - (Application_1.deltaTime / 1000 / UIGame.DEAD_BACKGROUND_FADE_DURATION) * UIGame.DEAD_BACKGROUND_TARGET_OPACITY, 0);
                        if (!this.youWillRespawnNextWaveContainer.visible) {
                            this.youWillRespawnNextWaveContainer.setVisible(true, null, true, 2 /* AnimationType.FADE */, { defaultDurationOverride: 500 });
                        }
                    }
                }
                else {
                    // If not rendered dead menu, render it
                    if (!this.deadMenuContainer.visible) {
                        this.deadMenuContainer.setVisible(true, null, true, 1 /* AnimationType.SLIDE */, UIGame.DEAD_MENU_CONTAINER_ANIMATION_CONFIG);
                    }
                }
            }
            else {
                // Respawned, or not dead
                this.deadMenuBackgroundOpacity = 0;
                if (this.deadMenuContainer.isOutAnimatable) {
                    this.deadMenuContainer.setVisible(false, null, true, 1 /* AnimationType.SLIDE */, UIGame.DEAD_MENU_CONTAINER_ANIMATION_CONFIG);
                }
                if (this.youWillRespawnNextWaveContainer.isOutAnimatable) {
                    this.youWillRespawnNextWaveContainer.setVisible(false, null, true, 2 /* AnimationType.FADE */, { defaultDurationOverride: 500 });
                }
            }
        }
        this.renderComponents();
    }
    destroy() {
        super.destroy();
        this.tilesetRenderer = null;
        this.players.clear();
        this.mobs.clear();
    }
    onContextChange() {
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
    drawMutableFunctions(canvas) {
        const ARROW_START_DISTANCE = 30;
        const ctx = canvas.getContext("2d");
        const selfPlayer = this.players.get(this.waveSelfId);
        const widthRelative = canvas.width / UI_1.uiScaleFactor;
        const heightRelative = canvas.height / UI_1.uiScaleFactor;
        if (!(SettingStorage_1.default.get("keyboard_control") ||
            !SettingStorage_1.default.get("movement_helper")) &&
            selfPlayer &&
            !selfPlayer.isDead) {
            ctx.save();
            ctx.translate(widthRelative / 2, heightRelative / 2);
            ctx.rotate(Math.atan2(interpolatedMouseY, interpolatedMouseX));
            ctx.scale(Application_1.antennaScaleFactor, Application_1.antennaScaleFactor);
            const distance = Math.hypot(interpolatedMouseX, interpolatedMouseY) / UI_1.uiScaleFactor;
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
    updateKeyboardMovement() {
        const [w, a, s, d] = this.movementKeys;
        // Calculate the movement vector
        let dx = 0;
        let dy = 0;
        if (w)
            dy -= 1;
        if (s)
            dy += 1;
        if (a)
            dx -= 1;
        if (d)
            dx += 1;
        // If no keys are pressed or opposing keys are pressed
        if (dx === 0 && dy === 0) {
            Application_1.clientWebsocket.packetServerbound.sendWaveChangeMove(this.lastMovementKeyAngle, 0);
            return;
        }
        // Normalize diagonal movement
        if (dx !== 0 && dy !== 0) {
            dx /= Math.SQRT2;
            dy /= Math.SQRT2;
        }
        const angle = this.lastMovementKeyAngle = Math.atan2(dy, dx);
        // Send movement to server
        Application_1.clientWebsocket.packetServerbound.sendWaveChangeMove(angle, 1);
    }
    leaveGame() {
        this.gameOverMenuContainer.setVisible(false, null, true, 2 /* AnimationType.FADE */, {
            defaultDurationOverride: 1000,
        });
        Application_1.clientWebsocket.packetServerbound.sendWaveLeave();
        Application_1.uiCtx.switchUI("title");
    }
    get isOperative() {
        const selfPlayer = this.players.get(this.waveSelfId);
        if (!selfPlayer)
            return false;
        if (!Application_1.clientWebsocket)
            return false;
        return !selfPlayer.isDead;
    }
}
exports.default = UIGame;
