var body: Path2D = undefined;
var body_stroke: Path2D = undefined;

fn render(rctx: *RenderContext(MobSuper)) void {
    const ctx = rctx.ctx;
    const entity = rctx.entity;

    const fcolor = rctx.blendEffectColors(comptime .comptimeFromHex(0x29F2E5));
    const scolor = fcolor.darkened(skin_darken);

    ctx.rotate(entity.angle);

    const scale = entity.size * comptime (1.0 / 10.0);
    ctx.scale(scale, scale);

    ctx.setLineJoin(.round);

    ctx.fillColor(fcolor);
    ctx.fillPath(body, .nonzero);

    ctx.fillColor(scolor);
    ctx.fillPath(body_stroke, .nonzero);
}

fn init(_: mem.Allocator) void {
    { // Initialize paths & commands
        {
            body = .init();
            body_stroke = .init();
        }

        {
            body.moveTo(5, 0);
            body.lineTo(9.510565757751465, 3.090169906616211);
            body.lineTo(4.0450849533081055, 2.9389262199401855);
            body.lineTo(5.877852439880371, 8.090169906616211);
            body.lineTo(1.545084834098816, 4.755282878875732);
            body.lineTo(-4.37113897078234e-7, 10);
            body.lineTo(-1.5450851917266846, 4.755282402038574);
            body.lineTo(-5.877851963043213, 8.090169906616211);
            body.lineTo(-4.045085430145264, 2.9389259815216064);
            body.lineTo(-9.510564804077148, 3.090170383453369);
            body.lineTo(-5, -4.37113897078234e-7);
            body.lineTo(-9.510565757751465, -3.090169668197632);
            body.lineTo(-4.0450849533081055, -2.9389266967773438);
            body.lineTo(-5.877850532531738, -8.090170860290527);
            body.lineTo(-1.5450854301452637, -4.755282402038574);
            body.lineTo(1.1924880993774423e-7, -10);
            body.lineTo(1.5450856685638428, -4.755282402038574);
            body.lineTo(5.877850532531738, -8.090170860290527);
            body.lineTo(4.0450849533081055, -2.9389264583587646);
            body.lineTo(9.510565757751465, -3.0901694297790527);
            body.lineTo(5, 0);
            body.closePath();
        }

        {
            body_stroke.moveTo(5.282590866088867, -0.4124833643436432);
            body_stroke.lineTo(11.19331169128418, 3.6369271278381348);
            body_stroke.lineTo(4.031253814697266, 3.438735008239746);
            body_stroke.lineTo(4.0450849533081055, 2.9389262199401855);
            body_stroke.lineTo(4.516157150268555, 2.771322727203369);
            body_stroke.lineTo(6.9178466796875, 9.521598815917969);
            body_stroke.lineTo(1.2401151657104492, 5.1515069007873535);
            body_stroke.lineTo(1.545084834098816, 4.755282878875732);
            body_stroke.lineTo(2.024705171585083, 4.896578311920166);
            body_stroke.lineTo(-5.470561745823943e-7, 11.769343376159668);
            body_stroke.lineTo(-2.024705410003662, 4.896577835083008);
            body_stroke.lineTo(-1.5450851917266846, 4.755282402038574);
            body_stroke.lineTo(-1.2401155233383179, 5.151506423950195);
            body_stroke.lineTo(-6.917845726013184, 9.521598815917969);
            body_stroke.lineTo(-4.516157627105713, 2.771322727203369);
            body_stroke.lineTo(-4.045085430145264, 2.9389259815216064);
            body_stroke.lineTo(-4.031254291534424, 3.438734531402588);
            body_stroke.lineTo(-11.193310737609863, 3.636928081512451);
            body_stroke.lineTo(-5.282590866088867, -0.41248375177383423);
            body_stroke.lineTo(-5, -4.37113897078234e-7);
            body_stroke.lineTo(-5.282590389251709, 0.41248294711112976);
            body_stroke.lineTo(-11.19331169128418, -3.6369266510009766);
            body_stroke.lineTo(-4.031253814697266, -3.4387354850769043);
            body_stroke.lineTo(-4.0450849533081055, -2.9389266967773438);
            body_stroke.lineTo(-4.516157150268555, -2.7713234424591064);
            body_stroke.lineTo(-6.917844295501709, -9.521600723266602);
            body_stroke.lineTo(-1.2401156425476074, -5.151506423950195);
            body_stroke.lineTo(-1.5450854301452637, -4.755282402038574);
            body_stroke.lineTo(-2.024705648422241, -4.896577835083008);
            body_stroke.lineTo(1.1924880993774423e-7, -11.769343376159668);
            body_stroke.lineTo(2.0247058868408203, -4.896577835083008);
            body_stroke.lineTo(1.5450856685638428, -4.755282402038574);
            body_stroke.lineTo(1.2401158809661865, -5.151506423950195);
            body_stroke.lineTo(6.917844295501709, -9.521600723266602);
            body_stroke.lineTo(4.516157150268555, -2.7713232040405273);
            body_stroke.lineTo(4.0450849533081055, -2.9389264583587646);
            body_stroke.lineTo(4.031253814697266, -3.438735008239746);
            body_stroke.lineTo(11.19331169128418, -3.6369266510009766);
            body_stroke.lineTo(5.282590866088867, 0.4124833941459656);
            body_stroke.lineTo(5, 0);
            body_stroke.lineTo(5.282590866088867, -0.4124833643436432);
            body_stroke.closePath();
            body_stroke.moveTo(4.115327835083008, -3.195919973109085e-8);
            body_stroke.lineTo(9.227974891662598, -3.502652883529663);
            body_stroke.lineTo(9.510565757751465, -3.0901694297790527);
            body_stroke.lineTo(9.524396896362305, -2.590360641479492);
            body_stroke.lineTo(3.3293707370758057, -2.4189295768737793);
            body_stroke.lineTo(5.406778335571289, -8.257774353027344);
            body_stroke.lineTo(5.877850532531738, -8.090170860290527);
            body_stroke.lineTo(6.1828203201293945, -7.693946838378906);
            body_stroke.lineTo(1.2717071771621704, -3.9139091968536377);
            body_stroke.lineTo(-0.47962015867233276, -9.858704566955566);
            body_stroke.lineTo(1.1924880993774423e-7, -10);
            body_stroke.lineTo(0.47962039709091187, -9.858704566955566);
            body_stroke.lineTo(-1.2717069387435913, -3.9139091968536377);
            body_stroke.lineTo(-6.1828203201293945, -7.693946838378906);
            body_stroke.lineTo(-5.877850532531738, -8.090170860290527);
            body_stroke.lineTo(-5.406778335571289, -8.257774353027344);
            body_stroke.lineTo(-3.3293707370758057, -2.4189298152923584);
            body_stroke.lineTo(-9.524396896362305, -2.5903611183166504);
            body_stroke.lineTo(-9.510565757751465, -3.090169668197632);
            body_stroke.lineTo(-9.227974891662598, -3.502653121948242);
            body_stroke.lineTo(-4.115328311920166, -5.969098992864019e-7);
            body_stroke.lineTo(-9.227973937988281, 3.5026535987854004);
            body_stroke.lineTo(-9.510564804077148, 3.090170383453369);
            body_stroke.lineTo(-9.524395942687988, 2.5903615951538086);
            body_stroke.lineTo(-3.3293709754943848, 2.418928861618042);
            body_stroke.lineTo(-5.406779766082764, 8.257773399353027);
            body_stroke.lineTo(-5.877851963043213, 8.090169906616211);
            body_stroke.lineTo(-6.182821750640869, 7.69394588470459);
            body_stroke.lineTo(-1.2717065811157227, 3.913909435272217);
            body_stroke.lineTo(0.4796198606491089, 9.858704566955566);
            body_stroke.lineTo(-4.37113897078234e-7, 10);
            body_stroke.lineTo(-0.47962072491645813, 9.858704566955566);
            body_stroke.lineTo(1.271706223487854, 3.913910150527954);
            body_stroke.lineTo(6.182822227478027, 7.69394588470459);
            body_stroke.lineTo(5.877852439880371, 8.090169906616211);
            body_stroke.lineTo(5.406780242919922, 8.257773399353027);
            body_stroke.lineTo(3.3293704986572266, 2.418929100036621);
            body_stroke.lineTo(9.524396896362305, 2.5903611183166504);
            body_stroke.lineTo(9.510565757751465, 3.090169906616211);
            body_stroke.lineTo(9.227974891662598, 3.5026533603668213);
            body_stroke.lineTo(4.717409133911133, 0.4124833643436432);
            body_stroke.lineTo(4.115327835083008, -3.195919973109085e-8);
            body_stroke.closePath();
        }
    }
}

pub const PetalLightningRenderer = Renderer(MobSuper, false, render, init);

const std = @import("std");
const math = std.math;
const time = std.time;
const mem = std.mem;

const Renderer = @import("../Renderer.zig").Renderer;
const skin_darken = @import("../Renderer.zig").skin_darken;
const RenderContext = @import("../Renderer.zig").RenderContext;
const MobSuper = @import("../../Mob.zig").Super;
const Path2D = @import("../../../../../Kernel/WebAssembly/Interop/Canvas2D/Path2D.zig");
