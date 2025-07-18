const tentacle_count: comptime_int = 8;
const tentacle_count_float: comptime_float = @floatFromInt(tentacle_count);

fn render(rctx: *RenderContext(MobSuper)) void {
    const ctx = rctx.ctx;
    const entity = rctx.entity;
    const mob = &entity.impl;
    const is_specimen = rctx.is_specimen;

    const old_global_alpha = ctx.globalAlpha();

    const fcolor = rctx.blendEffectColors(comptime .comptimeFromHex(0xFFFFFF));

    ctx.rotate(entity.angle);

    const scale = entity.size * comptime (1.0 / 20.0);
    ctx.scale(scale, scale);

    ctx.fillColor(fcolor);
    ctx.strokeColor(fcolor);

    ctx.setGlobalAlpha(0.6 * old_global_alpha);

    ctx.setLineCap(.round);
    ctx.setLineWidth(2.3);

    const tentacle_t =
        if (is_specimen)
            1
        else
            mob.total_t / 10;

    ctx.beginPath();

    inline for (0..tentacle_count) |i| {
        const i_float: comptime_float = comptime @floatFromInt(i);

        const angle = comptime (i_float / tentacle_count_float * math.tau);
        const meandering = @sin(angle + tentacle_t);

        ctx.save();
        defer ctx.restore();

        ctx.rotate(angle);

        ctx.translate(17.5, 0);
        ctx.moveTo(0, 0);
        ctx.rotate(0.5 * meandering);
        ctx.quadraticCurveTo(4, -2 * meandering, 14, 0);
    }

    ctx.stroke();

    { // Body
        ctx.save();
        defer ctx.restore();

        ctx.beginPath();

        ctx.arc(0, 0, 20, 0, math.tau, false);

        ctx.setGlobalAlpha(0.5 * old_global_alpha);
        ctx.fill();

        ctx.clip();

        ctx.setLineWidth(3);

        ctx.stroke();
    }
}

pub const MobJellyfishRenderer = Renderer(MobSuper, false, render, null);

const std = @import("std");
const math = std.math;
const time = std.time;

const Renderer = @import("../Renderer.zig").Renderer;
const skin_darken = @import("../Renderer.zig").skin_darken;
const RenderContext = @import("../Renderer.zig").RenderContext;
const MobSuper = @import("../../Mob.zig").Super;
