const pi4 = math.pi / 4.0;

fn render(rctx: *RenderContext(MobSuper)) void {
    const ctx = rctx.ctx;
    const entity = rctx.entity;
    const mob = &entity.impl;
    const is_specimen = rctx.is_specimen;

    const rotation =
        if (is_specimen)
            0
        else
            5 * mob.total_t;

    const fcolor = rctx.blendEffectColors(
        if (mob.is_pet)
            comptime .comptimeFromHex(0xd4a6a7)
        else
            comptime .comptimeFromHex(0xe9d683),
    );
    const scolor = fcolor.darkened(skin_darken);
    const acolor = scolor.darkened(skin_darken);

    // ctx.rotate(entity.angle);

    const scale = entity.size * comptime (1.0 / 20.0);
    ctx.scale(scale, scale);

    ctx.setLineJoin(.round);
    ctx.setLineWidth(6);

    {
        ctx.save();
        defer ctx.restore();

        ctx.rotate(rotation * 0.02);

        ctx.rotate(pi4);
        ctx.scale(-0.95, 0.95);

        ctx.beginPath();

        ctx.moveTo(28, 0);
        ctx.lineTo(14, 24.24871253967285);
        ctx.lineTo(-14, 24.24871063232422);
        ctx.lineTo(-28, 0);
        ctx.lineTo(-14, -24.24871253967285);
        ctx.lineTo(14, -24.24871253967285);

        ctx.closePath();

        ctx.fillColor(fcolor);
        ctx.strokeColor(fcolor);
        ctx.fill();
        ctx.stroke();
    }

    {
        ctx.save();
        defer ctx.restore();

        ctx.rotate(rotation * -0.03);

        ctx.beginPath();

        ctx.moveTo(18, 0);
        ctx.lineTo(9, 15.588458061218262);
        ctx.lineTo(-9, 15.588457107543945);
        ctx.lineTo(-18, 0);
        ctx.lineTo(-9, -15.588458061218262);
        ctx.lineTo(9, -15.588458061218262);

        ctx.closePath();

        ctx.fillColor(scolor);
        ctx.strokeColor(scolor);
        ctx.fill();
        ctx.stroke();
    }

    {
        ctx.save();
        defer ctx.restore();

        ctx.rotate(rotation * 0.04);

        ctx.beginPath();

        ctx.moveTo(8, 0);
        ctx.lineTo(4, 6.928203582763672);
        ctx.lineTo(-4, 6.928203105926514);
        ctx.lineTo(-8, 0);
        ctx.lineTo(-4, -6.928203582763672);
        ctx.lineTo(4, -6.928203582763672);

        ctx.closePath();

        ctx.fillColor(acolor);
        ctx.strokeColor(acolor);
        ctx.fill();
        ctx.stroke();
    }
}

pub const MobSandstormRenderer = Renderer(MobSuper, false, render, null);

const std = @import("std");
const math = std.math;
const time = std.time;

const Path2D = @import("../../../../../Kernel/WebAssembly/Interop/Canvas2D/Path2D.zig");
const Renderer = @import("../../Renderers/Renderer.zig").Renderer;
const skin_darken = @import("../../Renderers/Renderer.zig").skin_darken;
const RenderContext = @import("../../Renderers/Renderer.zig").RenderContext;
const MobSuper = @import("../../Mob.zig").Super;
