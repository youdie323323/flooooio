const Renderer = @import("../Renderers/Renderer.zig").Renderer;
const RenderingContext = @import("../Renderers/Renderer.zig").RenderingContext;
const PlayerSuper = @import("../Player.zig").Super;
const normalRender = @import("./PlayerNormalRenderer.zig").PlayerNormalRenderer.render;
const developerRender = @import("./PlayerDeveloperRenderer.zig").PlayerDeveloperRenderer.render;

fn render(rctx: RenderingContext(PlayerSuper)) void {
    const ctx = rctx.ctx;
    const entity = rctx.entity;

    const scale = entity.size / 25;
    ctx.scale(scale, scale);

    if (entity.impl.is_developer) {
        developerRender(rctx);
    } else {
        normalRender(rctx);
    }
}

pub const PlayerRenderingDispatcher = Renderer(PlayerSuper, true, render, null);
