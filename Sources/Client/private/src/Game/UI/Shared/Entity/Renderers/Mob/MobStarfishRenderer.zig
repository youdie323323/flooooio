pub const leg_amount: comptime_int = 5;
pub const leg_amount_f32: comptime_float = @floatFromInt(leg_amount);

pub const undestroyed_leg_distance: comptime_float = 30.0;
pub const destroyed_leg_distance: comptime_float = undestroyed_leg_distance / 2.0;

const distance_lerp_factor: comptime_float = 0.2;

const spots_per_leg: comptime_int = 3;
const spots_per_leg_f32: comptime_float = @floatFromInt(spots_per_leg);

/// Solving arccos(1.963525414466858 / x) = π / 5 for x will lead to 2.426877872787264.
const leg_valley_depth_between: comptime_float = 2.426877872787264;

const leg_angles = blk: {
    var angles: [leg_amount][4]f32 = undefined;

    for (0..leg_amount) |i| {
        const i_f32: f32 = @floatFromInt(i);

        const mid_angle = (i_f32 + 0.5) / leg_amount_f32 * math.tau;
        const end_angle = (i_f32 + 1) / leg_amount_f32 * math.tau;

        angles[i] = .{
            @cos(mid_angle) * leg_valley_depth_between,
            @sin(mid_angle) * leg_valley_depth_between,
            @cos(end_angle),
            @sin(end_angle),
        };
    }

    break :blk angles;
};

const spot_angles = blk: {
    const Vector2 = @Vector(2, f32);

    var angles: [leg_amount][spots_per_leg]Vector2 = undefined;

    for (0..leg_amount) |i| {
        const i_f32: f32 = @floatFromInt(i);

        const leg_rotation = i_f32 / leg_amount_f32 * math.tau;
        const leg_rotation_vector: Vector2 = .{
            @cos(leg_rotation),
            @sin(leg_rotation),
        };

        var spot_pos: f32 = 25;

        for (0..spots_per_leg) |j| {
            angles[i][j] = leg_rotation_vector * @as(Vector2, @splat(spot_pos));

            switch (j) {
                0 => spot_pos -= 7,
                1 => spot_pos -= 9,
                else => {},
            }
        }
    }

    break :blk angles;
};

fn render(rctx: *RenderContext(MobSuper)) void {
    const ctx = rctx.ctx;
    const entity = rctx.entity;
    const mob = &entity.impl;
    const is_specimen = rctx.is_specimen;

    const leg_distances = &(mob.leg_distances.?);

    const fcolor = rctx.blendEffectColors(comptime .comptimeFromHexColorCode("#D14F4D"));
    const scolor = fcolor.darkened(skin_darken);

    ctx.rotate(entity.angle);

    const scale = entity.size * comptime (1.0 / 25.0);
    ctx.scale(scale, scale);

    const rotation =
        mob.total_t * 0.2;

    ctx.rotate(rotation);

    const remaining_leg_amount: u3 =
        if (is_specimen)
            leg_amount
        else
            (if (entity.is_dead)
                0
            else
                @intFromFloat(@floor(
                    // Use pure health value (0 ~ 1)
                    entity.next_health * leg_amount_f32,
                )));

    ctx.beginPath();

    inline for (leg_angles, 0..leg_amount) |leg_angle, i| {
        const to: f32 =
            if (remaining_leg_amount > i)
                undestroyed_leg_distance
            else
                destroyed_leg_distance;

        const old_distance = leg_distances[i];

        const distance = math.lerp(old_distance, to, distance_lerp_factor);

        leg_distances[i] = distance;

        if (comptime (i == 0))
            ctx.moveTo(leg_distances[comptime (leg_amount - 1)], 0);

        const mid_cos, const mid_sin, const end_cos, const end_sin = leg_angle;

        const end_cos_dynamic = end_cos * distance;
        const end_sin_dynamic = end_sin * distance;

        ctx.quadraticCurveTo(
            mid_cos,
            mid_sin,
            end_cos_dynamic,
            end_sin_dynamic,
        );

        if (comptime (i != (leg_amount - 1)))
            ctx.lineTo(end_cos_dynamic, end_sin_dynamic);
    }

    ctx.setLineJoin(.round);
    ctx.setLineCap(.round);

    // Body outline
    ctx.setLineWidth(10);
    ctx.strokeColor(scolor);
    ctx.stroke();

    // Body
    ctx.setLineWidth(5);
    ctx.fillColor(fcolor);
    ctx.strokeColor(fcolor);
    ctx.fill();
    ctx.stroke();

    { // Balls
        ctx.fillColor(rctx.blendEffectColors(comptime .comptimeFromHexColorCode("#D4766C")));

        inline for (0..leg_amount) |i| {
            const spot_angle = comptime spot_angles[i];

            const i_isize: isize = comptime @intCast(i);
            const i_isize_sub_1 = i_isize - 1;

            // This is similar to i_isize mod (leg_amount - 1) but supports minus index
            const leg_distance_i =
                comptime if (i_isize_sub_1 == -1)
                    leg_amount - 1
                else
                    i_isize_sub_1;

            const distance = leg_distances[leg_distance_i];
            const distance_ratio = distance / undestroyed_leg_distance;

            // Leaching 2 only possible when distance_ratio is 0.5, but distance
            // never be destroyed_leg_distance since lerped, so add 0.5 to spots_per_leg
            const spots_reduce: usize = @intFromFloat(@round((1 - distance_ratio) * comptime (spots_per_leg + 0.5)));

            for (0..spots_per_leg) |j| {
                if (spots_reduce > j) continue;

                const spot_size: f32 = @floatFromInt(j + 2);

                const spot_x, const spot_y = spot_angle[j];

                ctx.beginPath();

                ctx.arc(spot_x, spot_y, spot_size, 0, math.tau, false);

                ctx.fill();
            }
        }
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
