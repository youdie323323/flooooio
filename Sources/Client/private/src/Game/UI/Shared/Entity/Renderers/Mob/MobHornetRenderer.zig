var missile_body: Path2D = undefined;
var missile_body_stroke: Path2D = undefined;

/// Returns pointer to missile body to access from outside of this file.
pub fn missileBody() *Path2D {
    return &missile_body;
}

/// Returns pointer to missile body stroke to access from outside of this file.
pub fn missileBodyStroke() *Path2D {
    return &missile_body_stroke;
}

var antennae: Path2D = undefined;

fn render(rctx: *RenderContext(MobSuper)) void {
    const ctx = rctx.ctx;
    const entity = rctx.entity;

    const bcolor = rctx.blendEffectColors(comptime .comptimeFromHexColorCode("#333333"));

    const fcolor = rctx.blendEffectColors(comptime .comptimeFromHexColorCode("#FFD363"));
    const scolor = fcolor.darkened(skin_darken);

    ctx.rotate(entity.angle);

    const scale = entity.size * comptime (1.0 / 25.0);
    ctx.scale(scale, scale);

    ctx.setLineJoin(.round);
    ctx.setLineCap(.round);

    ctx.setLineWidth(5);

    { // Missile
        ctx.save();
        defer ctx.restore();

        ctx.translate(-38.55711364746094, 0);
        ctx.rotate(math.pi);

        ctx.fillColor(bcolor);
        ctx.fillPath(missile_body, .nonzero);
        ctx.fillPath(missile_body_stroke, .nonzero);
    }

    // Body
    ctx.beginPath();

    ctx.ellipse(0, 0, 30, 20, 0, 0, math.tau, false);

    ctx.fillColor(fcolor);
    ctx.fill();

    { // Body stripes
        ctx.save();
        defer ctx.restore();

        ctx.clip();

        ctx.fillColor(bcolor);
        ctx.fillRect(10, -20, 10, 40);
        ctx.fillRect(-10, -20, 10, 40);
        ctx.fillRect(-30, -20, 10, 40);
    }

    // Body outline
    ctx.beginPath();

    ctx.ellipse(0, 0, 30, 20, 0, 0, math.tau, false);

    ctx.strokeColor(scolor);
    ctx.stroke();

    { // Antennas
        ctx.fillColor(bcolor);

        inline for (.{ -1, 1 }) |dir| {
            ctx.save();
            defer ctx.restore();

            ctx.translate(25, comptime (5 * dir));
            ctx.scale(1, dir);

            ctx.fillPath(antennae, .evenodd);
        }
    }
}

fn init(_: std.mem.Allocator) void {
    { // Init paths & commands
        {
            missile_body = .init();
            missile_body_stroke = .init();

            antennae = .init();
        }

        {
            missile_body.moveTo(11, 0);
            missile_body.lineTo(-11, -6);
            missile_body.lineTo(-11, 6);
            missile_body.lineTo(11, 0);

            missile_body.closePath();
        }

        {
            missile_body_stroke.moveTo(10.342206954956055, 2.411909580230713);
            missile_body_stroke.lineTo(-11.657793045043945, -3.588090419769287);
            missile_body_stroke.lineTo(-11, -6);
            missile_body_stroke.lineTo(-8.5, -6);
            missile_body_stroke.lineTo(-8.5, 6);
            missile_body_stroke.lineTo(-11, 6);
            missile_body_stroke.lineTo(-11.657793045043945, 3.588090419769287);
            missile_body_stroke.lineTo(10.342206954956055, -2.411909580230713);
            missile_body_stroke.lineTo(11, 0);
            missile_body_stroke.lineTo(10.342206954956055, 2.411909580230713);
            missile_body_stroke.closePath();

            missile_body_stroke.moveTo(11.657793045043945, -2.411909580230713);
            missile_body_stroke.quadraticCurveTo(12.298311233520508, -2.237222671508789, 12.767766952514648, -1.7677668333053589);
            missile_body_stroke.quadraticCurveTo(13.237222671508789, -1.2983107566833496, 13.411909103393555, -0.6577935218811035);
            missile_body_stroke.quadraticCurveTo(13.684375762939453, 0.34125208854675293, 13.17060661315918, 1.2403472661972046);
            missile_body_stroke.quadraticCurveTo(12.656837463378906, 2.1394424438476562, 11.657793045043945, 2.411909580230713);
            missile_body_stroke.lineTo(-10.342206954956055, 8.411909103393555);
            missile_body_stroke.quadraticCurveTo(-10.502988815307617, 8.455759048461914, -10.668167114257812, 8.477879524230957);
            missile_body_stroke.quadraticCurveTo(-10.833346366882324, 8.5, -11, 8.5);
            missile_body_stroke.quadraticCurveTo(-12.03553295135498, 8.5, -12.767765045166016, 7.767766952514648);
            missile_body_stroke.quadraticCurveTo(-13.499999046325684, 7.035533905029297, -13.5, 6);
            missile_body_stroke.lineTo(-13.5, -6);
            missile_body_stroke.quadraticCurveTo(-13.5, -6.166653633117676, -13.477879524230957, -6.3318328857421875);
            missile_body_stroke.quadraticCurveTo(-13.455759048461914, -6.497012138366699, -13.411909103393555, -6.6577935218811035);
            missile_body_stroke.quadraticCurveTo(-13.13944149017334, -7.656838417053223, -12.240346908569336, -8.17060661315918);
            missile_body_stroke.quadraticCurveTo(-11.341251373291016, -8.684375762939453, -10.342206954956055, -8.411909103393555);
            missile_body_stroke.lineTo(11.657793045043945, -2.411909580230713);
            missile_body_stroke.closePath();
        }

        {
            antennae.moveTo(-0.47434163093566895, 1.4230250120162964);
            antennae.quadraticCurveTo(-0.9337265491485596, 1.2698967456817627, -1.2168631553649902, 0.8770654201507568);
            antennae.quadraticCurveTo(-1.5, 0.4842342138290405, -1.5, 0);
            antennae.quadraticCurveTo(-1.5, -0.6213203072547913, -1.0606601238250732, -1.0606601238250732);
            antennae.quadraticCurveTo(-0.6213203072547913, -1.5, 0, -1.5);
            antennae.quadraticCurveTo(15.621322631835938, -1.5, 26.060659408569336, 8.939339637756348);
            antennae.quadraticCurveTo(26.403064727783203, 9.281744956970215, 26.48063087463379, 9.759726524353027);
            antennae.quadraticCurveTo(26.558197021484375, 10.23770809173584, 26.34164047241211, 10.670820236206055);
            antennae.quadraticCurveTo(26.06377601623535, 11.226545333862305, 25.47433853149414, 11.423023223876953);
            antennae.quadraticCurveTo(24.884902954101562, 11.619503021240234, 24.329179763793945, 11.34164047241211);
            antennae.quadraticCurveTo(14.424531936645508, 6.389315605163574, -0.47434163093566895, 1.4230250120162964);
            antennae.closePath();
        }
    }
}

pub const MobHornetRenderer = Renderer(MobSuper, false, render, init);

const std = @import("std");
const math = std.math;
const time = std.time;

const Path2D = @import("../../../../../Kernel/WebAssembly/Interop/Canvas2D/Path2D.zig");
const Renderer = @import("../../Renderers/Renderer.zig").Renderer;
const skin_darken = @import("../../Renderers/Renderer.zig").skin_darken;
const RenderContext = @import("../../Renderers/Renderer.zig").RenderContext;
const MobSuper = @import("../../Mob.zig").Super;
