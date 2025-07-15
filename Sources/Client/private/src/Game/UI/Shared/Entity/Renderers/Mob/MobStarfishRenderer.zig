pub const leg_amount: comptime_int = 5;
pub const leg_amount_f32: comptime_float = @floatFromInt(leg_amount);

pub const destroyed_leg_distance: comptime_float = 100.0;
pub const undestroyed_leg_distance: comptime_float = 175.0;

const distance_lerp_factor: comptime_float = 0.2;

const spots_per_leg: comptime_int = 3;
const spots_per_leg_f32: comptime_float = @floatFromInt(spots_per_leg);

const epsilon: comptime_float = 0.9999;

const leg_angles = blk: {
    var angles: [leg_amount][4]f32 = undefined;

    for (0..leg_amount) |i| {
        const i_f32: f32 = @floatFromInt(i);

        const mid_angle = (i_f32 + 0.5) / leg_amount_f32 * math.tau;
        const end_angle = (i_f32 + 1) / leg_amount_f32 * math.tau;

        angles[i] = .{
            @cos(mid_angle) * 15,
            @sin(mid_angle) * 15,
            @cos(end_angle),
            @sin(end_angle),
        };
    }

    break :blk angles;
};

fn render(rctx: RenderContext(MobSuper)) void {
    const ctx = rctx.ctx;
    const entity = rctx.entity;
    const mob = entity.impl;
    const is_specimen = rctx.is_specimen;

    var leg_distances = mob.leg_distances.?;

    const fcolor = rctx.blendEffectColors(comptime Color.comptimeFromHexColorCode("#d0504e"));
    const scolor = fcolor.darkened(skin_darken);

    ctx.rotate(entity.angle);

    const scale = entity.size * comptime (1.0 / 120.0);
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
        const mid_cos, const mid_sin, const end_cos, const end_sin = comptime leg_angles[i];

        const old_distance = leg_distances[i];

        const to: f32 =
            if (i < remaining_leg_amount)
                undestroyed_leg_distance
            else
                destroyed_leg_distance;

        const distance = old_distance + (to - old_distance) * distance_lerp_factor;

        leg_distances[i] = distance;

        if (comptime (i == 0)) ctx.moveTo(distance, 0);

        ctx.quadraticCurveTo(
            mid_cos,
            mid_sin,
            end_cos * distance,
            end_sin * distance,
        );
    }

    ctx.setLineJoin(.round);
    ctx.setLineCap(.round);

    // Body outline
    ctx.setLineWidth(52);
    ctx.strokeColor(scolor);
    ctx.stroke();

    // Body
    ctx.setLineWidth(26);
    ctx.fillColor(fcolor);
    ctx.strokeColor(fcolor);
    ctx.fill();
    ctx.stroke();

    {
        ctx.beginPath();

        inline for (0..leg_amount) |i| {
            const i_f32: comptime_float = comptime @floatFromInt(i);

            const leg_rotation: comptime_float = comptime (math.tau * i_f32 / leg_amount_f32);

            const distance = leg_distances[i];

            const length_ratio = distance / undestroyed_leg_distance;

            const num_spots: u2 =
                if (length_ratio > epsilon)
                    spots_per_leg
                else
                    1;

            ctx.save();
            defer ctx.restore();

            ctx.rotate(leg_rotation);

            var spot_pos: f32 = 52;

            for (0..num_spots) |j| {
                const j_f32: f32 = @floatFromInt(j);

                const spot_size = (1 - j_f32 / spots_per_leg_f32 * 0.8) * 24;

                ctx.moveTo(spot_pos, 0);
                ctx.arc(spot_pos, 0, spot_size, 0, math.tau, false);

                spot_pos += spot_size * 2 + length_ratio * 5;
            }
        }

        ctx.fillColor(rctx.blendEffectColors(comptime Color.comptimeFromHexColorCode("#d3756b")));
        ctx.fill();
    }
}

pub const MobStarfishRenderer = Renderer(MobSuper, false, render, null);

const std = @import("std");
const math = std.math;
const time = std.time;

const Renderer = @import("../Renderer.zig").Renderer;
const skin_darken = @import("../Renderer.zig").skin_darken;
const RenderContext = @import("../Renderer.zig").RenderContext;
const MobSuper = @import("../../Mob.zig").Super;

const Color = @import("../../../../../Kernel/WebAssembly/Interop/Canvas2D/Color.zig");
