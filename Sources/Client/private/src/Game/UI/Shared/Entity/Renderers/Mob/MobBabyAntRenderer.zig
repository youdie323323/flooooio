fn render(rctx: RenderContext(MobSuper)) void {
    const ctx = rctx.ctx;
    const entity = rctx.entity;
    const mob = entity.impl;

    const bcolor = rctx.blendEffectColors(comptime .comptimeFromHexColorCode("#292929"));

    const fcolor = rctx.blendEffectColors(comptime .comptimeFromHexColorCode("#555555"));
    const scolor = fcolor.darkened(skin_darken);

    ctx.rotate(entity.angle);

    const scale = entity.size * comptime (1.0 / 30.0);
    ctx.scale(scale, scale);

    ctx.setLineJoin(.round);
    ctx.setLineCap(.round);

    ctx.setLineWidth(7);

    ctx.strokeColor(bcolor);

    const beak_angle = mob.calculateBeakAngle(0.05);

    { // Beak
        ctx.save();
        defer ctx.restore();

        inline for (.{ -1, 1 }) |dir| {
            ctx.beginPath();

            ctx.rotate(
                (beak_angle * dir) +
                    // Add for negative dir
                    if (comptime dir == 1)
                        beak_angle
                    else
                        0,
            );

            ctx.moveTo(0, comptime (7 * dir));
            ctx.quadraticCurveTo(11, comptime (10 * dir), 22, comptime (5 * dir));

            ctx.stroke();
        }
    }

    // Body outline
    ctx.beginPath();

    ctx.arc(0, 0, 17.5, 0, math.tau, false);

    ctx.fillColor(scolor);
    ctx.fill();

    // Body
    ctx.beginPath();

    ctx.arc(0, 0, 10.5, 0, math.tau, false);

    ctx.fillColor(fcolor);
    ctx.fill();
}

pub const MobBabyAntRenderer = Renderer(MobSuper, false, render, null);

const std = @import("std");
const math = std.math;
const time = std.time;

const Renderer = @import("../Renderer.zig").Renderer;
const skin_darken = @import("../Renderer.zig").skin_darken;
const RenderContext = @import("../Renderer.zig").RenderContext;
const MobSuper = @import("../../Mob.zig").Super;
