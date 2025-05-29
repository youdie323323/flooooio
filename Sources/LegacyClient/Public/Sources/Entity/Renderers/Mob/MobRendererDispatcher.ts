import { MobType, PetalType } from "../../../Native/Entity/EntityType";
import type Mob from "../../Mob";
import Renderer from "../Renderer";
import type { RenderingContext } from "../RendererRenderingContext";
import PetalRendererBasic from "./Petal/PetalRendererBasic";
import PetalRendererBubble from "./Petal/PetalRendererBubble";
import PetalRendererEgg from "./Petal/PetalRendererEgg";
import PetalRendererFaster from "./Petal/PetalRendererFaster";
import PetalRendererYinYang from "./Petal/PetalRendererYinYang";
import MobRendererBee from "./MobRendererBee";
import MobRendererBeetle from "./MobRendererBeetle";
import MobRendererBubble from "./MobRendererBubble";
import MobRendererCentipede from "./MobRendererCentipede";
import MobRendererJellyfish from "./MobRendererJellyfish";
import MobRendererSpider from "./MobRendererSpider";
import MobRendererStarfish from "./MobRendererStarfish";
import MobRendererSponge from "./MobRendererSponge";
import MobRendererSandstorm from "./MobRendererSandstorm";
import MobRendererCactus from "./MobRendererCactus";
import MobRendererScorpion from "./MobRendererScorpion";
import MobRendererShinyLadybug from "./MobRendererShinyLadybug";
import PetalRendererMysteriousStick from "./Petal/PetalRendererMysteriousStick";
import MobRendererShell from "./MobRendererShell";
import PetalRendererSand from "./Petal/PetalRendererSand";
import PetalRendererLightning from "./Petal/PetalRendererLightning";
import PetalRendererClaw from "./Petal/PetalRendererClaw";
import PetalRendererFang from "./Petal/PetalRendererFang";
import PetalRendererYggdrasil from "./Petal/PetalRendererYggdrasil";
import MobRendererCrab from "./MobRendererCrab";
import MobRendererHornet from "./MobRendererHornet";
import MobRendererLeech from "./MobRendererLeech";
import PetalRendererWeb from "./Petal/PetalRendererWeb";
import MobRendererMissileProjectile from "./Projectile/MobRendererMissileProjectile";
import MobRendererWebProjectile from "./Projectile/MobRendererWebProjectile";
import PetalRendererStinger from "./Petal/PetalRendererStinger";
import PetalRendererWing from "./Petal/PetalRendererWing";

const centipedeRenderer = new MobRendererCentipede();

const MOB_RENDERERS = {
    // Mob

    [MobType.SPIDER]: new MobRendererSpider,
    [MobType.BEE]: new MobRendererBee,
    [MobType.HORNET]: new MobRendererHornet,

    [MobType.BEETLE]: new MobRendererBeetle,
    [MobType.SANDSTORM]: new MobRendererSandstorm,
    [MobType.CACTUS]: new MobRendererCactus,
    [MobType.SCORPION]: new MobRendererScorpion,
    [MobType.LADYBUG_SHINY]: new MobRendererShinyLadybug,

    [MobType.STARFISH]: new MobRendererStarfish,
    [MobType.JELLYFISH]: new MobRendererJellyfish,
    [MobType.BUBBLE]: new MobRendererBubble,
    [MobType.SPONGE]: new MobRendererSponge,
    [MobType.SHELL]: new MobRendererShell,
    [MobType.CRAB]: new MobRendererCrab,
    [MobType.LEECH]: new MobRendererLeech,

    [MobType.CENTIPEDE]: centipedeRenderer,
    [MobType.CENTIPEDE_DESERT]: centipedeRenderer,
    [MobType.CENTIPEDE_EVIL]: centipedeRenderer,

    [MobType.MISSILE_PROJECTILE]: new MobRendererMissileProjectile,
    [MobType.WEB_PROJECTILE]: new MobRendererWebProjectile,

    // Petal

    [PetalType.BASIC]: new PetalRendererBasic,
    [PetalType.FASTER]: new PetalRendererFaster,
    [PetalType.BUBBLE]: new PetalRendererBubble,
    [PetalType.EGG_BEETLE]: new PetalRendererEgg,
    [PetalType.YIN_YANG]: new PetalRendererYinYang,
    [PetalType.MYSTERIOUS_STICK]: new PetalRendererMysteriousStick,
    [PetalType.SAND]: new PetalRendererSand,
    [PetalType.LIGHTNING]: new PetalRendererLightning,
    [PetalType.CLAW]: new PetalRendererClaw,
    [PetalType.FANG]: new PetalRendererFang,
    [PetalType.YGGDRASIL]: new PetalRendererYggdrasil,
    [PetalType.WEB]: new PetalRendererWeb,
    [PetalType.STINGER]: new PetalRendererStinger,
    [PetalType.WING]: new PetalRendererWing,
} as const satisfies Record<MobType | PetalType, Renderer<Mob>>;

export default class MobRendererDispatcher extends Renderer<Mob> {
    override render(context: RenderingContext<Mob>): void {
        super.render(context);

        const { entity } = context;

        const renderer = MOB_RENDERERS[entity.type];

        renderer.render(context);
    }
}