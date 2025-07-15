var body: Path2D = undefined;

const beak_mul: comptime_float = 0.1;

const body_points: [3]MobSuper.Vector2 = .{
    .{ -17, -12 },
    .{ 17, -12 },
    .{ 0, -15 },
};

fn render(rctx: RenderContext(MobSuper)) void {
    const ctx = rctx.ctx;
    const entity = rctx.entity;
    const mob = entity.impl;

    const bcolor = rctx.blendEffectColors(comptime Color.comptimeFromHexColorCode("#333333"));

    const fcolor = rctx.blendEffectColors(
        if (mob.is_pet)
            comptime Color.comptimeFromHexColorCode("#ffe667")
        else
            comptime Color.comptimeFromHexColorCode("#8f5db0"),
    );
    const scolor = fcolor.darkened(skin_darken);

    ctx.rotate(entity.angle);

    const scale = entity.size * comptime (1.0 / 40.0);
    ctx.scale(scale, scale);

    ctx.setLineJoin(.round);
    ctx.setLineCap(.round);

    { // Beak
        ctx.fillColor(bcolor);
        ctx.strokeColor(bcolor);
        ctx.setLineWidth(6);

        const beak_angle = mob.calculateBeakAngle(beak_mul);

        inline for (.{ -1, 1 }) |dir| {
            ctx.save();
            defer ctx.restore();

            ctx.translate(30, comptime (10 * dir));
            ctx.rotate(beak_angle * dir);

            ctx.beginPath();

            ctx.moveTo(0, comptime (7 * dir));
            ctx.quadraticCurveTo(25, comptime (16 * dir), 40, 0);
            ctx.quadraticCurveTo(20, comptime (6 * dir), 0, 0);

            ctx.fill();
            ctx.stroke();
        }
    }

    ctx.setLineWidth(7);

    // Body
    ctx.fillColor(fcolor);
    ctx.fillPath(body, .nonzero);

    // Body outline
    ctx.strokeColor(scolor);
    ctx.strokePath(body);

    { // Wrinkle
        ctx.setLineWidth(6);

        // Draw center line
        ctx.beginPath();

        ctx.moveTo(-21, 0);
        ctx.quadraticCurveTo(0, -3, 21, 0);

        ctx.stroke();

        ctx.beginPath();

        inline for (.{ -1, 1 }) |dir| {
            inline for (body_points) |p| {
                const p_x, const p_y = p;
                const p_y_relative: comptime_float = comptime (p_y * dir);

                ctx.moveTo(p_x, p_y_relative);
                ctx.arc(p_x, p_y_relative, 5, 0, math.tau, false);
            }
        }

        ctx.fillColor(scolor);
        ctx.fill();
    }
}

fn init(_: std.mem.Allocator) void {
    { // Init paths & commands
        {
            body = .init();
        }

        {
            body.moveTo(0, -30);
            body.quadraticCurveTo(40, -30, 40, 0);
            body.quadraticCurveTo(40, 30, 0, 30);
            body.quadraticCurveTo(-40, 30, -40, 0);
            body.quadraticCurveTo(-40, -30, 0, -30);
            body.closePath();
        }
    }
}

pub const MobBeetleRenderer = Renderer(MobSuper, false, render, init);

const std = @import("std");
const math = std.math;
const time = std.time;

const Path2D = @import("../../../../../Kernel/WebAssembly/Interop/Canvas2D/Path2D.zig");
const Renderer = @import("../Renderer.zig").Renderer;
const skin_darken = @import("../Renderer.zig").skin_darken;
const RenderContext = @import("../Renderer.zig").RenderContext;
const MobSuper = @import("../../Mob.zig").Super;

const Color = @import("../../../../../Kernel/WebAssembly/Interop/Canvas2D/Color.zig");
