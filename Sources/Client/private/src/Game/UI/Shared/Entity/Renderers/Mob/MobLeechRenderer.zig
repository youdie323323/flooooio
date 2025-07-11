const std = @import("std");
const math = std.math;
const time = std.time;
const Renderer = @import("../../Renderers/Renderer.zig").Renderer;
const skin_darken = @import("../../Renderers/Renderer.zig").skin_darken;
const RenderContext = @import("../../Renderers/Renderer.zig").RenderContext;
const Mob = @import("../../Mob.zig");
const MobSuper = Mob.Super;
const Mobs = @import("../../../../../../main.zig").Mobs;
const allocator = @import("../../../../../../Mem.zig").allocator;

const Color = @import("../../../../../Kernel/WebAssembly/Interop/Canvas2D/Color.zig");

const Point = @Vector(2, f32);
const Points = []const Point;

// TODO: somewhere broken and render a leech will panics

/// Collect the segment points from leech.
/// Caller must guarantees lock objects (mobs).
fn collectLeechSegmentPoints(mobs: *Mobs, leech: *const MobSuper, scale: MobSuper.Vector2) !Points {
    var bodies: std.ArrayListUnmanaged(Point) = .{};
    errdefer bodies.deinit(allocator);

    var stack: std.ArrayListUnmanaged(*const MobSuper) = .{};
    defer stack.deinit(allocator);

    try stack.append(allocator, leech);

    while (stack.pop()) |current_leech| {
        try bodies.append(allocator, current_leech.pos / scale);

        if (current_leech.impl.connected_segments) |s| {
            var it = s.keyIterator();

            while (it.next()) |key| {
                const inner_leech = mobs.get(key.*);

                try stack.append(allocator, &inner_leech);
            }
        }
    }

    return bodies.toOwnedSlice(allocator);
}

fn render(rctx: RenderContext(MobSuper)) void {
    @setEvalBranchQuota(10_000);

    const ctx = rctx.ctx;
    const entity = rctx.entity;
    const mob = entity.impl;
    const is_specimen = rctx.is_specimen;
    const mobs = rctx.mobs;

    if (!is_specimen)
        // If this leech is body, do nothing
        if (entity.impl.connecting_segment) |_|
            return;

    const scale = entity.size * comptime (1.0 / 20.0);
    ctx.scale(scale, scale);

    ctx.setLineCap(.round);

    if (is_specimen) {
        ctx.scale(0.5, 0.5);

        { // Beak
            ctx.save();
            defer ctx.restore();

            ctx.translate(-35, -32);
            ctx.rotate(-1.6561946489531953);

            ctx.setLineWidth(4);
            ctx.strokeColor(comptime Color.comptimeFromHexColorCode("#292929"));

            inline for (.{ -1, 1 }) |dir| {
                ctx.beginPath();

                ctx.moveTo(0, comptime (10 * dir));
                ctx.quadraticCurveTo(11, comptime (10 * dir), 22, comptime (5 * dir));

                ctx.stroke();
            }
        }

        {
            ctx.beginPath();

            ctx.rotate(comptime -math.degreesToRadians(135));

            ctx.moveTo(50, 0);
            ctx.quadraticCurveTo(0, -30, -50, 0);

            strokeBodyCurve(rctx);
        }

        return;
    }

    if (entity.impl.is_first_segment) { // Beak
        ctx.save();
        defer ctx.restore();

        // Change angle
        ctx.rotate(entity.angle);

        ctx.strokeColor(rctx.blendEffectColors(comptime Color.comptimeFromHexColorCode("#292929")));
        ctx.setLineWidth(4);

        const beak_angle = mob.calculateBeakAngle(0.1);

        inline for (.{ -1, 1 }) |dir| {
            ctx.beginPath();

            ctx.rotate(
                (beak_angle * dir) +
                    // Add for negative dir
                    if (comptime dir == 1)
                        beak_angle
                    else
                        0,
            );

            ctx.moveTo(0, comptime (10 * dir));
            ctx.quadraticCurveTo(11, comptime (10 * dir), 22, comptime (5 * dir));

            ctx.stroke();
        }
    }

    { // Draw leech bodies include this mob
        // No need to lock since locking before rendering this mob
        // mobs.lock();
        // defer mobs.unlock();

        const bodies =
            collectLeechSegmentPoints(mobs, entity, @splat(scale)) catch return;
        defer allocator.free(bodies);

        const first_body_x, const first_body_y = bodies[0];

        ctx.translate(
            -first_body_x,
            -first_body_y,
        );

        prepareNPointCurve(rctx, bodies);

        strokeBodyCurve(rctx);
    }
}

const one_over_six_vector: Point = @splat(1.0 / 6.0);

fn prepareNPointCurve(rctx: RenderContext(MobSuper), points: Points) void {
    const ctx = rctx.ctx;

    ctx.beginPath();

    if (points.len == 0) return;

    const p_0 = points[0];
    const points_len = points.len;

    const x_p_0, const y_p_0 = p_0;

    if (points_len > 1) {
        ctx.moveTo(x_p_0, y_p_0);

        for (0..points_len - 1) |i| {
            const p_isub1 = if (i >= 1) points[i - 1] else p_0;
            const p_i = points[i];
            const p_iadd1 = points[i + 1];
            const p_iadd2 = if (i != points_len - 2) points[i + 2] else p_iadd1;

            const x_p_iadd1, const y_p_iadd1 = p_iadd1;

            const vector_p_isub1_to_p_iadd1 = p_iadd1 - p_isub1;
            const vector_p_i_to_p_iadd2 = p_iadd2 - p_i;

            const cp1x, const cp1y = p_i + vector_p_isub1_to_p_iadd1 * one_over_six_vector;
            const cp2x, const cp2y = p_iadd1 - vector_p_i_to_p_iadd2 * one_over_six_vector;

            ctx.bezierCurveTo(
                cp1x,
                cp1y,
                cp2x,
                cp2y,
                x_p_iadd1,
                y_p_iadd1,
            );
        }
    } else {
        ctx.arc(x_p_0, y_p_0, 1, 0, math.tau, false);
    }
}

fn strokeBodyCurve(rctx: RenderContext(MobSuper)) void {
    const ctx = rctx.ctx;

    const fcolor = rctx.blendEffectColors(comptime Color.comptimeFromHexColorCode("#333333"));
    const scolor = fcolor.darkened(skin_darken);

    // Body outline
    ctx.setLineWidth(25);
    ctx.strokeColor(scolor);
    ctx.stroke();

    // Body
    ctx.setLineWidth(22);
    ctx.strokeColor(fcolor);
    ctx.stroke();
}

pub const MobLeechRenderer = Renderer(MobSuper, false, render, null);
