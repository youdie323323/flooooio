const std = @import("std");
const math = std.math;
const time = std.time;
const Renderer = @import("../../Renderers/Renderer.zig").Renderer;
const darkened_base = @import("../../Renderers/Renderer.zig").darkened_base;
const RenderContext = @import("../../Renderers/Renderer.zig").RenderContext;
const Mob = @import("../../Mob.zig");
const MobSuper = Mob.Super;
const Mobs = @import("../../../main.zig").Mobs;
const allocator = @import("../../../mem.zig").allocator;

const Color = @import("../../../WebAssembly/Interop/Canvas2D/Color.zig");

const Point = @Vector(2, f32);
const Points = []const Point;

// TODO: somewhere broken and rendering a leech will panics

fn collectLeechSegmentPoints(mobs: *Mobs, leech: *MobSuper, scale: MobSuper.Vector2) !Points {
    var bodies = std.ArrayList(Point).init(allocator);
    errdefer bodies.deinit();

    try bodies.append(leech.pos / scale);

    if (leech.impl.connected_segments) |s| {
        // Iterate over connected segments
        var it = s.keyIterator();

        while (it.next()) |key| {
            var mob = mobs.getValue(key.*);

            // Recursively get linked bodies and append them
            const linked_bodies = try collectLeechSegmentPoints(mobs, &mob, scale);

            try bodies.appendSlice(linked_bodies);

            // Free the slice returned by the recursive call, as it's now copied
            allocator.free(linked_bodies);
        }
    }

    return bodies.toOwnedSlice();
}

fn render(rctx: RenderContext(MobSuper)) void {
    @setEvalBranchQuota(10_000);

    const ctx = rctx.ctx;
    const entity = rctx.entity;
    const mob = entity.impl;
    const is_specimen = rctx.is_specimen;
    const mobs = rctx.mobs;

    if (!is_specimen)
        if (entity.impl.connecting_segment) |_|
            return;

    ctx.rotate(entity.angle);

    const scale = entity.size / 20;
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

            { // Upper beak
                ctx.beginPath();

                ctx.moveTo(0, 10);
                ctx.quadraticCurveTo(11, 10, 22, 5);

                ctx.stroke();
            }

            { // Lower beak
                ctx.beginPath();

                ctx.moveTo(0, -10);
                ctx.quadraticCurveTo(11, -10, 22, -5);

                ctx.stroke();
            }
        }

        {
            ctx.beginPath();

            ctx.rotate(-2.356194599949769);

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

        const beak_angle = mob.calculateBeakAngle();

        { // Upper beak
            ctx.beginPath();

            ctx.rotate(beak_angle);

            ctx.moveTo(0, 10);
            ctx.quadraticCurveTo(11, 10, 22, 5);

            ctx.stroke();
        }

        { // Lower beak
            ctx.beginPath();

            ctx.rotate(-beak_angle * 2);

            ctx.moveTo(0, -10);
            ctx.quadraticCurveTo(11, -10, 22, -5);

            ctx.stroke();
        }
    }

    {
        const bodies =
            collectLeechSegmentPoints(mobs, entity, @splat(scale)) catch unreachable;

        const first_body_x, const first_body_y = bodies[0];

        ctx.translate(
            -first_body_x,
            -first_body_y,
        );

        prepareNPointCurve(rctx, bodies);

        strokeBodyCurve(rctx);
    }
}

inline fn prepareNPointCurve(rctx: RenderContext(MobSuper), points: Points) void {
    const ctx = rctx.ctx;

    ctx.beginPath();

    if (points.len == 0) return;

    const first_point = points[0];
    const len_points = points.len;

    const first_point_x, const first_point_y = first_point;

    if (len_points > 1) {
        ctx.moveTo(first_point_x, first_point_y);

        for (0..len_points - 1) |i| {
            const p0 = if (i >= 1) points[i - 1] else first_point;
            const p1 = points[i];
            const p2 = points[i + 1];
            const p3 = if (i != len_points - 2) points[i + 2] else p2;

            const p0_x, const p0_y = p0;
            const p1_x, const p1_y = p1;
            const p2_x, const p2_y = p2;
            const p3_x, const p3_y = p3;

            const cp1x = p1_x + (p2_x - p0_x) / 6;
            const cp1y = p1_y + (p2_y - p0_y) / 6;

            const cp2x = p2_x - (p3_x - p1_x) / 6;
            const cp2y = p2_y - (p3_y - p1_y) / 6;

            ctx.bezierCurveTo(
                cp1x,
                cp1y,
                cp2x,
                cp2y,
                p2_x,
                p2_y,
            );
        }
    } else {
        ctx.arc(first_point_x, first_point_y, 1, 0, math.tau, false);
    }
}

inline fn strokeBodyCurve(rctx: RenderContext(MobSuper)) void {
    const ctx = rctx.ctx;

    // Body outline
    ctx.setLineWidth(25);
    ctx.strokeColor(rctx.blendEffectColors(comptime Color.comptimeFromHexColorCode("#292929")));
    ctx.stroke();

    // Body
    ctx.setLineWidth(22);
    ctx.strokeColor(rctx.blendEffectColors(comptime Color.comptimeFromHexColorCode("#333333")));
    ctx.stroke();
}

pub const MobLeechRenderer = Renderer(MobSuper, false, render, null);
