import { MobType, PetalType } from "../../../../../../../Shared/Entity/Statics/EntityType";
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

const centipedeRenderer = new MobRendererCentipede();

const MOB_TYPE_TO_RENDERER_MAPPING = {
    // Mob
    
    [MobType.SPIDER]: new MobRendererSpider,
    [MobType.BEETLE]: new MobRendererBeetle,
    [MobType.BEE]: new MobRendererBee,

    [MobType.STARFISH]: new MobRendererStarfish,
    [MobType.JELLYFISH]: new MobRendererJellyfish,
    [MobType.BUBBLE]: new MobRendererBubble,

    [MobType.CENTIPEDE]: centipedeRenderer,
    [MobType.CENTIPEDE_DESERT]: centipedeRenderer,
    [MobType.CENTIPEDE_EVIL]: centipedeRenderer,

    // Petal
    
    [PetalType.BASIC]: new PetalRendererBasic,
    [PetalType.FASTER]: new PetalRendererFaster,
    [PetalType.BUBBLE]: new PetalRendererBubble,
    [PetalType.EGG_BEETLE]: new PetalRendererEgg,
    [PetalType.YIN_YANG]: new PetalRendererYinYang,
} as const satisfies Record<MobType | PetalType, Renderer<Mob>>;

export default class MobRendererDispatcher extends Renderer<Mob> {
    override render(context: RenderingContext<Mob>): void {
        super.render(context);

        const { ctx, entity } = context;

        ctx.lineWidth = 6;

        ctx.rotate(entity.angle);

        const renderer = MOB_TYPE_TO_RENDERER_MAPPING[entity.type];

        renderer.render(context);
    }
}