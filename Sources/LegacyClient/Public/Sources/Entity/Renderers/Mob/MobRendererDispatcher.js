"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Renderer_1 = __importDefault(require("../Renderer"));
const PetalRendererBasic_1 = __importDefault(require("./Petal/PetalRendererBasic"));
const PetalRendererBubble_1 = __importDefault(require("./Petal/PetalRendererBubble"));
const PetalRendererEgg_1 = __importDefault(require("./Petal/PetalRendererEgg"));
const PetalRendererFaster_1 = __importDefault(require("./Petal/PetalRendererFaster"));
const PetalRendererYinYang_1 = __importDefault(require("./Petal/PetalRendererYinYang"));
const MobRendererBee_1 = __importDefault(require("./MobRendererBee"));
const MobRendererBeetle_1 = __importDefault(require("./MobRendererBeetle"));
const MobRendererBubble_1 = __importDefault(require("./MobRendererBubble"));
const MobRendererCentipede_1 = __importDefault(require("./MobRendererCentipede"));
const MobRendererJellyfish_1 = __importDefault(require("./MobRendererJellyfish"));
const MobRendererSpider_1 = __importDefault(require("./MobRendererSpider"));
const MobRendererStarfish_1 = __importDefault(require("./MobRendererStarfish"));
const MobRendererSponge_1 = __importDefault(require("./MobRendererSponge"));
const MobRendererSandstorm_1 = __importDefault(require("./MobRendererSandstorm"));
const MobRendererCactus_1 = __importDefault(require("./MobRendererCactus"));
const MobRendererScorpion_1 = __importDefault(require("./MobRendererScorpion"));
const MobRendererShinyLadybug_1 = __importDefault(require("./MobRendererShinyLadybug"));
const PetalRendererMysteriousStick_1 = __importDefault(require("./Petal/PetalRendererMysteriousStick"));
const MobRendererShell_1 = __importDefault(require("./MobRendererShell"));
const PetalRendererSand_1 = __importDefault(require("./Petal/PetalRendererSand"));
const PetalRendererLightning_1 = __importDefault(require("./Petal/PetalRendererLightning"));
const PetalRendererClaw_1 = __importDefault(require("./Petal/PetalRendererClaw"));
const PetalRendererFang_1 = __importDefault(require("./Petal/PetalRendererFang"));
const PetalRendererYggdrasil_1 = __importDefault(require("./Petal/PetalRendererYggdrasil"));
const MobRendererCrab_1 = __importDefault(require("./MobRendererCrab"));
const MobRendererHornet_1 = __importDefault(require("./MobRendererHornet"));
const MobRendererLeech_1 = __importDefault(require("./MobRendererLeech"));
const PetalRendererWeb_1 = __importDefault(require("./Petal/PetalRendererWeb"));
const MobRendererMissileProjectile_1 = __importDefault(require("./Projectile/MobRendererMissileProjectile"));
const MobRendererWebProjectile_1 = __importDefault(require("./Projectile/MobRendererWebProjectile"));
const PetalRendererStinger_1 = __importDefault(require("./Petal/PetalRendererStinger"));
const PetalRendererWing_1 = __importDefault(require("./Petal/PetalRendererWing"));
const PetalRendererMagnet_1 = __importDefault(require("./Petal/PetalRendererMagnet"));
const centipedeRenderer = new MobRendererCentipede_1.default();
const MOB_RENDERERS = {
    // Mob
    [1 /* MobType.SPIDER */]: new MobRendererSpider_1.default,
    [0 /* MobType.BEE */]: new MobRendererBee_1.default,
    [2 /* MobType.HORNET */]: new MobRendererHornet_1.default,
    [3 /* MobType.BEETLE */]: new MobRendererBeetle_1.default,
    [4 /* MobType.SANDSTORM */]: new MobRendererSandstorm_1.default,
    [5 /* MobType.CACTUS */]: new MobRendererCactus_1.default,
    [6 /* MobType.SCORPION */]: new MobRendererScorpion_1.default,
    [7 /* MobType.LADYBUG_SHINY */]: new MobRendererShinyLadybug_1.default,
    [8 /* MobType.STARFISH */]: new MobRendererStarfish_1.default,
    [9 /* MobType.JELLYFISH */]: new MobRendererJellyfish_1.default,
    [10 /* MobType.BUBBLE */]: new MobRendererBubble_1.default,
    [11 /* MobType.SPONGE */]: new MobRendererSponge_1.default,
    [12 /* MobType.SHELL */]: new MobRendererShell_1.default,
    [13 /* MobType.CRAB */]: new MobRendererCrab_1.default,
    [14 /* MobType.LEECH */]: new MobRendererLeech_1.default,
    [15 /* MobType.CENTIPEDE */]: centipedeRenderer,
    [17 /* MobType.CENTIPEDE_DESERT */]: centipedeRenderer,
    [16 /* MobType.CENTIPEDE_EVIL */]: centipedeRenderer,
    [18 /* MobType.MISSILE_PROJECTILE */]: new MobRendererMissileProjectile_1.default,
    [19 /* MobType.WEB_PROJECTILE */]: new MobRendererWebProjectile_1.default,
    // Petal
    [20 /* PetalType.BASIC */]: new PetalRendererBasic_1.default,
    [21 /* PetalType.FASTER */]: new PetalRendererFaster_1.default,
    [23 /* PetalType.BUBBLE */]: new PetalRendererBubble_1.default,
    [22 /* PetalType.EGG_BEETLE */]: new PetalRendererEgg_1.default,
    [24 /* PetalType.YIN_YANG */]: new PetalRendererYinYang_1.default,
    [25 /* PetalType.MYSTERIOUS_STICK */]: new PetalRendererMysteriousStick_1.default,
    [26 /* PetalType.SAND */]: new PetalRendererSand_1.default,
    [27 /* PetalType.LIGHTNING */]: new PetalRendererLightning_1.default,
    [28 /* PetalType.CLAW */]: new PetalRendererClaw_1.default,
    [29 /* PetalType.FANG */]: new PetalRendererFang_1.default,
    [30 /* PetalType.YGGDRASIL */]: new PetalRendererYggdrasil_1.default,
    [31 /* PetalType.WEB */]: new PetalRendererWeb_1.default,
    [32 /* PetalType.STINGER */]: new PetalRendererStinger_1.default,
    [33 /* PetalType.WING */]: new PetalRendererWing_1.default,
    [34 /* PetalType.MAGNET */]: new PetalRendererMagnet_1.default,
};
class MobRendererDispatcher extends Renderer_1.default {
    render(context) {
        super.render(context);
        const { entity } = context;
        const renderer = MOB_RENDERERS[entity.type];
        renderer.render(context);
    }
}
exports.default = MobRendererDispatcher;
