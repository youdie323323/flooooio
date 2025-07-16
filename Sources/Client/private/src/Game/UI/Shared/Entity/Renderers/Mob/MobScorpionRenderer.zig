var tail: Path2D = undefined;
var tail_stroke: Path2D = undefined;

var tail_wrinkle_1: Path2D = undefined;
var tail_wrinkle_2: Path2D = undefined;

const leg_length: comptime_float = 36;

const whatthefuck: comptime_float = 3.8014068603515625;

const beak_mul: comptime_float = 0.1;

fn render(rctx: RenderContext(MobSuper)) void {
    const ctx = rctx.ctx;
    const entity = rctx.entity;
    const mob = entity.impl;

    const bcolor = rctx.blendEffectColors(comptime .comptimeFromHexColorCode("#333333"));
    const wcolor = bcolor.darkened(skin_darken);

    const fcolor = rctx.blendEffectColors(comptime .comptimeFromHexColorCode("#C69A2D"));
    const scolor = fcolor.darkened(skin_darken);

    const tcolor = rctx.blendEffectColors(comptime .comptimeFromHexColorCode("#DBAB32"));
    const ecolor = tcolor.darkened(skin_darken);

    ctx.rotate(entity.angle);

    const scale = entity.size * comptime (1.0 / 30.0);
    ctx.scale(scale, scale);

    ctx.setLineJoin(.round);
    ctx.setLineCap(.round);

    ctx.fillColor(bcolor);
    ctx.strokeColor(bcolor);

    { // Beak
        ctx.save();
        defer ctx.restore();

        ctx.setLineWidth(6);

        ctx.translate(20, whatthefuck);
        ctx.scale(0.6628867661928461, 0.6628867198043205);

        const beak_angle = mob.calculateBeakAngle(beak_mul) - beak_mul;

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

            ctx.moveTo(-10, comptime (5 * dir));
            ctx.quadraticCurveTo(0, comptime (30 * dir), 35, comptime (11 * dir));
            ctx.quadraticCurveTo(0, comptime (20 * dir), -10, comptime (5 * dir));

            ctx.fill();
            ctx.stroke();
        }
    }

    {
        ctx.save();
        defer ctx.restore();

        ctx.setLineWidth(7);

        ctx.translate(whatthefuck, whatthefuck);
        ctx.scale(0.7679999578592127, 0.7679999578592127);

        { // Legs
            ctx.beginPath();

            inline for (0..8) |i| {
                const i_f32: comptime_float = comptime @floatFromInt(i);

                const leg_chaos: comptime_float = comptime 4.52141 * i_f32;

                const dir: comptime_float =
                    comptime if (4 > i)
                        1
                    else
                        -1;

                const base_theta: comptime_float = comptime (0.25 + @mod(i_f32, 4) * 0.15) * math.pi;

                const theta = (base_theta + @sin(leg_chaos + entity.move_counter * 0.75) * 0.2) * dir;

                ctx.moveTo(0, 0);
                ctx.lineTo(
                    @cos(theta) * leg_length,
                    @sin(theta) * leg_length,
                );
            }

            ctx.stroke();
        }

        ctx.strokeColor(scolor);

        { // Body
            ctx.beginPath();

            ctx.moveTo(0, -30);
            ctx.quadraticCurveTo(40, -20, 40, 0);
            ctx.quadraticCurveTo(40, 20, 0, 30);
            ctx.quadraticCurveTo(-40, 35, -40, 0);
            ctx.quadraticCurveTo(-40, -35, 0, -30);

            ctx.fillColor(fcolor);
            ctx.fill();
            ctx.stroke();
        }

        { // Wrinkles
            {
                ctx.beginPath();

                ctx.moveTo(22, -12);
                ctx.quadraticCurveTo(26, 0, 22, 12);

                ctx.stroke();
            }

            {
                ctx.beginPath();

                ctx.moveTo(7, -18);
                ctx.quadraticCurveTo(10.5, 0, 7, 18);

                ctx.stroke();
            }

            {
                ctx.beginPath();

                ctx.moveTo(-7, -18);
                ctx.quadraticCurveTo(-10.5, 0, -7, 18);

                ctx.stroke();
            }

            {
                ctx.beginPath();

                ctx.moveTo(-22, -15);
                ctx.quadraticCurveTo(-27, 0, -22, 15);

                ctx.stroke();
            }
        }
    }

    { // Tail
        ctx.save();
        defer ctx.restore();

        ctx.translate(-34, -7);
        ctx.scale(0.30719998103634244, 0.30719998103634244);

        ctx.fillColor(tcolor);
        ctx.fillPath(tail, .nonzero);

        ctx.fillColor(ecolor);
        ctx.fillPath(tail_stroke, .nonzero);
    }

    { // Tail wrinkle
        ctx.save();
        defer ctx.restore();

        ctx.translate(whatthefuck, whatthefuck);
        ctx.scale(0.7679999578592127, 0.7679999578592127);

        ctx.fillColor(ecolor);

        ctx.fillPath(tail_wrinkle_1, .nonzero);
        ctx.fillPath(tail_wrinkle_2, .nonzero);
    }

    { // Pincer
        ctx.save();
        defer ctx.restore();

        ctx.translate(-5, whatthefuck);
        ctx.scale(0.7679999578592127, 0.7679999578592127);

        ctx.beginPath();

        ctx.moveTo(3.5, 0);
        ctx.lineTo(-3.5, -7);
        ctx.lineTo(-3.5, 7);

        ctx.closePath();

        ctx.setLineWidth(4);
        ctx.strokeColor(wcolor);
        ctx.fill();
        ctx.stroke();
    }
}

fn init(_: std.mem.Allocator) void {
    { // Init paths & commands
        {
            tail = .init();
            tail_stroke = .init();

            tail_wrinkle_1 = .init();
            tail_wrinkle_2 = .init();
        }

        {
            tail.moveTo(0.6085600256919861, 36.22243881225586);
            tail.bezierCurveTo(0.834030032157898, 59.97243881225586, 9.074830055236816, 71.84744262695312, 32.05949020385742, 71.72244262695312);
            tail.bezierCurveTo(55.044151306152344, 71.59744262695312, 83.05949401855469, 58.722442626953125, 92.48587036132812, 36.222442626953125);
            tail.bezierCurveTo(78.25892639160156, -0.24285000562667847, -2.8690900802612305, -21.410219192504883, 0.6085600256919861, 36.22243881225586);
            tail.closePath();
        }

        {
            tail_stroke.moveTo(8.108222007751465, 36.151241302490234);
            tail_stroke.quadraticCurveTo(8.25671672821045, 51.79310607910156, 13.548282623291016, 58.108978271484375);
            tail_stroke.quadraticCurveTo(18.73090362548828, 64.2948226928711, 32.018699645996094, 64.2225570678711);
            tail_stroke.quadraticCurveTo(48.49220275878906, 64.13297271728516, 63.757965087890625, 55.78304672241211);
            tail_stroke.quadraticCurveTo(79.84596252441406, 46.98338317871094, 85.56841278076172, 33.32437515258789);
            tail_stroke.lineTo(92.48587036132812, 36.222442626953125);
            tail_stroke.lineTo(85.49881744384766, 38.94844436645508);
            tail_stroke.quadraticCurveTo(81.18331146240234, 27.887290954589844, 67.55020141601562, 19.021472930908203);
            tail_stroke.quadraticCurveTo(54.011810302734375, 10.217248916625977, 38.99715042114258, 8.380192756652832);
            tail_stroke.quadraticCurveTo(24.207897186279297, 6.570713043212891, 16.02060890197754, 12.762636184692383);
            tail_stroke.quadraticCurveTo(7.113079071044922, 19.499269485473633, 8.094919204711914, 35.77069854736328);
            tail_stroke.quadraticCurveTo(8.100666046142578, 35.8657341003418, 8.103991508483887, 35.96088409423828);
            tail_stroke.quadraticCurveTo(8.107316970825195, 36.05603790283203, 8.108221054077148, 36.151241302490234);
            tail_stroke.lineTo(8.108222007751465, 36.151241302490234);
            tail_stroke.closePath();
            tail_stroke.moveTo(-6.891101837158203, 36.293636322021484);
            tail_stroke.lineTo(0.6085600256919861, 36.22243881225586);
            tail_stroke.lineTo(-6.877847194671631, 36.674171447753906);
            tail_stroke.quadraticCurveTo(-8.34365463256836, 12.38224983215332, 6.972555637359619, 0.7988262176513672);
            tail_stroke.quadraticCurveTo(20.002670288085938, -9.055655479431152, 40.81882858276367, -6.5087785720825195);
            tail_stroke.quadraticCurveTo(59.27922821044922, -4.250129699707031, 75.72781372070312, 6.44663143157959);
            tail_stroke.quadraticCurveTo(93.40434265136719, 17.941944122314453, 99.4729232788086, 33.49644088745117);
            tail_stroke.quadraticCurveTo(100.00334930419922, 34.855995178222656, 99.98529052734375, 36.31524658203125);
            tail_stroke.quadraticCurveTo(99.96723937988281, 37.774497985839844, 99.40332794189453, 39.12051010131836);
            tail_stroke.quadraticCurveTo(91.65159606933594, 57.623260498046875, 70.95611572265625, 68.94308471679688);
            tail_stroke.quadraticCurveTo(52.36455154418945, 79.11212158203125, 32.10027313232422, 79.22232818603516);
            tail_stroke.quadraticCurveTo(-6.4815673828125, 79.43215942382812, -6.891101837158203, 36.293636322021484);
            tail_stroke.closePath();
        }

        {
            tail_wrinkle_1.moveTo(-24.127342224121094, -3.297753095626831);
            tail_wrinkle_1.quadraticCurveTo(-25.364002227783203, 0, -24.127342224121094, 3.297753095626831);
            tail_wrinkle_1.quadraticCurveTo(-23.83646011352539, 4.073432922363281, -24.17926597595215, 4.827605247497559);
            tail_wrinkle_1.quadraticCurveTo(-24.522071838378906, 5.581777572631836, -25.297752380371094, 5.8726582527160645);
            tail_wrinkle_1.quadraticCurveTo(-26.07343101501465, 6.163537979125977, -26.82760238647461, 5.820732593536377);
            tail_wrinkle_1.quadraticCurveTo(-27.581775665283203, 5.477927207946777, -27.872657775878906, 4.70224666595459);
            tail_wrinkle_1.quadraticCurveTo(-29.635997772216797, -4.76837158203125e-7, -27.872657775878906, -4.70224666595459);
            tail_wrinkle_1.quadraticCurveTo(-27.581775665283203, -5.477927207946777, -26.827604293823242, -5.820732593536377);
            tail_wrinkle_1.quadraticCurveTo(-26.07343101501465, -6.163537979125977, -25.297752380371094, -5.8726582527160645);
            tail_wrinkle_1.quadraticCurveTo(-24.522071838378906, -5.581777572631836, -24.17926597595215, -4.827605247497559);
            tail_wrinkle_1.quadraticCurveTo(-23.83646011352539, -4.073432922363281, -24.127342224121094, -3.297753095626831);
            tail_wrinkle_1.closePath();
        }

        {
            tail_wrinkle_2.moveTo(-34.28501510620117, -3.971008539199829);
            tail_wrinkle_2.quadraticCurveTo(-36.66761779785156, 4.76837158203125e-7, -34.28501510620117, 3.971008539199829);
            tail_wrinkle_2.quadraticCurveTo(-33.85879135131836, 4.681378364562988, -34.059715270996094, 5.485071182250977);
            tail_wrinkle_2.quadraticCurveTo(-34.26063537597656, 6.288763046264648, -34.97100830078125, 6.7149858474731445);
            tail_wrinkle_2.quadraticCurveTo(-35.681373596191406, 7.141207695007324, -36.485069274902344, 6.940284729003906);
            tail_wrinkle_2.quadraticCurveTo(-37.288761138916016, 6.739361763000488, -37.71498489379883, 6.02899169921875);
            tail_wrinkle_2.quadraticCurveTo(-41.33238220214844, 0, -37.71498489379883, -6.02899169921875);
            tail_wrinkle_2.quadraticCurveTo(-37.288761138916016, -6.739361763000488, -36.485069274902344, -6.940284729003906);
            tail_wrinkle_2.quadraticCurveTo(-35.681373596191406, -7.141207695007324, -34.97100830078125, -6.7149858474731445);
            tail_wrinkle_2.quadraticCurveTo(-34.26063537597656, -6.288763046264648, -34.05971145629883, -5.485071182250977);
            tail_wrinkle_2.quadraticCurveTo(-33.85879135131836, -4.681378364562988, -34.28501510620117, -3.971008539199829);
            tail_wrinkle_2.closePath();
        }
    }
}

pub const MobScorpionRenderer = Renderer(MobSuper, false, render, init);

const std = @import("std");
const math = std.math;
const time = std.time;

const Path2D = @import("../../../../../Kernel/WebAssembly/Interop/Canvas2D/Path2D.zig");
const Renderer = @import("../Renderer.zig").Renderer;
const skin_darken = @import("../Renderer.zig").skin_darken;
const RenderContext = @import("../Renderer.zig").RenderContext;
const MobSuper = @import("../../Mob.zig").Super;
