const tau5 = math.tau / 5.0;

const Vector2 = @Vector(2, f32);

const body_size: comptime_float = 30;

const vertex =
    @as(Vector2, .{
        @cos(tau5),
        @sin(tau5),
    }) *
    @as(Vector2, @splat(body_size));

fn render(rctx: *RenderContext(MobSuper)) void {
    const ctx = rctx.ctx;
    const entity = rctx.entity;
    const is_specimen = rctx.is_specimen;

    const fcolor = rctx.blendEffectColors(comptime .comptimeFromHexColorCode("#FCDD86"));
    const scolor = fcolor.darkened(skin_darken);

    ctx.rotate(entity.angle);

    const scale = entity.size *
        @as(
            f32,
            if (is_specimen)
                comptime (1.0 / 25.0)
            else
                comptime (1.0 / 20.0),
        );
    ctx.scale(scale, scale);

    ctx.setLineWidth(5);

    ctx.setLineJoin(.round);
    ctx.setLineCap(.round);

    ctx.strokeColor(scolor);

    { // Auricle
        ctx.beginPath();

        ctx.moveTo(-20, -15);
        ctx.quadraticCurveTo(-15, 0, -20, 15);
        ctx.lineTo(0, 3);
        ctx.lineTo(0, -3);

        ctx.closePath();

        ctx.fillColor(scolor);
        ctx.fill();
        ctx.stroke();
    }

    // Body
    ctx.beginPath();

    ctx.arc(0, 0, body_size, -tau5, tau5, false);
    ctx.quadraticCurveTo(0, 20, -15, 8);
    ctx.quadraticCurveTo(-20, 0, -15, -8);
    ctx.quadraticCurveTo(
        0,
        -20,
        comptime vertex[0],
        comptime -vertex[1],
    );

    ctx.closePath();

    ctx.fillColor(fcolor);
    ctx.fill();
    ctx.stroke();

    { // Wrinkles
        ctx.setLineWidth(4);

        inline for (.{ -1, 1 }) |dir| {
            ctx.beginPath();

            ctx.moveTo(12, comptime (15 * dir));
            ctx.quadraticCurveTo(0, comptime (8 * dir), -8, comptime (5 * dir));

            ctx.stroke();

            ctx.beginPath();

            ctx.moveTo(17.4, comptime (6 * dir));
            ctx.quadraticCurveTo(0, comptime (3.2 * dir), -6.2, comptime (2 * dir));

            ctx.stroke();
        }
    }
}

pub const MobShellRenderer = Renderer(MobSuper, false, render, null);

const std = @import("std");
const math = std.math;
const time = std.time;

const Renderer = @import("../Renderer.zig").Renderer;
const skin_darken = @import("../Renderer.zig").skin_darken;
const RenderContext = @import("../Renderer.zig").RenderContext;
const MobSuper = @import("../../Mob.zig").Super;
