var body: Path2D = undefined;
var body_stroke: Path2D = undefined;

fn render(rctx: *RenderContext(MobSuper)) void {
    const ctx = rctx.ctx;
    const entity = rctx.entity;

    const fcolor = rctx.blendEffectColors(comptime .comptimeFromHex(0xFFFFFF));
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
            body.moveTo(11, 0);
            body.quadraticCurveTo(4.319756031036377, 3.138486623764038, 3.399186611175537, 10.46162223815918);
            body.quadraticCurveTo(-1.6500004529953003, 5.0781779289245605, -8.899188041687012, 6.46563720703125);
            body.quadraticCurveTo(-5.339512348175049, -5.722046125811175e-7, -8.899186134338379, -6.465639114379883);
            body.quadraticCurveTo(-1.6499993801116943, -5.078178405761719, 3.399188280105591, -10.461621284484863);
            body.quadraticCurveTo(4.319756507873535, -3.138485908508301, 11, 0.000001923301169881597);
            body.lineTo(11, 0);
            body.closePath();
        }

        {
            body_stroke.moveTo(11.637837409973145, 1.3576316833496094);
            body_stroke.quadraticCurveTo(5.705039978027344, 4.144955158233643, 4.8874735832214355, 10.648710250854492);
            body_stroke.quadraticCurveTo(4.80997896194458, 11.265178680419922, 4.319272994995117, 11.646289825439453);
            body_stroke.quadraticCurveTo(3.8285670280456543, 12.027402877807617, 3.2120985984802246, 11.949909210205078);
            body_stroke.quadraticCurveTo(2.951880931854248, 11.917197227478027, 2.71820068359375, 11.798131942749023);
            body_stroke.quadraticCurveTo(2.484520435333252, 11.679065704345703, 2.3051047325134277, 11.487772941589355);
            body_stroke.quadraticCurveTo(-2.1791319847106934, 6.7066802978515625, -8.617212295532227, 7.9388957023620605);
            body_stroke.quadraticCurveTo(-9.227456092834473, 8.055692672729492, -9.741552352905273, 7.70677375793457);
            body_stroke.quadraticCurveTo(-10.255647659301758, 7.357854843139648, -10.372446060180664, 6.7476115226745605);
            body_stroke.quadraticCurveTo(-10.421747207641602, 6.490021705627441, -10.380720138549805, 6.230985164642334);
            body_stroke.quadraticCurveTo(-10.339693069458008, 5.971948623657227, -10.213205337524414, 5.742201328277588);
            body_stroke.quadraticCurveTo(-7.05181884765625, 0.0000019073486328125, -10.213203430175781, -5.742203712463379);
            body_stroke.quadraticCurveTo(-10.512859344482422, -6.286487102508545, -10.339881896972656, -6.883243560791016);
            body_stroke.quadraticCurveTo(-10.16690444946289, -7.479999542236328, -9.622621536254883, -7.779656410217285);
            body_stroke.quadraticCurveTo(-9.392873764038086, -7.906144142150879, -9.133837699890137, -7.947171211242676);
            body_stroke.quadraticCurveTo(-8.874801635742188, -7.988198757171631, -8.61721134185791, -7.938897609710693);
            body_stroke.quadraticCurveTo(-2.1791305541992188, -6.7066802978515625, 2.3051064014434814, -11.487771987915039);
            body_stroke.quadraticCurveTo(2.730151891708374, -11.940954208374023, 3.351153612136841, -11.960851669311523);
            body_stroke.quadraticCurveTo(3.9721550941467285, -11.98074722290039, 4.4253387451171875, -11.555703163146973);
            body_stroke.quadraticCurveTo(4.616631984710693, -11.376287460327148, 4.7356977462768555, -11.142606735229492);
            body_stroke.quadraticCurveTo(4.854763984680176, -10.908926010131836, 4.88747501373291, -10.648709297180176);
            body_stroke.quadraticCurveTo(5.705043792724609, -4.144950866699219, 11.637837409973145, -1.3576295375823975);
            body_stroke.quadraticCurveTo(12.200185775756836, -1.0934284925460815, 12.411008834838867, -0.5089691877365112);
            body_stroke.quadraticCurveTo(12.621831893920898, 0.0754900872707367, 12.35763168334961, 0.6378394365310669);
            body_stroke.quadraticCurveTo(12.246109008789062, 0.8752124905586243, 12.060660362243652, 1.060662031173706);
            body_stroke.quadraticCurveTo(11.87520980834961, 1.2461116313934326, 11.637837409973145, 1.3576335906982422);
            body_stroke.lineTo(11.637837409973145, 1.3576316833496094);
            body_stroke.closePath();
            body_stroke.moveTo(10.362162590026855, -1.3576297760009766);
            body_stroke.lineTo(11, 0.000001923301169881597);
            body_stroke.lineTo(10.362162590026855, 1.357633352279663);
            body_stroke.quadraticCurveTo(2.9344711303710938, -2.1320152282714844, 1.9109013080596924, -10.27453327178955);
            body_stroke.lineTo(3.399188280105591, -10.461621284484863);
            body_stroke.lineTo(4.493269920349121, -9.435470581054688);
            body_stroke.quadraticCurveTo(-1.1208686828613281, -3.449678421020508, -9.181160926818848, -4.992380619049072);
            body_stroke.lineTo(-8.899186134338379, -6.465639114379883);
            body_stroke.lineTo(-7.585168838500977, -7.189074516296387);
            body_stroke.quadraticCurveTo(-3.6272048950195312, 0, -7.585171222686768, 7.189073085784912);
            body_stroke.lineTo(-8.899188041687012, 6.46563720703125);
            body_stroke.lineTo(-9.181161880493164, 4.9923787117004395);
            body_stroke.quadraticCurveTo(-1.1208667755126953, 3.449676513671875, 4.4932684898376465, 9.435471534729004);
            body_stroke.lineTo(3.399186611175537, 10.46162223815918);
            body_stroke.lineTo(1.9108996391296387, 10.274534225463867);
            body_stroke.quadraticCurveTo(2.934467315673828, 2.1320183277130127, 10.362162590026855, -1.3576316833496094);
            body_stroke.lineTo(10.362162590026855, -1.3576297760009766);
            body_stroke.closePath();
        }
    }
}

pub const PetalWebRenderer = Renderer(MobSuper, false, render, init);

const std = @import("std");
const math = std.math;
const time = std.time;

const Path2D = @import("../../../../../Kernel/WebAssembly/Interop/Canvas2D/Path2D.zig");
const Renderer = @import("../Renderer.zig").Renderer;
const body_darken = @import("../Renderer.zig").body_darken;
const RenderContext = @import("../Renderer.zig").RenderContext;
const MobSuper = @import("../../Mob.zig").Super;
