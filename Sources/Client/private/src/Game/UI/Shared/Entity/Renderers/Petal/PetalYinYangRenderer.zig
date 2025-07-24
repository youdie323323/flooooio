const pi2 = math.pi / 2.0;
const pi3_2 = 3 * math.pi / 2.0;

fn clipFill(
    rctx: *RenderContext(MobSuper),
    comptime color: Color.HexColor,
) void {
    const ctx = rctx.ctx;

    const fcolor = rctx.blendEffectColors(comptime .comptimeFromHex(color));
    const scolor = fcolor.darkened(skin_darken);

    ctx.save();
    defer ctx.restore();

    ctx.clip();

    ctx.fillColor(fcolor);
    ctx.strokeColor(scolor);
    ctx.fill();
    ctx.stroke();
}

fn render(rctx: *RenderContext(MobSuper)) void {
    const ctx = rctx.ctx;
    const entity = rctx.entity;

    ctx.rotate(entity.angle);

    const scale = entity.size * comptime (1.0 / 20.0);
    ctx.scale(scale, scale);

    ctx.setLineCap(.round);

    ctx.setLineWidth(6);

    ctx.beginPath();

    ctx.arc(0, 0, 20, 0, math.tau, false);

    clipFill(rctx, 0x333333);

    ctx.rotate(math.pi);

    ctx.beginPath();

    ctx.arc(0, 0, 20, -pi2, pi2, false);
    ctx.arc(0, 10, 10, pi2, pi3_2, false);
    ctx.arc(0, -10, 10, pi2, pi3_2, true);

    clipFill(rctx, 0xFFFFFF);

    ctx.rotate(-math.pi);

    ctx.beginPath();

    ctx.arc(0, 10, 10, pi2, pi3_2, false);

    clipFill(rctx, 0x333333);
}

pub const PetalYinYangRenderer = Renderer(MobSuper, false, render, null);

const std = @import("std");
const math = std.math;
const time = std.time;
const Renderer = @import("../Renderer.zig").Renderer;
const skin_darken = @import("../Renderer.zig").skin_darken;
const RenderContext = @import("../Renderer.zig").RenderContext;
const MobSuper = @import("../../Mob.zig").Super;

const Color = @import("../../../../../Kernel/WebAssembly/Interop/Canvas2D/Color.zig");
