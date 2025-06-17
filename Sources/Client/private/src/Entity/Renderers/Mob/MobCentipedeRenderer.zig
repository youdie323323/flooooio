const std = @import("std");
const math = std.math;
const time = std.time;
const Path2D = @import("../../../WebAssembly/Interop/Canvas2D/Path2D.zig");
const Renderer = @import("../Renderer.zig").Renderer;
const darkened_base = @import("../Renderer.zig").darkened_base;
const RenderContext = @import("../Renderer.zig").RenderContext;
const MobSuper = @import("../../Mob.zig").Super;
const MobType = @import("../../../Florr/Native/Entity/EntityType.zig").MobType;

const Color = @import("../../../WebAssembly/Interop/Canvas2D/Color.zig");

var spine: Path2D = undefined;

var body: Path2D = undefined;
var body_stroke: Path2D = undefined;

const spine_count: usize = 10;

const spine_vector_length: f32 = 38.3971;

fn render(rctx: RenderContext(MobSuper)) void {
    @setEvalBranchQuota(100_000);

    const ctx = rctx.ctx;
    const entity = rctx.entity;
    const mob = entity.impl;

    const tcolor = rctx.blendStatusEffects(comptime Color.comptimeFromHexColorCode("#333333"));

    ctx.rotate(entity.angle);

    const scale = entity.size / 40;
    ctx.scale(scale, scale);

    ctx.setLineJoin(.round);
    ctx.setLineCap(.round);

    ctx.setLineWidth(7);

    { // Body balls (lol?)
        ctx.beginPath();

        inline for (.{ -1, 1 }) |dir| ctx.arc(0, 33 * dir, 18, 0, math.tau, false);

        ctx.fillColor(tcolor);
        ctx.fill();
    }

    const fcolor = switch (mob.type.get()) {
        inline @intFromEnum(MobType.centipede) => comptime Color.comptimeFromHexColorCode("#8ac255"),
        inline @intFromEnum(MobType.centipede_desert) => comptime Color.comptimeFromHexColorCode("#d3c66d"),
        inline @intFromEnum(MobType.centipede_evil) => comptime Color.comptimeFromHexColorCode("#8f5db0"),
        inline else => comptime Color.comptimeFromHexColorCode("#ffffff"),
    };
    const scolor = fcolor.darkened(darkened_base);

    // Body
    ctx.beginPath();

    ctx.arc(0, 0, 40, 0, math.tau, false);

    ctx.setLineWidth(8);
    ctx.fillColor(fcolor);
    ctx.strokeColor(scolor);
    ctx.fill();
    ctx.stroke();

    if (mob.is_first_segment) { // Antennas
        const acolor = rctx.blendStatusEffects(comptime Color.comptimeFromHexColorCode("#333333"));

        ctx.setLineWidth(3);
        ctx.fillColor(acolor);
        ctx.strokeColor(acolor);

        inline for (.{ -1, 1 }) |dir| {
            ctx.beginPath();

            ctx.moveTo(25, comptime (10.21 * dir));
            ctx.quadraticCurveTo(47.54, comptime (11.62 * dir), 55.28, comptime (30.63 * dir));

            ctx.stroke();

            ctx.beginPath();

            ctx.arc(55.28, comptime (30.63 * dir), 5, 0, math.tau, false);

            ctx.fill();
        }
    }
}

pub const MobCentipedeRenderer = Renderer(MobSuper, false, render, null);
