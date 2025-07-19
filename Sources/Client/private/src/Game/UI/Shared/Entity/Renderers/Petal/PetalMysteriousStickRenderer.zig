var body: Path2D = undefined;
var body_stroke: Path2D = undefined;

fn render(rctx: *RenderContext(MobSuper)) void {
    const ctx = rctx.ctx;
    const entity = rctx.entity;

    const fcolor = rctx.blendEffectColors(comptime .comptimeFromHex(0x7D5B1F));
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
            body.moveTo(-1.5, 10);
            body.lineTo(-1.5, 0);
            body.quadraticCurveTo(-1.5, -0.19578027725219727, -1.4497493505477905, -0.38500186800956726);
            body.quadraticCurveTo(-1.3994989395141602, -0.5742234587669373, -1.302364706993103, -0.7442083954811096);
            body.lineTo(2.6976351737976074, -7.744208335876465);
            body.quadraticCurveTo(3.0058960914611816, -8.28366470336914, 3.605323553085327, -8.447145462036133);
            body.quadraticCurveTo(4.204751014709473, -8.610625267028809, 4.744208335876465, -8.302364349365234);
            body.quadraticCurveTo(5.283665180206299, -7.994102954864502, 5.447145462036133, -7.3946757316589355);
            body.quadraticCurveTo(5.610625267028809, -6.795248031616211, 5.302364826202393, -6.255791664123535);
            body.lineTo(1.302364706993103, 0.7442083954811096);
            body.lineTo(0, 0);
            body.lineTo(1.5, 0);
            body.lineTo(1.5, 10);
            body.quadraticCurveTo(1.5, 10.621319770812988, 1.0606601238250732, 11.060659408569336);
            body.quadraticCurveTo(0.6213203072547913, 11.5, 0, 11.5);
            body.quadraticCurveTo(-0.6213203072547913, 11.5, -1.0606601238250732, 11.060659408569336);
            body.quadraticCurveTo(-1.5, 10.621319770812988, -1.5, 10);
            body.closePath();
            body.moveTo(-1.2862393856048584, 0.7717435956001282);
            body.lineTo(-7.2862396240234375, -9.228256225585938);
            body.quadraticCurveTo(-7.605905532836914, -9.76103401184082, -7.45521354675293, -10.363802909851074);
            body.quadraticCurveTo(-7.304521560668945, -10.966571807861328, -6.7717437744140625, -11.286239624023438);
            body.quadraticCurveTo(-6.2389655113220215, -11.605905532836914, -5.636196136474609, -11.455212593078613);
            body.quadraticCurveTo(-5.033426761627197, -11.304520606994629, -4.7137603759765625, -10.771743774414062);
            body.lineTo(1.2862393856048584, -0.7717435956001282);
            body.quadraticCurveTo(1.6059060096740723, -0.23896579444408417, 1.4552136659622192, 0.3638034462928772);
            body.quadraticCurveTo(1.3045213222503662, 0.966572642326355, 0.7717435956001282, 1.2862393856048584);
            body.quadraticCurveTo(0.23896579444408417, 1.6059060096740723, -0.3638034462928772, 1.4552136659622192);
            body.quadraticCurveTo(-0.966572642326355, 1.3045213222503662, -1.2862393856048584, 0.7717435956001282);
            body.closePath();
        }

        {
            body_stroke.moveTo(-3.5, 10);
            body_stroke.lineTo(-3.5, 0);
            body_stroke.quadraticCurveTo(-3.5, -0.45682066679000854, -3.382748603820801, -0.898337721824646);
            body_stroke.quadraticCurveTo(-3.2654974460601807, -1.3398547172546387, -3.038851022720337, -1.7364861965179443);
            body_stroke.lineTo(0.9611489772796631, -8.736486434936523);
            body_stroke.quadraticCurveTo(1.6804250478744507, -9.995218276977539, 3.0790889263153076, -10.376672744750977);
            body_stroke.quadraticCurveTo(4.477752685546875, -10.758126258850098, 5.736486434936523, -10.038850784301758);
            body_stroke.quadraticCurveTo(6.9952192306518555, -9.319574356079102, 7.376672744750977, -7.920910358428955);
            body_stroke.quadraticCurveTo(7.758126258850098, -6.522246360778809, 7.038850784301758, -5.263513565063477);
            body_stroke.lineTo(3.038851022720337, 1.7364861965179443);
            body_stroke.lineTo(0, 0);
            body_stroke.lineTo(3.5, 0);
            body_stroke.lineTo(3.5, 10);
            body_stroke.quadraticCurveTo(3.499999761581421, 11.449747085571289, 2.4748735427856445, 12.474872589111328);
            body_stroke.quadraticCurveTo(1.4497473239898682, 13.499999046325684, 0, 13.5);
            body_stroke.quadraticCurveTo(-1.4497473239898682, 13.499999046325684, -2.4748735427856445, 12.474872589111328);
            body_stroke.quadraticCurveTo(-3.499999761581421, 11.449747085571289, -3.5, 10);
            body_stroke.closePath();
            body_stroke.moveTo(-3.001225233078003, 1.8007349967956543);
            body_stroke.lineTo(-9.001225471496582, -8.199264526367188);
            body_stroke.quadraticCurveTo(-9.747114181518555, -9.442412376403809, -9.395498275756836, -10.84887409210205);
            body_stroke.quadraticCurveTo(-9.043882369995117, -12.255335807800293, -7.800734996795654, -13.001225471496582);
            body_stroke.quadraticCurveTo(-6.557586193084717, -13.747113227844238, -5.151124954223633, -13.39549732208252);
            body_stroke.quadraticCurveTo(-3.7446634769439697, -13.043882369995117, -2.998774766921997, -11.800735473632812);
            body_stroke.lineTo(3.001225233078003, -1.8007349967956543);
            body_stroke.quadraticCurveTo(3.7471137046813965, -0.5575867295265198, 3.395498275756836, 0.8488747477531433);
            body_stroke.quadraticCurveTo(3.0438828468322754, 2.255336284637451, 1.8007349967956543, 3.001225233078003);
            body_stroke.quadraticCurveTo(0.5575867295265198, 3.7471137046813965, -0.8488747477531433, 3.395498275756836);
            body_stroke.quadraticCurveTo(-2.255336284637451, 3.0438828468322754, -3.001225233078003, 1.8007349967956543);
            body_stroke.closePath();
        }
    }
}

pub const PetalMysteriousStickRenderer = Renderer(MobSuper, false, render, init);

const std = @import("std");
const math = std.math;
const time = std.time;
const Renderer = @import("../Renderer.zig").Renderer;
const body_darken = @import("../Renderer.zig").body_darken;
const RenderContext = @import("../Renderer.zig").RenderContext;
const MobSuper = @import("../../Mob.zig").Super;
const Path2D = @import("../../../../../Kernel/WebAssembly/Interop/Canvas2D/Path2D.zig");
