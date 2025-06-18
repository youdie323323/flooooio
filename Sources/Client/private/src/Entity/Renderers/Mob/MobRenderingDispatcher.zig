const std = @import("std");
const Renderer = @import("../Renderer.zig").Renderer;
const RenderFn = @import("../Renderer.zig").RenderFn;
const RenderContext = @import("../Renderer.zig").RenderContext;
const MobSuper = @import("../../Mob.zig").Super;
const MobType = @import("../../../Florr/Native/Entity/EntityType.zig").MobType;

const MobStarfishRenderer = @import("MobStarfishRenderer.zig").MobStarfishRenderer;
const starfishRender = MobStarfishRenderer.render;

const MobBeeRenderer = @import("MobBeeRenderer.zig").MobBeeRenderer;
const beeRender = MobBeeRenderer.render;

const MobLeechRenderer = @import("MobLeechRenderer.zig").MobLeechRenderer;
const leechRender = MobLeechRenderer.render;

const MobHornetRenderer = @import("MobHornetRenderer.zig").MobHornetRenderer;
const hornetRender = MobHornetRenderer.render;

const MobSpiderRenderer = @import("MobSpiderRenderer.zig").MobSpiderRenderer;
const spiderRender = MobSpiderRenderer.render;

const MobCentipedeRenderer = @import("MobCentipedeRenderer.zig").MobCentipedeRenderer;
const centipedeRender = MobCentipedeRenderer.render;

const MobCactusRenderer = @import("MobCactusRenderer.zig").MobCactusRenderer;
const cactusRender = MobCactusRenderer.render;

const ProjectileMissileRenderer = @import("ProjectileMissileRenderer.zig").ProjectileMissileRenderer;
const missileRender = ProjectileMissileRenderer.render;

const TypeToRendererFn = std.AutoHashMap(u8, RenderFn(MobSuper));

var type_to_renderer: TypeToRendererFn = undefined;

fn render(rctx: RenderContext(MobSuper)) void {
    const entity = rctx.entity;
    const mob = entity.impl;

    if (type_to_renderer.get(mob.type.get())) |r|
        r(rctx);
    // else
    //     log(@src(), .debug, "Unrendered mob: {}", .{mob.type});
}

fn init(allocator: std.mem.Allocator) void {
    type_to_renderer = TypeToRendererFn.init(allocator);

    { // Put renderers
        { // Pure
            type_to_renderer.put(@intFromEnum(MobType.starfish), starfishRender) catch unreachable;
            type_to_renderer.put(@intFromEnum(MobType.leech), leechRender) catch unreachable;
            type_to_renderer.put(@intFromEnum(MobType.bee), beeRender) catch unreachable;
            type_to_renderer.put(@intFromEnum(MobType.hornet), hornetRender) catch unreachable;
            type_to_renderer.put(@intFromEnum(MobType.spider), spiderRender) catch unreachable;

            type_to_renderer.put(@intFromEnum(MobType.centipede), centipedeRender) catch unreachable;
            type_to_renderer.put(@intFromEnum(MobType.centipede_desert), centipedeRender) catch unreachable;
            type_to_renderer.put(@intFromEnum(MobType.centipede_evil), centipedeRender) catch unreachable;

            type_to_renderer.put(@intFromEnum(MobType.cactus), cactusRender) catch unreachable;
        }

        { // Projectile
            type_to_renderer.put(@intFromEnum(MobType.missile_projectile), missileRender) catch unreachable;
        }
    }

    { // Init child renderers
        { // Pure
            MobStarfishRenderer.staticInit(allocator);
            MobBeeRenderer.staticInit(allocator);
            MobLeechRenderer.staticInit(allocator);
            MobHornetRenderer.staticInit(allocator);
            MobSpiderRenderer.staticInit(allocator);
            MobCentipedeRenderer.staticInit(allocator);
            MobCactusRenderer.staticInit(allocator);
        }

        { // Projectile
            ProjectileMissileRenderer.staticInit(allocator);
        }
    }
}

pub const MobRenderingDispatcher = Renderer(MobSuper, true, render, init);
