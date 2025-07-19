/// Global enum map storing all renderer functions.
const type_to_renderer: std.EnumMap(EntityType.Mixed, RenderFn(MobSuper)) = .init(.{
    // Mobs

    .mob_bee = beeRender,
    .mob_spider = spiderRender,
    .mob_hornet = hornetRender,
    .mob_baby_ant = babyAntRender,
    .mob_worker_ant = workerAntRender,
    .mob_soldier_ant = soldierAntRender,

    .mob_beetle = beetleRender,
    .mob_sandstorm = sandstormRender,
    .mob_cactus = cactusRender,
    .mob_scorpion = scorpionRender,

    .mob_starfish = starfishRender,
    .mob_jellyfish = jellyfishRender,
    .mob_sponge = spongeRender,
    .mob_shell = shellRender,
    .mob_leech = leechRender,

    .mob_centipede = centipedeRender,
    .mob_centipede_desert = centipedeRender,
    .mob_centipede_evil = centipedeRender,

    // Petals

    .petal_basic = basicRender,
    .petal_faster = fasterRender,
    .petal_magnet = magnetRender,
    .petal_lightning = lightningRender,
    .petal_mysterious_stick = mysteriousStickRender,
    .petal_wing = wingRender,
    .petal_missile = missileRender,

    // Projectiles

    .mob_missile_projectile = projectileMissileRender,
});

/// Main render function that dispatches to appropriate renderer based on mob type.
fn render(rctx: *RenderContext(MobSuper)) void {
    const entity = rctx.entity;
    const mob = &entity.impl;

    if (type_to_renderer.get(mob.type.getMixed())) |renderer|
        renderer(rctx);
}

fn init(allocator: std.mem.Allocator) void {
    { // Init child renderers
        { // Pure
            MobStarfishRenderer.staticInit(allocator);
            MobBeeRenderer.staticInit(allocator);
            MobBabyAntRenderer.staticInit(allocator);
            MobWorkerAntRenderer.staticInit(allocator);
            MobSoldierAntRenderer.staticInit(allocator);
            MobLeechRenderer.staticInit(allocator);
            MobSpongeRenderer.staticInit(allocator);
            MobHornetRenderer.staticInit(allocator);
            MobSpiderRenderer.staticInit(allocator);
            MobCentipedeRenderer.staticInit(allocator);
            MobCactusRenderer.staticInit(allocator);
            MobScorpionRenderer.staticInit(allocator);
            MobBeetleRenderer.staticInit(allocator);
            MobJellyfishRenderer.staticInit(allocator);
            MobShellRenderer.staticInit(allocator);
            MobSandstormRenderer.staticInit(allocator);

            { // Petal
                PetalBasicRenderer.staticInit(allocator);
                PetalFasterRenderer.staticInit(allocator);
                PetalMagnetRenderer.staticInit(allocator);
                PetalLightningRenderer.staticInit(allocator);
                PetalMysteriousStickRenderer.staticInit(allocator);
                PetalWingRenderer.staticInit(allocator);
                PetalMissileRenderer.staticInit(allocator);
            }
        }

        { // Projectile
            ProjectileMissileRenderer.staticInit(allocator);
        }
    }
}

pub const MobRenderingDispatcher = Renderer(MobSuper, true, render, init);

const std = @import("std");

const Renderer = @import("../Renderer.zig").Renderer;
const RenderFn = @import("../Renderer.zig").RenderFn;
const RenderContext = @import("../Renderer.zig").RenderContext;
const MobSuper = @import("../../Mob.zig").Super;
const EntityType = @import("../../EntityType.zig").EntityType;
const MobType = @import("../../EntityType.zig").MobType;
const PetalType = @import("../../EntityType.zig").PetalType;

const MobStarfishRenderer = @import("MobStarfishRenderer.zig").MobStarfishRenderer;
const starfishRender = MobStarfishRenderer.render;

const MobBeeRenderer = @import("MobBeeRenderer.zig").MobBeeRenderer;
const beeRender = MobBeeRenderer.render;

const MobLeechRenderer = @import("MobLeechRenderer.zig").MobLeechRenderer;
const leechRender = MobLeechRenderer.render;

const MobSpongeRenderer = @import("MobSpongeRenderer.zig").MobSpongeRenderer;
const spongeRender = MobSpongeRenderer.render;

const MobHornetRenderer = @import("MobHornetRenderer.zig").MobHornetRenderer;
const hornetRender = MobHornetRenderer.render;

const MobSpiderRenderer = @import("MobSpiderRenderer.zig").MobSpiderRenderer;
const spiderRender = MobSpiderRenderer.render;

const MobBabyAntRenderer = @import("MobBabyAntRenderer.zig").MobBabyAntRenderer;
const babyAntRender = MobBabyAntRenderer.render;

const MobWorkerAntRenderer = @import("MobWorkerAntRenderer.zig").MobWorkerAntRenderer;
const workerAntRender = MobWorkerAntRenderer.render;

const MobSoldierAntRenderer = @import("MobSoldierAntRenderer.zig").MobSoldierAntRenderer;
const soldierAntRender = MobSoldierAntRenderer.render;

const MobCentipedeRenderer = @import("MobCentipedeRenderer.zig").MobCentipedeRenderer;
const centipedeRender = MobCentipedeRenderer.render;

const MobCactusRenderer = @import("MobCactusRenderer.zig").MobCactusRenderer;
const cactusRender = MobCactusRenderer.render;

const MobScorpionRenderer = @import("MobScorpionRenderer.zig").MobScorpionRenderer;
const scorpionRender = MobScorpionRenderer.render;

const MobBeetleRenderer = @import("MobBeetleRenderer.zig").MobBeetleRenderer;
const beetleRender = MobBeetleRenderer.render;

const MobJellyfishRenderer = @import("MobJellyfishRenderer.zig").MobJellyfishRenderer;
const jellyfishRender = MobJellyfishRenderer.render;

const MobSandstormRenderer = @import("MobSandstormRenderer.zig").MobSandstormRenderer;
const sandstormRender = MobSandstormRenderer.render;

const MobShellRenderer = @import("MobShellRenderer.zig").MobShellRenderer;
const shellRender = MobShellRenderer.render;

const PetalBasicRenderer = @import("../Petal/PetalBasicRenderer.zig").PetalBasicRenderer;
const basicRender = PetalBasicRenderer.render;

const PetalFasterRenderer = @import("../Petal/PetalFasterRenderer.zig").PetalFasterRenderer;
const fasterRender = PetalFasterRenderer.render;

const PetalMagnetRenderer = @import("../Petal/PetalMagnetRenderer.zig").PetalMagnetRenderer;
const magnetRender = PetalMagnetRenderer.render;

const PetalLightningRenderer = @import("../Petal/PetalLightningRenderer.zig").PetalLightningRenderer;
const lightningRender = PetalLightningRenderer.render;

const PetalMysteriousStickRenderer = @import("../Petal/PetalMysteriousStickRenderer.zig").PetalMysteriousStickRenderer;
const mysteriousStickRender = PetalMysteriousStickRenderer.render;

const PetalWingRenderer = @import("../Petal/PetalWingRenderer.zig").PetalWingRenderer;
const wingRender = PetalWingRenderer.render;

const ProjectileMissileRenderer = @import("ProjectileMissileRenderer.zig").ProjectileMissileRenderer;
const projectileMissileRender = ProjectileMissileRenderer.render;

const PetalMissileRenderer = @import("../Petal/PetalMissileRenderer.zig").PetalMissileRenderer;
const missileRender = PetalMissileRenderer.render;
