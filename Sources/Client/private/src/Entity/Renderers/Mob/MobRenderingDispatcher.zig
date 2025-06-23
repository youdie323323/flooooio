const std = @import("std");
const Renderer = @import("../Renderer.zig").Renderer;
const RenderFn = @import("../Renderer.zig").RenderFn;
const RenderContext = @import("../Renderer.zig").RenderContext;
const MobSuper = @import("../../Mob.zig").Super;
const MobType = @import("../../EntityType.zig").MobType;
const PetalType = @import("../../EntityType.zig").PetalType;

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

const MobBabyAntRenderer = @import("MobBabyAntRenderer.zig").MobBabyAntRenderer;
const babyAntRender = MobBabyAntRenderer.render;

const MobWorkerAntRenderer = @import("MobWorkerAntRenderer.zig").MobWorkerAntRenderer;
const workerAntRender = MobWorkerAntRenderer.render;

const MobCentipedeRenderer = @import("MobCentipedeRenderer.zig").MobCentipedeRenderer;
const centipedeRender = MobCentipedeRenderer.render;

const MobCactusRenderer = @import("MobCactusRenderer.zig").MobCactusRenderer;
const cactusRender = MobCactusRenderer.render;

const PetalBasicRenderer = @import("../Petal/PetalBasicRenderer.zig").PetalBasicRenderer;
const basicRender = PetalBasicRenderer.render;

const PetalFasterRenderer = @import("../Petal/PetalFasterRenderer.zig").PetalFasterRenderer;
const fasterRender = PetalFasterRenderer.render;

const PetalMagnetRenderer = @import("../Petal/PetalMagnetRenderer.zig").PetalMagnetRenderer;
const magnetRender = PetalMagnetRenderer.render;

const ProjectileMissileRenderer = @import("ProjectileMissileRenderer.zig").ProjectileMissileRenderer;
const missileRender = ProjectileMissileRenderer.render;

const TypeToRendererFn = std.AutoHashMap(u8, RenderFn(MobSuper));

var type_to_renderer: TypeToRendererFn = undefined;

fn render(rctx: RenderContext(MobSuper)) void {
    const entity = rctx.entity;
    const mob = entity.impl;

    if (type_to_renderer.get(mob.type.get())) |r|
        r(rctx);
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
            type_to_renderer.put(@intFromEnum(MobType.baby_ant), babyAntRender) catch unreachable;
            type_to_renderer.put(@intFromEnum(MobType.worker_ant), workerAntRender) catch unreachable;

            type_to_renderer.put(@intFromEnum(MobType.centipede), centipedeRender) catch unreachable;
            type_to_renderer.put(@intFromEnum(MobType.centipede_desert), centipedeRender) catch unreachable;
            type_to_renderer.put(@intFromEnum(MobType.centipede_evil), centipedeRender) catch unreachable;

            type_to_renderer.put(@intFromEnum(MobType.cactus), cactusRender) catch unreachable;

            { // Petal
                type_to_renderer.put(@intFromEnum(PetalType.basic), basicRender) catch unreachable;
                type_to_renderer.put(@intFromEnum(PetalType.faster), fasterRender) catch unreachable;
                type_to_renderer.put(@intFromEnum(PetalType.magnet), magnetRender) catch unreachable;
            }
        }

        { // Projectile
            type_to_renderer.put(@intFromEnum(MobType.missile_projectile), missileRender) catch unreachable;
        }
    }

    { // Init child renderers
        { // Pure
            MobStarfishRenderer.staticInit(allocator);
            MobBeeRenderer.staticInit(allocator);
            MobBabyAntRenderer.staticInit(allocator);
            MobWorkerAntRenderer.staticInit(allocator);
            MobLeechRenderer.staticInit(allocator);
            MobHornetRenderer.staticInit(allocator);
            MobSpiderRenderer.staticInit(allocator);
            MobCentipedeRenderer.staticInit(allocator);
            MobCactusRenderer.staticInit(allocator);

            { // Petal
                PetalBasicRenderer.staticInit(allocator);
                PetalFasterRenderer.staticInit(allocator);
                PetalMagnetRenderer.staticInit(allocator);
            }
        }

        { // Projectile
            ProjectileMissileRenderer.staticInit(allocator);
        }
    }
}

pub const MobRenderingDispatcher = Renderer(MobSuper, true, render, init);
