const std = @import("std");
const math = std.math;
const time = std.time;
const Path2D = @import("../../../WebAssembly/Interop/Canvas2D/Path2D.zig");
const Renderer = @import("../Renderer.zig").Renderer;
const skin_darken = @import("../Renderer.zig").skin_darken;
const RenderContext = @import("../Renderer.zig").RenderContext;
const MobSuper = @import("../../Mob.zig").Super;
const MobType = @import("../../EntityType.zig").MobType;

const Color = @import("../../../WebAssembly/Interop/Canvas2D/Color.zig");

var antennas: Path2D = undefined;

fn render(rctx: RenderContext(MobSuper)) void {
    @setEvalBranchQuota(100_000);

    const ctx = rctx.ctx;
    const entity = rctx.entity;
    const mob = entity.impl;

    const acolor = rctx.blendEffectColors(comptime Color.comptimeFromHexColorCode("#333333"));

    const fcolor = rctx.blendEffectColors(switch (mob.type.get()) {
        inline @intFromEnum(MobType.centipede) => comptime Color.comptimeFromHexColorCode("#8ac255"),
        inline @intFromEnum(MobType.centipede_desert) => comptime Color.comptimeFromHexColorCode("#d3c66d"),
        inline @intFromEnum(MobType.centipede_evil) => comptime Color.comptimeFromHexColorCode("#8f5db0"),
        inline else => comptime Color.comptimeFromHexColorCode("#ffffff"),
    });
    const scolor = fcolor.darkened(skin_darken);

    ctx.rotate(entity.angle);

    const scale = entity.size / 35;
    ctx.scale(scale, scale);

    ctx.setLineJoin(.round);
    ctx.setLineCap(.round);

    ctx.setLineWidth(7);

    { // Body balls (lol?)
        ctx.beginPath();

        inline for (.{ -1, 1 }) |dir|
            ctx.arc(0, 30 * dir, 15, 0, math.tau, false);

        ctx.fillColor(acolor);
        ctx.fill();
    }

    // Body
    ctx.beginPath();

    ctx.arc(0, 0, 35, 0, math.tau, false);

    ctx.fillColor(fcolor);
    ctx.strokeColor(scolor);
    ctx.fill();
    ctx.stroke();

    if (mob.is_first_segment) { // Antennas
        ctx.fillColor(acolor);
        ctx.strokeColor(acolor);

        ctx.fillPath(antennas, .evenodd);
    }
}

fn init(_: std.mem.Allocator) void {
    { // Init paths & commands
        {
            antennas = .init();
        }

        {
            antennas.moveTo(60, -30);
            antennas.quadraticCurveTo(59.99999237060547, -27.92892837524414, 58.53553009033203, -26.46446418762207);
            antennas.quadraticCurveTo(57.07106018066406, -25, 55, -25);
            antennas.quadraticCurveTo(54.74510955810547, -25, 54.49153518676758, -25.025920867919922);
            antennas.quadraticCurveTo(54.23796081542969, -25.051843643188477, 53.988338470458984, -25.103416442871094);
            antennas.quadraticCurveTo(43.683990478515625, -8.5, 25, -8.5);
            antennas.quadraticCurveTo(24.378677368164062, -8.5, 23.93933868408203, -8.939339637756348);
            antennas.quadraticCurveTo(23.5, -9.378679275512695, 23.5, -10);
            antennas.quadraticCurveTo(23.5, -10.621319770812988, 23.93933868408203, -11.060659408569336);
            antennas.quadraticCurveTo(24.378677368164062, -11.5, 25, -11.5);
            antennas.quadraticCurveTo(41.910125732421875, -11.5, 51.362449645996094, -26.569515228271484);
            antennas.quadraticCurveTo(50.70615768432617, -27.26542091369629, 50.35307693481445, -28.154430389404297);
            antennas.quadraticCurveTo(50, -29.043441772460938, 50, -30);
            antennas.quadraticCurveTo(49.999996185302734, -32.07106399536133, 51.46446228027344, -33.53553009033203);
            antennas.quadraticCurveTo(52.928924560546875, -34.999996185302734, 55, -35);
            antennas.quadraticCurveTo(57.07106018066406, -34.999996185302734, 58.53553009033203, -33.53553009033203);
            antennas.quadraticCurveTo(59.99999237060547, -32.07106399536133, 60, -30);
            antennas.closePath();

            antennas.moveTo(50, 30);
            antennas.quadraticCurveTo(50, 29.043441772460938, 50.35308074951172, 28.154430389404297);
            antennas.quadraticCurveTo(50.70615768432617, 27.26542091369629, 51.362449645996094, 26.569515228271484);
            antennas.quadraticCurveTo(41.910125732421875, 11.5, 25, 11.5);
            antennas.quadraticCurveTo(24.378677368164062, 11.5, 23.93933868408203, 11.060659408569336);
            antennas.quadraticCurveTo(23.5, 10.621319770812988, 23.5, 10);
            antennas.quadraticCurveTo(23.5, 9.378679275512695, 23.93933868408203, 8.939339637756348);
            antennas.quadraticCurveTo(24.378677368164062, 8.5, 25, 8.5);
            antennas.quadraticCurveTo(43.683990478515625, 8.5, 53.988338470458984, 25.103416442871094);
            antennas.quadraticCurveTo(54.23796081542969, 25.051843643188477, 54.491539001464844, 25.025922775268555);
            antennas.quadraticCurveTo(54.74510955810547, 25, 55, 25);
            antennas.quadraticCurveTo(57.07106018066406, 25, 58.53553009033203, 26.464462280273438);
            antennas.quadraticCurveTo(59.99999237060547, 27.92892837524414, 60, 30);
            antennas.quadraticCurveTo(59.99999237060547, 32.07106399536133, 58.53553009033203, 33.53553009033203);
            antennas.quadraticCurveTo(57.07106018066406, 34.999996185302734, 55, 35);
            antennas.quadraticCurveTo(52.928924560546875, 34.999996185302734, 51.46446228027344, 33.53553009033203);
            antennas.quadraticCurveTo(49.999996185302734, 32.07106399536133, 50, 30);
            antennas.closePath();
        }
    }
}

pub const MobCentipedeRenderer = Renderer(MobSuper, false, render, init);
