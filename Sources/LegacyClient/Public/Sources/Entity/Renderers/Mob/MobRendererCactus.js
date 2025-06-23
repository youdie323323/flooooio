"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const MobRenderer_1 = __importDefault(require("./MobRenderer"));
const cactusSpine = (function () {
    const path = new Path2D();
    path.moveTo(10, 0);
    path.lineTo(0.44663524627685547, -2.955202579498291);
    path.lineTo(0.44663524627685547, 2.955203056335449);
    path.lineTo(10, 0);
    path.closePath();
    return path;
})();
const cactusBody = (function () {
    const path = new Path2D();
    path.moveTo(50, 0);
    path.quadraticCurveTo(40.702884674072266, 13.225168228149414, 40.45085144042969, 29.389263153076172);
    path.quadraticCurveTo(25.155765533447266, 34.62394332885742, 15.450848579406738, 47.552825927734375);
    path.quadraticCurveTo(-0.000001287460349885805, 42.797542572021484, -15.450851440429688, 47.552825927734375);
    path.quadraticCurveTo(-25.155765533447266, 34.623939514160156, -40.45085144042969, 29.389259338378906);
    path.quadraticCurveTo(-40.702884674072266, 13.225165367126465, -50, -0.000004371138857095502);
    path.quadraticCurveTo(-40.702884674072266, -13.225172996520996, -40.45084762573242, -29.38926887512207);
    path.quadraticCurveTo(-25.155765533447266, -34.62394332885742, -15.450854301452637, -47.552825927734375);
    path.quadraticCurveTo(8.583068620282575e-7, -42.797542572021484, 15.45085620880127, -47.552825927734375);
    path.quadraticCurveTo(25.155765533447266, -34.62394332885742, 40.45084762573242, -29.389265060424805);
    path.quadraticCurveTo(40.702884674072266, -13.225165367126465, 50, 0.000008742277714191005);
    path.lineTo(50, 0);
    path.closePath();
    return path;
})();
const cactusBodyStroke = (function () {
    const path = new Path2D();
    path.moveTo(52.86328887939453, 2.0128533840179443);
    path.quadraticCurveTo(44.1856689453125, 14.356807708740234, 43.95042419433594, 29.443828582763672);
    path.quadraticCurveTo(43.93316650390625, 30.550823211669922, 43.28240966796875, 31.446510314941406);
    path.quadraticCurveTo(42.631656646728516, 32.34219741821289, 41.58417510986328, 32.7006950378418);
    path.quadraticCurveTo(27.308242797851562, 37.586570739746094, 18.249988555908203, 49.653968811035156);
    path.quadraticCurveTo(17.585350036621094, 50.539398193359375, 16.532405853271484, 50.88152313232422);
    path.quadraticCurveTo(15.479463577270508, 51.2236442565918, 14.42131519317627, 50.897979736328125);
    path.quadraticCurveTo(0, 46.45954895019531, -14.421318054199219, 50.897979736328125);
    path.quadraticCurveTo(-15.479469299316406, 51.22364807128906, -16.532413482666016, 50.881526947021484);
    path.quadraticCurveTo(-17.585355758666992, 50.539405822753906, -18.2499942779541, 49.653968811035156);
    path.quadraticCurveTo(-27.30825424194336, 37.58656311035156, -41.58417510986328, 32.70069122314453);
    path.quadraticCurveTo(-42.631656646728516, 32.342193603515625, -43.282413482666016, 31.44650650024414);
    path.quadraticCurveTo(-43.93316650390625, 30.550819396972656, -43.9504280090332, 29.443824768066406);
    path.quadraticCurveTo(-44.18565368652344, 14.356803894042969, -52.86328887939453, 2.0128512382507324);
    path.quadraticCurveTo(-53.5, 1.1071265935897827, -53.5, -0.000003933906555175781);
    path.quadraticCurveTo(-53.5, -1.1071343421936035, -52.86328887939453, -2.0128579139709473);
    path.quadraticCurveTo(-44.1856689453125, -14.356813430786133, -43.95042419433594, -29.44383430480957);
    path.quadraticCurveTo(-43.93316650390625, -30.550832748413086, -43.28240966796875, -31.446517944335938);
    path.quadraticCurveTo(-42.631656646728516, -32.34220504760742, -41.584171295166016, -32.70069885253906);
    path.quadraticCurveTo(-27.308242797851562, -37.586578369140625, -18.249998092651367, -49.653968811035156);
    path.quadraticCurveTo(-17.585359573364258, -50.539405822753906, -16.53241539001465, -50.881526947021484);
    path.quadraticCurveTo(-15.479471206665039, -51.22364807128906, -14.421321868896484, -50.897979736328125);
    path.quadraticCurveTo(0, -46.45954895019531, 14.421323776245117, -50.897979736328125);
    path.quadraticCurveTo(15.479473114013672, -51.22364807128906, 16.53241539001465, -50.881526947021484);
    path.quadraticCurveTo(17.585359573364258, -50.53940200805664, 18.249998092651367, -49.653968811035156);
    path.quadraticCurveTo(27.308246612548828, -37.586578369140625, 41.584171295166016, -32.70069885253906);
    path.quadraticCurveTo(42.63165283203125, -32.342201232910156, 43.28240966796875, -31.446514129638672);
    path.quadraticCurveTo(43.933162689208984, -30.550827026367188, 43.95042419433594, -29.443832397460938);
    path.quadraticCurveTo(44.1856689453125, -14.356796264648438, 52.86328887939453, -2.01284122467041);
    path.quadraticCurveTo(53.5, -1.1071189641952515, 53.5, 0.000009894371032714844);
    path.quadraticCurveTo(53.5, 1.107138752937317, 52.86328887939453, 2.012861967086792);
    path.lineTo(52.86328887939453, 2.0128533840179443);
    path.closePath();
    path.moveTo(47.13671112060547, -2.0128445625305176);
    path.lineTo(50, 0.000008742277714191005);
    path.lineTo(47.13671112060547, 2.012864112854004);
    path.quadraticCurveTo(37.2200927734375, -12.093551635742188, 36.951271057128906, -29.334697723388672);
    path.lineTo(40.45084762573242, -29.389265060424805);
    path.lineTo(39.31752395629883, -26.077835083007812);
    path.quadraticCurveTo(23.003299713134766, -31.66131591796875, 12.651713371276855, -45.451683044433594);
    path.lineTo(15.45085620880127, -47.552825927734375);
    path.lineTo(16.480388641357422, -44.207672119140625);
    path.quadraticCurveTo(0, -39.135528564453125, -16.48038673400879, -44.207672119140625);
    path.lineTo(-15.450854301452637, -47.552825927734375);
    path.lineTo(-12.651712417602539, -45.451683044433594);
    path.quadraticCurveTo(-23.0032958984375, -31.66131591796875, -39.31752395629883, -26.077836990356445);
    path.lineTo(-40.45084762573242, -29.38926887512207);
    path.lineTo(-36.951271057128906, -29.334699630737305);
    path.quadraticCurveTo(-37.2200927734375, -12.093571662902832, -47.13671112060547, 2.0128490924835205);
    path.lineTo(-50, -0.000004371138857095502);
    path.lineTo(-47.13671112060547, -2.012855052947998);
    path.quadraticCurveTo(-37.22010803222656, 12.093559265136719, -36.95127868652344, 29.334693908691406);
    path.lineTo(-40.45085144042969, 29.389259338378906);
    path.lineTo(-39.317527770996094, 26.07782745361328);
    path.quadraticCurveTo(-23.0032958984375, 31.661300659179688, -12.651708602905273, 45.451683044433594);
    path.lineTo(-15.450851440429688, 47.552825927734375);
    path.lineTo(-16.480382919311523, 44.207672119140625);
    path.quadraticCurveTo(0, 39.135528564453125, 16.48038101196289, 44.207672119140625);
    path.lineTo(15.450848579406738, 47.552825927734375);
    path.lineTo(12.651705741882324, 45.451683044433594);
    path.quadraticCurveTo(23.0032958984375, 31.66130828857422, 39.317527770996094, 26.077831268310547);
    path.lineTo(40.45085144042969, 29.389263153076172);
    path.lineTo(36.95127868652344, 29.334697723388672);
    path.quadraticCurveTo(37.22010803222656, 12.093557357788086, 47.13671112060547, -2.0128533840179443);
    path.lineTo(47.13671112060547, -2.0128445625305176);
    path.closePath();
    return path;
})();
class MobRendererCactus extends MobRenderer_1.default {
    static { this.CACTUS_VECTOR_LENGTH = 38.3971; }
    render(context) {
        // Non-recursive renderer
        // super.render(context);
        const { ctx, entity } = context;
        // Change angle
        ctx.rotate(entity.angle);
        const scale = entity.size / 30;
        ctx.scale(scale, scale);
        ctx.lineJoin = "round";
        {
            ctx.fillStyle = this.toEffectedColor(context, "#292929");
            /*
            for (let i = 0; i < 10; i++) {
                const angle = -Math.PI + (Math.PI / 5) * i;

                const x = MobRendererCactus.CACTUS_VECTOR_LENGTH * Math.cos(angle);
                const y = MobRendererCactus.CACTUS_VECTOR_LENGTH * Math.sin(angle);

                ctx.save();

                ctx.translate(x, y);
                ctx.rotate(angle);

                ctx.fill(cactusSpine, "nonzero");

                ctx.restore();
            }
            */
            {
                ctx.save();
                ctx.translate(-38.3971, -4.702288561154084e-15);
                ctx.rotate(-3.141592653589793);
                ctx.fill(cactusSpine, "nonzero");
                ctx.restore();
            }
            {
                ctx.save();
                ctx.translate(-31.06390643471429, -22.569249110799326);
                ctx.rotate(-2.5132741228718345);
                ctx.fill(cactusSpine, "nonzero");
                ctx.restore();
            }
            {
                ctx.save();
                ctx.translate(-11.865356434714291, -36.517812161836645);
                ctx.rotate(-1.8849555921538759);
                ctx.fill(cactusSpine, "nonzero");
                ctx.restore();
            }
            {
                ctx.save();
                ctx.translate(11.865356434714295, -36.517812161836645);
                ctx.rotate(-1.2566370614359172);
                ctx.fill(cactusSpine, "nonzero");
                ctx.restore();
            }
            {
                ctx.save();
                ctx.translate(31.063906434714298, -22.569249110799323);
                ctx.rotate(-0.6283185307179586);
                ctx.fill(cactusSpine, "nonzero");
                ctx.restore();
            }
            {
                ctx.save();
                ctx.translate(38.3971, 0);
                ctx.rotate(0);
                ctx.fill(cactusSpine, "nonzero");
                ctx.restore();
            }
            {
                ctx.save();
                ctx.translate(31.063906434714298, 22.569249110799323);
                ctx.rotate(0.6283185307179586);
                ctx.fill(cactusSpine, "nonzero");
                ctx.restore();
            }
            {
                ctx.save();
                ctx.translate(11.865356434714295, 36.517812161836645);
                ctx.rotate(1.2566370614359172);
                ctx.fill(cactusSpine, "nonzero");
                ctx.restore();
            }
            {
                ctx.save();
                ctx.translate(-11.865356434714291, 36.517812161836645);
                ctx.rotate(1.8849555921538759);
                ctx.fill(cactusSpine, "nonzero");
                ctx.restore();
            }
            {
                ctx.save();
                ctx.translate(-31.06390643471429, 22.569249110799326);
                ctx.rotate(2.5132741228718345);
                ctx.fill(cactusSpine, "nonzero");
                ctx.restore();
            }
        }
        {
            ctx.scale(0.8, 0.8);
            ctx.fillStyle = this.toEffectedColor(context, "#32A852");
            ctx.fill(cactusBody, "nonzero");
            ctx.fillStyle = this.toEffectedColor(context, "#288842");
            ctx.fill(cactusBodyStroke, "nonzero");
        }
    }
}
exports.default = MobRendererCactus;
