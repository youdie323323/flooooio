const std = @import("std");
const Renderer = @import("../../Renderers/Renderer.zig").Renderer;
const RenderContext = @import("../../Renderers/Renderer.zig").RenderContext;
const PlayerSuper = @import("../../Player.zig").Super;

const PlayerNormalRenderer = @import("PlayerNormalRenderer.zig").PlayerNormalRenderer;
const normalRender = PlayerNormalRenderer.render;

const PlayerDeveloperRenderer = @import("PlayerDeveloperRenderer.zig").PlayerDeveloperRenderer;
const developerRender = PlayerDeveloperRenderer.render;

fn render(rctx: RenderContext(PlayerSuper)) void {
    const ctx = rctx.ctx;
    const entity = rctx.entity;

    const scale = entity.size * comptime (1.0 / 25.0);
    ctx.scale(scale, scale);

    if (entity.impl.is_developer) {
        developerRender(rctx);
    } else {
        normalRender(rctx);
    }
}

fn init(allocator: std.mem.Allocator) void {
    // Init child renderers
    PlayerNormalRenderer.staticInit(allocator);
    PlayerDeveloperRenderer.staticInit(allocator);
}

pub const PlayerRenderingDispatcher = Renderer(PlayerSuper, true, render, init);
