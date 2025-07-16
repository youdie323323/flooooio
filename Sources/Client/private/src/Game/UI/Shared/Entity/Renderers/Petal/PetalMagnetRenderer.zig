fn render(rctx: RenderContext(MobSuper)) void {
    const ctx = rctx.ctx;
    const entity = rctx.entity;

    const n_fcolor = rctx.blendEffectColors(comptime .comptimeFromHexColorCode("#A44343"));
    const n_scolor = n_fcolor.darkened(body_darken);

    const s_fcolor = rctx.blendEffectColors(comptime .comptimeFromHexColorCode("#363685"));
    const s_scolor = s_fcolor.darkened(body_darken);

    ctx.rotate(entity.angle);

    const scale = entity.size * comptime (1.0 / 18.0);
    ctx.scale(scale, scale);

    ctx.setLineJoin(.round);
    ctx.setLineCap(.round);

    ctx.translate(-23, 0);

    {
        ctx.beginPath();

        ctx.moveTo(39.5, 18);
        ctx.quadraticCurveTo(0, 30, 0, 0);

        ctx.setLineWidth(28);
        ctx.strokeColor(s_scolor);
        ctx.stroke();

        ctx.beginPath();

        ctx.moveTo(40, 18);
        ctx.quadraticCurveTo(0, 30, 0, 0);

        ctx.setLineWidth(16.8);
        ctx.strokeColor(s_fcolor);
        ctx.stroke();

        ctx.beginPath();

        ctx.moveTo(39.5, -18);
        ctx.quadraticCurveTo(0, -30, 0, 0);

        ctx.setLineWidth(28);
        ctx.strokeColor(n_scolor);
        ctx.stroke();

        ctx.beginPath();

        ctx.moveTo(40, -18);
        ctx.quadraticCurveTo(0, -30, 0, 0);

        ctx.setLineWidth(16.8);
        ctx.strokeColor(n_fcolor);
        ctx.stroke();
    }

    {
        ctx.setLineCap(.butt);

        ctx.beginPath();

        ctx.moveTo(39.5, 18);
        ctx.quadraticCurveTo(0, 30, 0, 0);

        ctx.setLineWidth(28);
        ctx.strokeColor(s_scolor);
        ctx.stroke();

        ctx.beginPath();

        ctx.moveTo(40, 18);
        ctx.quadraticCurveTo(0, 30, 0, 0);

        ctx.setLineWidth(16.8);
        ctx.strokeColor(s_fcolor);
        ctx.stroke();

        ctx.beginPath();

        ctx.moveTo(39.5, -18);
        ctx.quadraticCurveTo(0, -30, 0, 0);

        ctx.setLineWidth(28);
        ctx.strokeColor(n_scolor);
        ctx.stroke();

        ctx.beginPath();

        ctx.moveTo(40, -18);
        ctx.quadraticCurveTo(0, -30, 0, 0);

        ctx.setLineWidth(16.8);
        ctx.strokeColor(n_fcolor);
        ctx.stroke();
    }
}

pub const PetalMagnetRenderer = Renderer(MobSuper, false, render, null);

const std = @import("std");
const math = std.math;
const time = std.time;
const Renderer = @import("../Renderer.zig").Renderer;
const body_darken = @import("../Renderer.zig").body_darken;
const RenderContext = @import("../Renderer.zig").RenderContext;
const MobSuper = @import("../../Mob.zig").Super;
