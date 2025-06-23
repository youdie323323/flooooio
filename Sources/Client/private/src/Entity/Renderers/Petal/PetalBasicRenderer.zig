const std = @import("std");
const math = std.math;
const time = std.time;
const Renderer = @import("../Renderer.zig").Renderer;
const skin_darken = @import("../Renderer.zig").skin_darken;
const RenderContext = @import("../Renderer.zig").RenderContext;
const MobSuper = @import("../../Mob.zig").Super;

const Color = @import("../../../WebAssembly/Interop/Canvas2D/Color.zig");

pub inline fn drawBasicLike(
    rctx: RenderContext(MobSuper),
    comptime color: Color.HexColor,
    comptime fraction: f32,
    comptime outline_width: f32,
) void {
    const ctx = rctx.ctx;
    const entity = rctx.entity;

    const fcolor = rctx.blendEffectColors(comptime Color.comptimeFromHex(color));
    const scolor = fcolor.darkened(skin_darken);

    ctx.rotate(entity.angle);

    const scale = entity.size * comptime (1.0 / fraction);
    ctx.scale(scale, scale);

    ctx.beginPath();

    ctx.arc(0, 0, 15, 0, math.tau, false);

    ctx.setLineWidth(outline_width);
    ctx.fillColor(fcolor);
    ctx.strokeColor(scolor);
    ctx.fill();
    ctx.stroke();
}

fn render(rctx: RenderContext(MobSuper)) void {
    drawBasicLike(
        rctx,
        0xffffff,
        15,
        5,
    );
}

pub const PetalBasicRenderer = Renderer(MobSuper, false, render, null);
