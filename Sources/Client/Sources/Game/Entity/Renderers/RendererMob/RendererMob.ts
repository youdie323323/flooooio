import { MobType, PetalType } from "../../../../../../Shared/Entity/Statics/EntityType";
import Mob from "../../Mob";
import Renderer from "../Renderer";
import type { RenderContext } from "../RendererRenderingContext";
import RendererMobBee from "./RendererMobBee";
import RendererMobBeetle from "./RendererMobBeetle";
import RendererMobBubble from "./RendererMobBubble";
import RendererMobCentipede from "./RendererMobCentipede";
import RendererMobJellyfish from "./RendererMobJellyfish";
import RendererMobSpider from "./RendererMobSpider";
import RendererMobStarfish from "./RendererMobStarfish";
import RendererPetalBasic from "./RendererPetal/RendererPetalBasic";
import RendererPetalBubble from "./RendererPetal/RendererPetalBubble";
import RendererPetalEgg from "./RendererPetal/RendererPetalEgg";
import RendererPetalFaster from "./RendererPetal/RendererPetalFaster";
import RendererPetalYinYang from "./RendererPetal/RendererPetalYinYang";

const centipedeRenderer = new RendererMobCentipede();

const typeToRendererMapping = {
    // Mob
    [MobType.Spider]: new RendererMobSpider,
    [MobType.Beetle]: new RendererMobBeetle,
    [MobType.Bee]: new RendererMobBee,

    [MobType.Starfish]: new RendererMobStarfish,
    [MobType.Jellyfish]: new RendererMobJellyfish,
    [MobType.Bubble]: new RendererMobBubble,

    [MobType.Centipede]: centipedeRenderer,
    [MobType.CentipedeDesert]: centipedeRenderer,
    [MobType.CentipedeEvil]: centipedeRenderer,

    // Petal
    [PetalType.Basic]: new RendererPetalBasic,
    [PetalType.Faster]: new RendererPetalFaster,
    [PetalType.Bubble]: new RendererPetalBubble,
    [PetalType.BeetleEgg]: new RendererPetalEgg,
    [PetalType.YinYang]: new RendererPetalYinYang,
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