const body_x: comptime_float = 25;
const body_y: comptime_float = -0.5;

const developer_left_eye_x: comptime_float = 10;
const developer_left_eye_y: comptime_float = 8;

const developer_right_eye_x: comptime_float = -10;
const developer_right_eye_y: comptime_float = -8;

fn drawEyeOutline(
    rctx: *RenderContext(PlayerSuper),
    comptime offset: comptime_float,
) void {
    const ctx = rctx.ctx;

    ctx.beginPath();

    ctx.ellipse(developer_left_eye_x, developer_left_eye_y, comptime (offset + 2.4), comptime (offset + 5.6), -0.1, 0, math.tau, false);
    ctx.moveTo(-8, -5);
    ctx.ellipse(developer_right_eye_x, developer_right_eye_y, comptime (offset + 2.4), comptime (offset + 5.6), -0.1, 0, math.tau, false);

    ctx.fillColor(comptime .comptimeFromHex(0x000000));
    ctx.fill();
}

fn render(rctx: *RenderContext(PlayerSuper)) void {
    const ctx = rctx.ctx;
    const entity = rctx.entity;
    const player = &entity.impl;

    const fcolor = rctx.blendEffectColors(comptime .comptimeFromHex(0xFFE763));
    const scolor = fcolor.darkened(skin_darken);

    ctx.setLineJoin(.round);
    ctx.setLineCap(.round);

    { // Body
        ctx.beginPath();

        ctx.moveTo(body_x, body_y);

        ctx.quadraticCurveTo(19, 35, 4, 25.5);

        ctx.quadraticCurveTo(-20, 18, -22, 5);
        ctx.quadraticCurveTo(-25, -32, 0, -22);

        ctx.quadraticCurveTo(15, -24, body_x, body_y);

        ctx.closePath();

        ctx.setLineWidth(3);
        ctx.fillColor(fcolor);
        ctx.strokeColor(scolor);
        ctx.fill();
        ctx.stroke();
    }

    if (entity.is_dead) {
        drawDeadEyes(rctx, developer_left_eye_x, developer_left_eye_y);
        drawDeadEyes(rctx, developer_right_eye_x, developer_right_eye_y);
    } else {
        ctx.save();
        defer ctx.restore();

        ctx.beginPath();

        drawEyeOutline(rctx, 0.9);
        drawEyeOutline(rctx, 0);

        ctx.clip();

        { // Draw pupil
            const eye_x, const eye_y = entity.eye_pos;

            ctx.beginPath();

            ctx.arc(developer_left_eye_x + 2 * eye_x, developer_left_eye_y + 3.5 * eye_y, 2.8, 0, math.tau, false);
            ctx.moveTo(-8, -5);
            ctx.arc(developer_right_eye_x - 2 * eye_x, developer_right_eye_y + -3.5 * eye_y, 2.8, 0, math.tau, false);

            ctx.fillColor(comptime .comptimeFromHex(0xEEEEEE));
            ctx.fill();
        }
    }

    {
        const vertic_rise = 5.5 - 10.5 * player.angry_t - 9 * player.sad_t;

        ctx.beginPath();

        ctx.translate(-7, 8);
        ctx.rotate(comptime math.degreesToRadians(35));

        ctx.moveTo(-3, 0);
        ctx.quadraticCurveTo(0, vertic_rise, 3, 0);

        ctx.setLineWidth(1.5);
        ctx.strokeColor(comptime .comptimeFromHex(0x000000));
        ctx.stroke();
    }
}

pub const PlayerDeveloperRenderer = Renderer(PlayerSuper, false, render, null);

const std = @import("std");
const math = std.math;
const Renderer = @import("../Renderer.zig").Renderer;
const RenderContext = @import("../Renderer.zig").RenderContext;
const PlayerSuper = @import("../../Player.zig").Super;

const skin_darken = @import("../Renderer.zig").skin_darken;

const drawDeadEyes = @import("PlayerNormalRenderer.zig").drawDeadEyes;
