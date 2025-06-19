const std = @import("std");
const math = std.math;
const time = std.time;
const Renderer = @import("../Renderer.zig").Renderer;
const skin_darken = @import("../Renderer.zig").skin_darken;
const RenderContext = @import("../Renderer.zig").RenderContext;
const MobSuper = @import("../../Mob.zig").Super;

const Color = @import("../../../WebAssembly/Interop/Canvas2D/Color.zig");

const missileBody = @import("MobHornetRenderer.zig").missileBody;
const missileBodyStroke = @import("MobHornetRenderer.zig").missileBodyStroke;

fn render(rctx: RenderContext(MobSuper)) void {
    const ctx = rctx.ctx;
    const entity = rctx.entity;

    ctx.rotate(entity.angle);

    const scale = entity.size / 25;
    ctx.scale(scale, scale);

    ctx.fillColor(rctx.blendEffectColors(comptime Color.comptimeFromHexColorCode("#333333")));
    ctx.fillPath(missileBody().*, .nonzero);
    ctx.fillPath(missileBodyStroke().*, .nonzero);
}

pub const ProjectileMissileRenderer = Renderer(MobSuper, false, render, null);
