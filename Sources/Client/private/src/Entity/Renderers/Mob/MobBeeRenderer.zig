const std = @import("std");
const math = std.math;
const time = std.time;
const Renderer = @import("../Renderer.zig").Renderer;
const darkened_base = @import("../Renderer.zig").darkened_base;
const RenderContext = @import("../Renderer.zig").RenderContext;
const MobSuper = @import("../../Mob.zig").Super;

const Color = @import("../../../WebAssembly/Interop/Canvas2D/Color.zig");

fn render(rctx: RenderContext(MobSuper)) void {
    const ctx = rctx.ctx;
    const entity = rctx.entity;

    const bcolor = rctx.blendStatusEffects(comptime Color.comptimeFromHexColorCode("#333333"));

    const fcolor = rctx.blendStatusEffects(comptime Color.comptimeFromHexColorCode("#ffe763"));
    const scolor = fcolor.darkened(darkened_base);

    ctx.rotate(entity.angle);

    const scale = entity.size / 30;
    ctx.scale(scale, scale);

    ctx.setLineJoin(.round);
    ctx.setLineCap(.round);

    ctx.setLineWidth(5);

    { // Stinger
        ctx.fillColor(bcolor);
        ctx.strokeColor(bcolor.darkened(darkened_base));

        ctx.beginPath();

        ctx.moveTo(-37, 0);
        ctx.lineTo(-25, -9);
        ctx.lineTo(-25, 9);

        ctx.closePath();

        ctx.fill();
        ctx.stroke();
    }

    // Body
    ctx.beginPath();

    ctx.ellipse(0, 0, 30, 20, 0, 0, math.tau, false);

    ctx.fillColor(fcolor);
    ctx.fill();

    { // Body stripes
        ctx.save();
        defer ctx.restore();

        ctx.clip();

        ctx.fillColor(bcolor);
        ctx.fillRect(10, -20, 10, 40);
        ctx.fillRect(-10, -20, 10, 40);
        ctx.fillRect(-30, -20, 10, 40);
    }

    // Body outline
    ctx.beginPath();

    ctx.ellipse(0, 0, 30, 20, 0, 0, math.tau, false);

    ctx.strokeColor(scolor);
    ctx.stroke();

    { // Antennas
        ctx.fillColor(bcolor);
        ctx.strokeColor(bcolor);
        ctx.setLineWidth(3);

        inline for (.{ -1, 1 }) |dir| {
            const x, const y = comptime .{ 5 * dir, 15 * dir };

            ctx.beginPath();
            ctx.moveTo(25, x);
            ctx.quadraticCurveTo(35, x, 40, y);
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(40, y, 5, 0, math.tau, false);
            ctx.fill();
        }
    }
}

pub const MobBeeRenderer = Renderer(MobSuper, false, render, null);
