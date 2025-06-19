const std = @import("std");
const math = std.math;
const time = std.time;
const Renderer = @import("../../Renderers/Renderer.zig").Renderer;
const skin_darken = @import("../../Renderers/Renderer.zig").skin_darken;
const RenderContext = @import("../../Renderers/Renderer.zig").RenderContext;
const Mob = @import("../../Mob.zig");
const MobSuper = Mob.Super;
const Mobs = @import("../../../main.zig").Mobs;
const allocator = @import("../../../mem.zig").allocator;

const Color = @import("../../../WebAssembly/Interop/Canvas2D/Color.zig");

const Vector2 = @Vector(2, f32);

const body_size: f32 = 25;
const body_size_vector: Vector2 = @splat(body_size);

const LegCurve = struct {
    dir: f32,
    start: Vector2,
    curve: @Vector(4, f32),

    pub fn init(angle: f32, dir: f32, offset: f32) LegCurve {
        const angle_vector: Vector2 = .{ @cos(angle), @sin(angle) };
        const cos_angle, const sin_angle = angle_vector;

        const start = angle_vector * body_size_vector;
        const start_x, const start_y = start;

        return .{
            .dir = dir,
            .start = start,
            .curve = .{
                start_x + 23 * cos_angle + -sin_angle * dir * offset,
                start_y + 23 * sin_angle + cos_angle * dir * offset,
                start_x + 46 * cos_angle,
                start_y + 46 * sin_angle,
            },
        };
    }
};

const leg_curves: [8]LegCurve = .{
    .init((math.pi / 180.0) * 40, -1, 6),
    .init((math.pi / 180.0) * 75, -1, 3),
    .init((math.pi / 180.0) * 105, 1, 3),
    .init((math.pi / 180.0) * 140, 1, 6),

    .init((-math.pi / 180.0) * 40, 1, 6),
    .init((-math.pi / 180.0) * 75, 1, 3),
    .init((-math.pi / 180.0) * 105, -1, 3),
    .init((-math.pi / 180.0) * 140, -1, 6),
};

fn render(rctx: RenderContext(MobSuper)) void {
    const ctx = rctx.ctx;
    const entity = rctx.entity;
    const is_specimen = rctx.is_specimen;

    const fcolor = rctx.blendEffectColors(comptime Color.comptimeFromHexColorCode("#403525"));
    const scolor = fcolor.darkened(skin_darken);

    ctx.rotate(entity.angle);

    const size_fraction: f32 =
        if (is_specimen)
            60
        else
            25;

    const scale = entity.size / size_fraction;
    ctx.scale(scale, scale);

    ctx.setLineCap(.round);

    { // Legs
        ctx.setLineWidth(10);
        ctx.strokeColor(rctx.blendEffectColors(comptime Color.comptimeFromHexColorCode("#323032")));

        const move_counter = entity.move_counter / 1.25;

        inline for (leg_curves, 0..) |lc, i| {
            const dir = comptime lc.dir;
            const start_x, const start_y = comptime lc.start;
            const curve_cpx, const curve_cpy, const curve_x, const curve_y = comptime lc.curve;

            const i_f32: f32 = comptime @floatFromInt(i);

            ctx.save();
            defer ctx.restore();

            ctx.beginPath();

            ctx.rotate(0.2 * @sin(move_counter + i_f32) * dir);

            ctx.moveTo(start_x, start_y);
            ctx.quadraticCurveTo(curve_cpx, curve_cpy, curve_x, curve_y);

            ctx.stroke();
        }
    }

    // Body outline
    ctx.beginPath();

    ctx.arc(0, 0, 35, 0, math.tau, false);

    ctx.fillColor(scolor);
    ctx.fill();

    // Body
    ctx.beginPath();

    ctx.arc(0, 0, body_size, 0, math.tau, false);

    ctx.fillColor(fcolor);
    ctx.fill();
}

pub const MobSpiderRenderer = Renderer(MobSuper, false, render, null);
