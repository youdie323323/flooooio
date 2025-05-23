import type { AutomaticallySizedLayoutOptions } from "../Layout/Components/WellKnown/Container";
import Gauge, { entityHealthGaugeSources } from "../Layout/Components/WellKnown/Gauge";
import type Player from "../../Entity/Player";
import { renderEntity } from "../../Entity/Renderers/RendererRenderingLink";
import { RARITY_COLOR, Rarity } from "../../Native/Rarity";

export default class UIGameSelfPlayerStatus extends Gauge {
    private static readonly PLAYER_PROXY_HANDLER = {
        get(target, property, receiver) {
            if (property === "size") return 20;

            return Reflect.get(target, property, receiver);
        },
        // Disable write
        set: function () {
            return false;
        },
    } as const satisfies ProxyHandler<Player>;

    constructor(
        layoutOptions: AutomaticallySizedLayoutOptions,

        private player: Player,
    ) {
        super(
            {
                ...layoutOptions,

                w: 135,
                h: 22,
            },

            entityHealthGaugeSources(player),
            20,
            () => player.name,
        );

        this.player = new Proxy(this.player, UIGameSelfPlayerStatus.PLAYER_PROXY_HANDLER);
    }

    override render(ctx: CanvasRenderingContext2D): void {
        super.render(ctx);

        const { player } = this;

        // The coordinate cancel each other out
        ctx.translate(-player.x, -player.y);

        ctx.translate(-16, this.h / 2);

        renderEntity({
            ctx,
            entity: player,
            isSpecimen: true,
        });
    }

    override destroy(): void {
        super.destroy();

        this.player = null;
    }
}