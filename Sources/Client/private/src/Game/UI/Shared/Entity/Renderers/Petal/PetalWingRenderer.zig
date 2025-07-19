const pi2 = math.pi / 2.0;

fn render(rctx: *RenderContext(MobSuper)) void {
    const ctx = rctx.ctx;
    const entity = rctx.entity;

    const fcolor = rctx.blendEffectColors(comptime .comptimeFromHex(0xFFFFFF));
    const scolor = fcolor.darkened(body_darken);

    ctx.rotate(entity.angle);

    const scale = entity.size * comptime (1.0 / 10.0);
    ctx.scale(scale, scale);

    ctx.setLineJoin(.round);

    ctx.beginPath();

    ctx.arc(0, 0, 15, -pi2, pi2, false);
    ctx.quadraticCurveTo(10, 0, 0, -15);

    ctx.closePath();

    ctx.fillColor(fcolor);
    ctx.strokeColor(scolor);
    ctx.setLineWidth(3);
    ctx.fill();
    ctx.stroke();
}

pub const PetalWingRenderer = Renderer(MobSuper, false, render, null);

const std = @import("std");
const math = std.math;
const time = std.time;
const Renderer = @import("../Renderer.zig").Renderer;
const body_darken = @import("../Renderer.zig").body_darken;
const RenderContext = @import("../Renderer.zig").RenderContext;
const MobSuper = @import("../../Mob.zig").Super;
