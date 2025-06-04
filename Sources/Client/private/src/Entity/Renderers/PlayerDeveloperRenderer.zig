const std = @import("std");
const math = std.math;

const Renderer = @import("../Renderers/Renderer.zig").Renderer;
const RenderingContext = @import("../Renderers/Renderer.zig").RenderingContext;
const PlayerSuper = @import("../Player.zig").Super;

const Color = @import("../../WebAssembly/Interop/Canvas/Color.zig");
const drawDeadEyes = @import("PlayerNormalRenderer.zig").drawDeadEyes;

const developer_left_eye_x = 10;
const developer_left_eye_y = 8;

const developer_right_eye_x = -10;
const developer_right_eye_y = -8;

fn drawEyeOutline(
    rctx: RenderingContext(PlayerSuper),
    comptime offset: f32,
) void {
    const ctx = rctx.ctx;

    ctx.beginPath();

    ctx.ellipse(developer_left_eye_x, developer_left_eye_y, offset + 2.4, offset + 5.6, -0.1, 0, math.tau, false);
    ctx.moveTo(-8, -5);
    ctx.ellipse(developer_right_eye_x, developer_right_eye_y, offset + 2.4, offset + 5.6, -0.1, 0, math.tau, false);

    ctx.fillColor(comptime Color.comptimeFromHexColorCode("#000000"));
    ctx.fill();
}

fn render(rctx: RenderingContext(PlayerSuper)) void {
    const ctx = rctx.ctx;
    const entity = rctx.entity;
    const player = entity.impl;

    ctx.@"lineCap = 'round'"();
    ctx.@"lineJoin = 'round'"();

    { // Body
        ctx.beginPath();

        const start_x = 25;
        const start_y = -0.5;

        ctx.moveTo(start_x, start_y);

        ctx.quadraticCurveTo(19, 35, 4, 25.5);

        ctx.quadraticCurveTo(-20, 18, -22, 5);
        ctx.quadraticCurveTo(-25, -32, 0, -22);

        ctx.quadraticCurveTo(15, -24, start_x, start_y);

        ctx.closePath();

        ctx.@"lineWidth ="(3);
        ctx.fillColor(PlayerDeveloperRenderer.blendStatusEffects(rctx, comptime Color.comptimeFromHexColorCode("#ffe763")));
        ctx.strokeColor(PlayerDeveloperRenderer.blendStatusEffects(rctx, comptime Color.comptimeFromHexColorCode("#cfbb50")));
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

            ctx.arc(9 + eye_x * 2, 8 + 3.5 * eye_y, 2.8, 0, math.tau, false);
            ctx.moveTo(-8, -5);
            ctx.arc(-9 + -2 * eye_x, -8 + -3.5 * eye_y, 2.8, 0, math.tau, false);

            ctx.fillColor(comptime Color.comptimeFromHexColorCode("#eeeeee"));
            ctx.fill();
        }
    }

    {
        const vertic_rise = 5.5 - 10.5 * player.angry_t - 9 * player.sad_t;

        ctx.beginPath();

        ctx.translate(-7, 8);
        ctx.rotate((35 * math.pi) / 180.0);

        ctx.moveTo(-3, 0);
        ctx.quadraticCurveTo(0, vertic_rise, 3, 0);

        ctx.@"lineWidth ="(1.5);
        ctx.strokeColor(comptime Color.comptimeFromHexColorCode("#000000"));
        ctx.stroke();
    }
}

pub const PlayerDeveloperRenderer = Renderer(PlayerSuper, false, render, null);
