"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const MobRenderer_1 = __importDefault(require("./MobRenderer"));
const TAU = 2 * Math.PI;
const LADYBUG_NUM_SPOTS = 3;
const LADYBUG_MIN_SPOT_RADIUS = 1;
const LADYBUG_MAX_SPOT_RADIUS = 10;
const LADYBUG_RADIUS = 25;
function seededRandom3(seed, baseIndex) {
    const x = Math.sin(seed * 9999 + baseIndex) * 10000;
    const fraction = x - Math.floor(x);
    return [
        fraction * 3 % 1,
        (fraction * 3 + 1) % 1,
        (fraction * 3 + 2) % 1,
    ];
}
const shinyLadybugBody = (function () {
    const path = new Path2D();
    path.moveTo(24.760068893432617, 16.939273834228516);
    path.quadraticCurveTo(17.74359130859375, 27.195228576660156, 5.530137062072754, 29.485885620117188);
    path.quadraticCurveTo(-6.683317184448242, 31.77654266357422, -16.939273834228516, 24.760068893432617);
    path.quadraticCurveTo(-27.195228576660156, 17.74359130859375, -29.485885620117188, 5.530137062072754);
    path.quadraticCurveTo(-31.77654266357422, -6.683317184448242, -24.760068893432617, -16.939273834228516);
    path.quadraticCurveTo(-17.74359130859375, -27.195228576660156, -5.530137062072754, -29.485885620117188);
    path.quadraticCurveTo(6.683317184448242, -31.77654266357422, 16.939273834228516, -24.760068893432617);
    path.quadraticCurveTo(19.241104125976562, -23.185302734375, 21.213199615478516, -21.213207244873047);
    path.quadraticCurveTo(23.18529510498047, -19.241111755371094, 24.76006507873535, -16.939281463623047);
    path.quadraticCurveTo(10, 0, 24.760068893432617, 16.939273834228516);
    path.closePath();
    return path;
})();
const shinyLadybugBodyStroke = (function () {
    const path = new Path2D();
    path.moveTo(27.64874267578125, 18.915523529052734);
    path.quadraticCurveTo(19.813682556152344, 30.36800765991211, 6.175320625305176, 32.925907135009766);
    path.quadraticCurveTo(-7.463029861450195, 35.48381042480469, -18.91551971435547, 27.648746490478516);
    path.quadraticCurveTo(-30.36800765991211, 19.813682556152344, -32.925907135009766, 6.175320625305176);
    path.quadraticCurveTo(-35.48381042480469, -7.463029861450195, -27.648746490478516, -18.91551971435547);
    path.quadraticCurveTo(-19.813682556152344, -30.36800765991211, -6.175320625305176, -32.925907135009766);
    path.quadraticCurveTo(7.463029861450195, -35.48381042480469, 18.91551971435547, -27.648746490478516);
    path.quadraticCurveTo(24.10110092163086, -24.101102828979492, 27.648740768432617, -18.915529251098633);
    path.quadraticCurveTo(28.323867797851562, -17.928699493408203, 28.25410270690918, -16.73506736755371);
    path.quadraticCurveTo(28.18433952331543, -15.541435241699219, 27.398849487304688, -14.639973640441895);
    path.quadraticCurveTo(14.642288208007812, 0, 27.398853302001953, 14.639965057373047);
    path.quadraticCurveTo(28.184345245361328, 15.541427612304688, 28.254108428955078, 16.735061645507812);
    path.quadraticCurveTo(28.323871612548828, 17.928693771362305, 27.64874267578125, 18.9155216217041);
    path.lineTo(27.64874267578125, 18.915523529052734);
    path.closePath();
    path.moveTo(21.871395111083984, 14.963025093078613);
    path.lineTo(24.760068893432617, 16.939273834228516);
    path.lineTo(22.12128448486328, 19.238582611083984);
    path.quadraticCurveTo(5.3577117919921875, 0, 22.121280670166016, -19.238590240478516);
    path.lineTo(24.76006507873535, -16.939281463623047);
    path.lineTo(21.871389389038086, -14.963033676147461);
    path.quadraticCurveTo(19.065046310424805, -19.0650577545166, 14.96302318572998, -21.871395111083984);
    path.quadraticCurveTo(5.903592586517334, -28.06928253173828, -4.884955406188965, -26.045866012573242);
    path.quadraticCurveTo(-15.673511505126953, -24.022449493408203, -21.871395111083984, -14.96302318572998);
    path.quadraticCurveTo(-28.06928253173828, -5.903592586517334, -26.045866012573242, 4.884955406188965);
    path.quadraticCurveTo(-24.022449493408203, 15.673511505126953, -14.96302318572998, 21.871395111083984);
    path.quadraticCurveTo(-5.903592586517334, 28.06928253173828, 4.884955406188965, 26.045866012573242);
    path.quadraticCurveTo(15.673511505126953, 24.022449493408203, 21.871395111083984, 14.963025093078613);
    path.closePath();
    return path;
})();
class MobRendererShinyLadybug extends MobRenderer_1.default {
    render(context) {
        // Non-recursive renderer
        // super.render(context);
        const { ctx, entity } = context;
        // Change angle
        ctx.rotate(entity.angle);
        const scale = entity.size / 30;
        ctx.scale(scale, scale);
        const bodyColor = this.toEffectedColor(context, "#EBEB34");
        const bodyStrokeColor = this.toEffectedColor(context, "#0E0E0E");
        const bodyStrokeStrokeColor = this.toEffectedColor(context, "#111111");
        ctx.lineJoin = "round";
        {
            ctx.beginPath();
            ctx.arc(15, 0, 18.5, 0, TAU, false);
            ctx.fillStyle = bodyStrokeColor;
            ctx.fill();
        }
        {
            ctx.beginPath();
            ctx.arc(15, 0, 11.5, 0, TAU, false);
            ctx.fillStyle = bodyStrokeStrokeColor;
            ctx.fill();
        }
        ctx.fillStyle = bodyColor;
        ctx.fill(shinyLadybugBody, "nonzero");
        {
            ctx.save();
            ctx.clip(shinyLadybugBody);
            ctx.fillStyle = bodyStrokeStrokeColor;
            for (let i = 0; i < LADYBUG_NUM_SPOTS; i++) {
                const [rx, ry, rRadius] = seededRandom3(entity.id, i);
                const x = (rx * 2 - 1) * LADYBUG_RADIUS;
                const y = (ry * 2 - 1) * LADYBUG_RADIUS;
                const radius = LADYBUG_MIN_SPOT_RADIUS + rRadius * (LADYBUG_MAX_SPOT_RADIUS - LADYBUG_MIN_SPOT_RADIUS);
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, TAU, false);
                ctx.fill();
            }
            ctx.restore();
        }
        ctx.fillStyle = this.toEffectedColor(context, "#BEBE2A");
        ctx.fill(shinyLadybugBodyStroke, "nonzero");
    }
}
exports.default = MobRendererShinyLadybug;
