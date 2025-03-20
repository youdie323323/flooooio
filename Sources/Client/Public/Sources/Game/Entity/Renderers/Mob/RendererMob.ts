import { MobType, PetalType } from "../../../../../../../Shared/Entity/Statics/EntityType";
import type Mob from "../../Mob";
import Renderer from "../Renderer";
import type { RenderContext } from "../RendererRenderingContext";
import RendererPetalBasic from "./Petal/RendererPetalBasic";
import RendererPetalBubble from "./Petal/RendererPetalBubble";
import RendererPetalEgg from "./Petal/RendererPetalEgg";
import RendererPetalFaster from "./Petal/RendererPetalFaster";
import RendererPetalYinYang from "./Petal/RendererPetalYinYang";
import RendererMobBee from "./RendererMobBee";
import RendererMobBeetle from "./RendererMobBeetle";
import RendererMobBubble from "./RendererMobBubble";
import RendererMobCentipede from "./RendererMobCentipede";
import RendererMobJellyfish from "./RendererMobJellyfish";
import RendererMobSpider from "./RendererMobSpider";
import RendererMobStarfish from "./RendererMobStarfish";

const centipedeRenderer = new RendererMobCentipede();

const typeToRendererMapping = {
    // Mob
    [MobType.SPIDER]: new RendererMobSpider,
    [MobType.BEETLE]: new RendererMobBeetle,
    [MobType.BEE]: new RendererMobBee,

    [MobType.STARFISH]: new RendererMobStarfish,
    [MobType.JELLYFISH]: new RendererMobJellyfish,
    [MobType.BUBBLE]: new RendererMobBubble,

    [MobType.CENTIPEDE]: centipedeRenderer,
    [MobType.CENTIPEDE_DESERT]: centipedeRenderer,
    [MobType.CENTIPEDE_EVIL]: centipedeRenderer,

    // Petal
    [PetalType.BASIC]: new RendererPetalBasic,
    [PetalType.FASTER]: new RendererPetalFaster,
    [PetalType.BUBBLE]: new RendererPetalBubble,
    [PetalType.EGG_BEETLE]: new RendererPetalEgg,
    [PetalType.YIN_YANG]: new RendererPetalYinYang,
} as const satisfies Record<MobType | PetalType, Renderer<Mob>>;

export default class RendererMob extends Renderer<Mob> {
    override render(context: RenderContext<Mob>): void {
        super.render(context);

        const { ctx, entity } = context;

        ctx.lineWidth = 6;

        ctx.rotate(entity.angle);

        const renderer = typeToRendererMapping[entity.type];

        renderer.render(context);
    }
}