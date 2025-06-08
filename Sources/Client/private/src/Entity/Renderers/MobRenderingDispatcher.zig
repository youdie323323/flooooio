const std = @import("std");
const Renderer = @import("../Renderers/Renderer.zig").Renderer;
const RendererFn = @import("../Renderers/Renderer.zig").RendererFn;
const RenderingContext = @import("../Renderers/Renderer.zig").RenderingContext;
const MobSuper = @import("../Mob.zig").Super;
const MobType = @import("../EntityType.zig").MobType;

const starfishRender = @import("./MobStarfishRenderer.zig").MobStarfishRenderer.render;
const beeRender = @import("./MobBeeRenderer.zig").MobBeeRenderer.render;
const leechRender = @import("./MobLeechRenderer.zig").MobLeechRenderer.render;

const TypeToRendererFn = std.AutoHashMap(u8, RendererFn(MobSuper));

var type_to_renderer: TypeToRendererFn = undefined;

fn render(rctx: RenderingContext(MobSuper)) void {
    const entity = rctx.entity;
    const mob = entity.impl;

    if (type_to_renderer.get(mob.type.get())) |r| r(rctx) else {
        std.log.warn("Unrendered mob: {}", .{mob.type});
    }
}

fn init(allocator: std.mem.Allocator) void {
    type_to_renderer = TypeToRendererFn.init(allocator);

    type_to_renderer.put(@intFromEnum(MobType.starfish), starfishRender) catch unreachable;
    type_to_renderer.put(@intFromEnum(MobType.leech), leechRender) catch unreachable;
    type_to_renderer.put(@intFromEnum(MobType.bee), beeRender) catch unreachable;
}

pub const MobRenderingDispatcher = Renderer(MobSuper, true, render, init);
