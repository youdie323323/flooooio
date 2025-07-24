const pi2 = math.pi / 2.0;

fn render(rctx: *RenderContext(MobSuper)) void {
    const ctx = rctx.ctx;
    const entity = rctx.entity;

    const fcolor = rctx.blendEffectColors(comptime .comptimeFromHex(0x333333));

    ctx.rotate(entity.angle);

    const scale = entity.size * comptime (1.0 / 8.0);
    ctx.scale(scale, scale);

    ctx.setLineJoin(.round);

    ctx.beginPath();

    ctx.moveTo(11, 0);
    ctx.lineTo(-11, -6);
    ctx.lineTo(-11, 6);

    ctx.closePath();

    ctx.fillColor(fcolor);
    ctx.strokeColor(fcolor);
    ctx.setLineWidth(5);
    ctx.fill();
    ctx.stroke();
}

pub const PetalMissileRenderer = Renderer(MobSuper, false, render, null);

const std = @import("std");
const math = std.math;
const time = std.time;
const Renderer = @import("../Renderer.zig").Renderer;
const RenderContext = @import("../Renderer.zig").RenderContext;
const MobSuper = @import("../../Mob.zig").Super;
