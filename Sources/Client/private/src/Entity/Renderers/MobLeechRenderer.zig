const std = @import("std");
const math = std.math;
const time = std.time;
const Renderer = @import("../Renderers/Renderer.zig").Renderer;
const darkened_base = @import("../Renderers/Renderer.zig").darkened_base;
const RenderingContext = @import("../Renderers/Renderer.zig").RenderingContext;
const Mob = @import("../Mob.zig");
const MobSuper = Mob.Super;
const Mobs = @import("../../main.zig").Mobs;
const allocator = @import("../../mem.zig").allocator;

const Color = @import("../../WebAssembly/Interop/Canvas2D/Color.zig");

const Point = @Vector(2, f32);
const Points = []const Point;

fn collectLeechSegmentPoints(mobs: *Mobs, leech: *MobSuper, scale: MobSuper.Vector2) !Points {
    var bodies = std.ArrayList(Point).init(allocator);
    errdefer bodies.deinit();

    try bodies.append(
        leech.pos /
            scale,
    );

    // Iterate over connected segments
    var it = leech.impl.connected_segments.keyIterator();

    while (it.next()) |key| {
        var mob = mobs.getValue(key.*);

        // Recursively get linked bodies and append them
        const linked_bodies = try collectLeechSegmentPoints(mobs, &mob, scale);

        try bodies.appendSlice(linked_bodies);

        // Free the slice returned by the recursive call, as it's now copied
        allocator.free(linked_bodies);
    }

    return bodies.toOwnedSlice();
}

fn render(rctx: RenderingContext(MobSuper)) void {
    const ctx = rctx.ctx;
    const entity = rctx.entity;
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
        const beak_angle = entity.calculateBeakAngle();

        ctx.save();
        defer ctx.restore();

        // Change angle
        ctx.rotate(entity.angle);

        ctx.strokeColor(MobLeechRenderer.blendStatusEffects(rctx, comptime Color.comptimeFromHexColorCode("#292929")));
        ctx.setLineWidth(4);

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

        const first_body: Point = bodies[0];

        const first_body_x, const first_body_y = first_body;

        ctx.translate(
            -first_body_x,
            -first_body_y,
        );

        prepareNPointSmoothCurve(rctx, bodies);

        strokeBodyCurve(rctx);
    }
}

fn prepareNPointSmoothCurve(rctx: RenderingContext(MobSuper), points: Points) void {
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

            const p0x, const p0y = p0;
            const p1x, const p1y = p1;
            const p2x, const p2y = p2;
            const p3x, const p3y = p3;

            const cp1x = p1x + (p2x - p0x) / 6;
            const cp1y = p1y + (p2y - p0y) / 6;

            const cp2x = p2x - (p3x - p1x) / 6;
            const cp2y = p2y - (p3y - p1y) / 6;

            ctx.bezierCurveTo(
                cp1x,
                cp1y,
                cp2x,
                cp2y,
                p2x,
                p2y,
            );
        }
    } else {
        ctx.arc(first_point_x, first_point_y, 1, 0, math.tau, false);
    }
}

fn strokeBodyCurve(rctx: RenderingContext(MobSuper)) void {
    const ctx = rctx.ctx;

    // Body stroke
    ctx.setLineWidth(25);
    ctx.strokeColor(MobLeechRenderer.blendStatusEffects(rctx, comptime Color.comptimeFromHexColorCode("#292929")));
    ctx.stroke();

    // Body
    ctx.setLineWidth(22);
    ctx.strokeColor(MobLeechRenderer.blendStatusEffects(rctx, comptime Color.comptimeFromHexColorCode("#333333")));
    ctx.stroke();
}

pub const MobLeechRenderer = Renderer(MobSuper, false, render, null);
