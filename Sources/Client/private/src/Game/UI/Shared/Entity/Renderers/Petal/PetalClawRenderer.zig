var body: Path2D = undefined;
var body_stroke: Path2D = undefined;

fn render(rctx: *RenderContext(MobSuper)) void {
    const ctx = rctx.ctx;
    const entity = rctx.entity;

    const fcolor = rctx.blendEffectColors(comptime .comptimeFromHex(0x4D2621));
    const scolor = fcolor.darkened(body_darken);

    ctx.rotate(entity.angle);

    const scale = entity.size * comptime (1.0 / 10.0);
    ctx.scale(scale, scale);

    ctx.setLineJoin(.round);

    ctx.fillColor(fcolor);
    ctx.fillPath(body, .nonzero);

    ctx.fillColor(scolor);
    ctx.fillPath(body_stroke, .nonzero);
}

fn init(_: std.mem.Allocator) void {
    { // Initialize paths & commands
        {
            body = .init();
            body_stroke = .init();
        }

        {
            body.moveTo(-14, -4);
            body.quadraticCurveTo(8, -16, 18, 6);
            body.lineTo(8, 0);
            body.lineTo(12, 10);
            body.quadraticCurveTo(-2, -2, -14, 4);
            body.quadraticCurveTo(-12, 0, -14, -4);
            body.closePath();
        }

        {
            body_stroke.moveTo(-14.957704544067383, -5.755791187286377);
            body_stroke.quadraticCurveTo(-3.2130584716796875, -12.161964416503906, 5.596549987792969, -9.408960342407227);
            body_stroke.quadraticCurveTo(14.450504302978516, -6.642097473144531, 19.82073211669922, 5.172394275665283);
            body_stroke.quadraticCurveTo(20.163536071777344, 5.926566123962402, 19.872657775878906, 6.70224666595459);
            body_stroke.quadraticCurveTo(19.581775665283203, 7.477927207946777, 18.827606201171875, 7.820733070373535);
            body_stroke.quadraticCurveTo(18.37864112854004, 8.02480697631836, 17.886268615722656, 7.996763229370117);
            body_stroke.quadraticCurveTo(17.393898010253906, 7.968719005584717, 16.97100830078125, 7.7149858474731445);
            body_stroke.lineTo(6.97100830078125, 1.7149858474731445);
            body_stroke.lineTo(8, 0);
            body_stroke.lineTo(9.856953620910645, -0.7427813410758972);
            body_stroke.lineTo(13.856953620910645, 9.257218360900879);
            body_stroke.quadraticCurveTo(14.164623260498047, 10.02639389038086, 13.838290214538574, 10.787837982177734);
            body_stroke.quadraticCurveTo(13.511956214904785, 11.54928207397461, 12.742781639099121, 11.856953620910645);
            body_stroke.quadraticCurveTo(12.224287033081055, 12.064351081848145, 11.67335033416748, 11.97314453125);
            body_stroke.quadraticCurveTo(11.122413635253906, 11.881937026977539, 10.698417663574219, 11.518512725830078);
            body_stroke.quadraticCurveTo(-2.2933197021484375, 0.3827362060546875, -13.105572700500488, 5.788854598999023);
            body_stroke.quadraticCurveTo(-13.846540451049805, 6.159337997436523, -14.632455825805664, 5.897366046905518);
            body_stroke.quadraticCurveTo(-15.418370246887207, 5.63539457321167, -15.788854598999023, 4.894427299499512);
            body_stroke.quadraticCurveTo(-16, 4.4721360206604, -16, 4);
            body_stroke.quadraticCurveTo(-16, 3.5278639793395996, -15.788854598999023, 3.1055727005004883);
            body_stroke.quadraticCurveTo(-14.236069679260254, 0.0000016689300537109375, -15.788854598999023, -3.1055727005004883);
            body_stroke.quadraticCurveTo(-16.150020599365234, -3.827904462814331, -15.908353805541992, -4.598489284515381);
            body_stroke.quadraticCurveTo(-15.666685104370117, -5.369073867797852, -14.957704544067383, -5.755791187286377);
            body_stroke.closePath();
            body_stroke.moveTo(-13.042295455932617, -2.244208812713623);
            body_stroke.lineTo(-14, -4);
            body_stroke.lineTo(-12.211145401000977, -4.894427299499512);
            body_stroke.quadraticCurveTo(-9.763931274414062, 0, -12.211145401000977, 4.894427299499512);
            body_stroke.lineTo(-14, 4);
            body_stroke.lineTo(-14.894427299499512, 2.2111456394195557);
            body_stroke.quadraticCurveTo(-1.7066726684570312, -4.3827362060546875, 13.301582336425781, 8.481487274169922);
            body_stroke.lineTo(12, 10);
            body_stroke.lineTo(10.143046379089355, 10.742781639099121);
            body_stroke.lineTo(6.143046855926514, 0.7427812218666077);
            body_stroke.quadraticCurveTo(5.968947410583496, 0.3075345754623413, 6.006389141082764, -0.1597428023815155);
            body_stroke.quadraticCurveTo(6.043830871582031, -0.6270201802253723, 6.2850141525268555, -1.028991460800171);
            body_stroke.quadraticCurveTo(6.711236000061035, -1.7393617630004883, 7.514928817749023, -1.9402847290039062);
            body_stroke.quadraticCurveTo(8.318620681762695, -2.1412079334259033, 9.02899169921875, -1.7149858474731445);
            body_stroke.lineTo(19.02899169921875, 4.2850141525268555);
            body_stroke.lineTo(18, 6);
            body_stroke.lineTo(16.17926788330078, 6.827605724334717);
            body_stroke.quadraticCurveTo(11.54948902130127, -3.357903480529785, 4.403450012207031, -5.591040134429932);
            body_stroke.quadraticCurveTo(-2.7869415283203125, -7.838038444519043, -13.042295455932617, -2.244208812713623);
            body_stroke.closePath();
        }
    }
}

pub const PetalClawRenderer = Renderer(MobSuper, false, render, init);

const std = @import("std");
const math = std.math;
const time = std.time;

const Path2D = @import("../../../../../Kernel/WebAssembly/Interop/Canvas2D/Path2D.zig");
const Renderer = @import("../Renderer.zig").Renderer;
const body_darken = @import("../Renderer.zig").body_darken;
const RenderContext = @import("../Renderer.zig").RenderContext;
const MobSuper = @import("../../Mob.zig").Super;
