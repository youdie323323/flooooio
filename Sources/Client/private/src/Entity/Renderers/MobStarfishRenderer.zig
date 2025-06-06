const std = @import("std");
const math = std.math;
const time = std.time;
const Renderer = @import("../Renderers/Renderer.zig").Renderer;
const darkened_base = @import("../Renderers/Renderer.zig").darkened_base;
const RenderingContext = @import("../Renderers/Renderer.zig").RenderingContext;
const MobSuper = @import("../Mob.zig").Super;

const Color = @import("../../WebAssembly/Interop/Canvas2D/Color.zig");

pub const leg_amount: usize = 5;

pub const destroyed_leg_distance: f32 = 100.0;
pub const undestroyed_leg_distance: f32 = 175.0;

const distance_lerp_factor: f32 = 0.2;

const spots_per_leg: usize = 3;
const spots_per_leg_f32: f32 = @floatFromInt(spots_per_leg);

const epsilon: f32 = 0.9999;

const leg_angles = blk: {
    var angles: [leg_amount][4]f32 = undefined;

    for (0..leg_amount) |i| {
        const i_f32: f32 = @floatFromInt(i);
        const mid_angle: f32 = (i_f32 + 0.5) / leg_amount * math.tau;
        const end_angle: f32 = (i_f32 + 1) / leg_amount * math.tau;

        angles[i] = .{
            @cos(mid_angle) * 15,
            @sin(mid_angle) * 15,
            @cos(end_angle),
            @sin(end_angle),
        };
    }

    break :blk angles;
};

fn render(rctx: RenderingContext(MobSuper)) void {
    const ctx = rctx.ctx;
    const entity = rctx.entity;
    const mob = entity.impl;
    const is_specimen = rctx.is_specimen;

    var leg_distances = mob.leg_distances.?;

    ctx.rotate(entity.angle);

    const scale = entity.size / 120;
    ctx.scale(scale, scale);

    const rotation =
        @mod(
            @as(f32, @floatFromInt(
                if (is_specimen)
                    2000
                else
                    time.milliTimestamp(),
            )) / 2000,
            math.tau,
        ) + entity.move_counter * 0.4;

    ctx.rotate(rotation);

    const remaining_leg_amount =
        if (is_specimen)
            leg_amount
        else
            (if (entity.is_dead)
                0
            else
                @round(
                    // Use pure health value (0 ~ 1)
                    entity.next_health * leg_amount,
                ));

    ctx.beginPath();

    inline for (0..leg_amount) |i| {
        const old_distance = leg_distances[i];

        const to =
            if (i < remaining_leg_amount)
                undestroyed_leg_distance
            else
                destroyed_leg_distance;

        const distance = old_distance + (to - old_distance) * distance_lerp_factor;

        leg_distances[i] = distance;

        if (i == 0) ctx.moveTo(distance, 0);

        const mid_cos, const mid_sin, const end_cos, const end_sin = leg_angles[i];

        ctx.quadraticCurveTo(
            mid_cos,
            mid_sin,
            end_cos * distance,
            end_sin * distance,
        );
    }

    ctx.setLineJoin(.round);
    ctx.setLineCap(.round);

    const starfish_skin_color = MobStarfishRenderer.blendStatusEffects(rctx, comptime Color.comptimeFromHexColorCode("#d0504e"));

    ctx.setLineWidth(52);
    ctx.strokeColor(starfish_skin_color.darkened(darkened_base));
    ctx.stroke();

    ctx.setLineWidth(26);
    ctx.fillColor(starfish_skin_color);
    ctx.strokeColor(starfish_skin_color);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();

    inline for (0..leg_amount) |i| {
        const i_f32: f32 = comptime @floatFromInt(i);

        const leg_rotation = comptime (i_f32 / leg_amount * math.tau);

        const distance = leg_distances[i];

        const length_ratio = distance / undestroyed_leg_distance;

        const num_spots =
            if (length_ratio > epsilon)
                spots_per_leg
            else
                1;

        ctx.save();

        ctx.rotate(leg_rotation);

        var spot_pos: f32 = 52;

        for (0..num_spots) |j| {
            const j_f32: f32 = @floatFromInt(j);

            const spot_size = (1 - j_f32 / spots_per_leg_f32 * 0.8) * 24;

            ctx.moveTo(spot_pos, 0);
            ctx.arc(spot_pos, 0, spot_size, 0, math.tau, false);

            spot_pos += spot_size * 2 + length_ratio * 5;
        }

        ctx.restore();
    }

    ctx.fillColor(MobStarfishRenderer.blendStatusEffects(rctx, comptime Color.comptimeFromHexColorCode("#d3756b")));
    ctx.fill();
}

pub const MobStarfishRenderer = Renderer(MobSuper, false, render, null);
