const dead_eye_length: comptime_float = 4;

pub fn drawDeadEyes(
    rctx: RenderContext(PlayerSuper),
    comptime eye_x: comptime_float,
    comptime eye_y: comptime_float,
) void {
    const ctx = rctx.ctx;

    ctx.beginPath();

    ctx.moveTo(eye_x - dead_eye_length, eye_y - dead_eye_length);
    ctx.lineTo(eye_x + dead_eye_length, eye_y + dead_eye_length);
    ctx.moveTo(eye_x + dead_eye_length, eye_y - dead_eye_length);
    ctx.lineTo(eye_x - dead_eye_length, eye_y + dead_eye_length);

    ctx.setLineWidth(3);
    ctx.strokeColor(comptime Color.comptimeFromHexColorCode("#000000"));
    ctx.stroke();
}

fn drawEyeShape(
    rctx: RenderContext(PlayerSuper),
    comptime center_x: comptime_float,
    comptime center_y: comptime_float,
    comptime width_radius: comptime_float,
    comptime height_radius: comptime_float,
    anger_offset: f32,
    comptime flag: bool,
) void {
    const ctx = rctx.ctx;

    const flag_u1: comptime_int = comptime @intFromBool(flag);

    const flag_f32: comptime_float = comptime @floatFromInt(flag_u1);
    const flipped_flag: comptime_float = comptime @floatFromInt(flag_u1 ^ 1);

    ctx.moveTo(center_x - width_radius, center_y - height_radius + flag_f32 * anger_offset);
    ctx.lineTo(center_x + width_radius, center_y - height_radius + flipped_flag * anger_offset + flag_f32);
    ctx.lineTo(center_x + width_radius, center_y + height_radius);
    ctx.lineTo(center_x - width_radius, center_y + height_radius);
    ctx.lineTo(center_x - width_radius, center_y - height_radius);
}

const normal_left_eye_x: comptime_float = 7;
const normal_left_eye_y: comptime_float = -5;

const normal_right_eye_x: comptime_float = -7;
const normal_right_eye_y: comptime_float = -5;

fn drawEyeOutline(
    rctx: RenderContext(PlayerSuper),
    comptime offset: comptime_float,
) void {
    const ctx = rctx.ctx;

    ctx.beginPath();

    ctx.ellipse(normal_left_eye_x, normal_left_eye_y, offset + 2.4, offset + 5.6, 0, 0, math.tau, false);
    ctx.moveTo(-7, -5);
    ctx.ellipse(normal_right_eye_x, normal_right_eye_y, offset + 2.4, offset + 5.6, 0, 0, math.tau, false);

    ctx.fillColor(comptime Color.comptimeFromHexColorCode("#000000"));
    ctx.fill();
}

fn render(rctx: RenderContext(PlayerSuper)) void {
    const ctx = rctx.ctx;
    const entity = rctx.entity;
    const player = entity.impl;

    const fcolor = rctx.blendEffectColors(comptime Color.comptimeFromHexColorCode("#ffe763"));
    const scolor = fcolor.darkened(skin_darken);

    ctx.setLineCap(.round);

    { // Body
        ctx.beginPath();

        ctx.arc(0, 0, 25, 0, math.tau, false);

        ctx.setLineWidth(2.75);
        ctx.fillColor(fcolor);
        ctx.strokeColor(scolor);
        ctx.fill();
        ctx.stroke();
    }

    if (entity.is_dead) {
        drawDeadEyes(rctx, normal_left_eye_x, normal_left_eye_y);
        drawDeadEyes(rctx, normal_right_eye_x, normal_right_eye_y);
    } else {
        ctx.save();
        defer ctx.restore();

        const anger_offset = 6 * player.angry_t;

        drawEyeShape(rctx, 7, -5, 6, 7.3, anger_offset, true);
        drawEyeShape(rctx, 7, -5, 6, 7.3, anger_offset, false);

        ctx.clip();

        drawEyeOutline(rctx, 0.9);
        drawEyeOutline(rctx, 0);

        ctx.clip();

        { // Draw pupil
            const eye_x, const eye_y = entity.eye_pos;

            ctx.beginPath();

            ctx.arc(normal_left_eye_x + eye_x * 2, normal_left_eye_y + eye_y * 3.5, 3.1, 0, math.tau, false);
            ctx.moveTo(-7, -5);
            ctx.arc(normal_right_eye_x + eye_x * 2, normal_right_eye_y + eye_y * 3.5, 3.1, 0, math.tau, false);

            ctx.fillColor(comptime Color.comptimeFromHexColorCode("#eeeeee"));
            ctx.fill();
        }
    }

    {
        const vertic_rise = 5.5 - 10.5 * player.angry_t - 9 * player.sad_t;

        ctx.beginPath();

        ctx.translate(0, 9.7);

        ctx.moveTo(-6.1, 0);
        ctx.quadraticCurveTo(0, vertic_rise, 6.1, 0);

        ctx.setLineWidth(1.5);
        ctx.strokeColor(comptime Color.comptimeFromHexColorCode("#000000"));
        ctx.stroke();
    }
}

pub const PlayerNormalRenderer = Renderer(PlayerSuper, false, render, null);

const std = @import("std");
const math = std.math;

const Renderer = @import("../Renderer.zig").Renderer;
const RenderContext = @import("../Renderer.zig").RenderContext;
const PlayerSuper = @import("../../Player.zig").Super;
const skin_darken = @import("../Renderer.zig").skin_darken;

const Color = @import("../../../../../Kernel/WebAssembly/Interop/Canvas2D/Color.zig");
