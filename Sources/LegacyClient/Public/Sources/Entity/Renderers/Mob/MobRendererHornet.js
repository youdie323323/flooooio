"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const MobRenderer_1 = __importDefault(require("./MobRenderer"));
const MobRendererMissileProjectile_1 = require("./Projectile/MobRendererMissileProjectile");
const hornetBody = (function () {
    const path = new Path2D();
    path.moveTo(30, 0);
    path.quadraticCurveTo(29.999996185302734, 8.284271240234375, 21.21320152282715, 14.142135620117188);
    path.quadraticCurveTo(12.426405906677246, 20, 0, 20);
    path.quadraticCurveTo(-12.426405906677246, 20, -21.21320152282715, 14.142135620117188);
    path.quadraticCurveTo(-29.999996185302734, 8.284271240234375, -30, 0);
    path.quadraticCurveTo(-29.999996185302734, -8.284271240234375, -21.21320152282715, -14.142135620117188);
    path.quadraticCurveTo(-12.426405906677246, -20, 0, -20);
    path.quadraticCurveTo(12.426405906677246, -20, 21.21320152282715, -14.142135620117188);
    path.quadraticCurveTo(29.999996185302734, -8.284271240234375, 30, 0);
    return path;
})();
const hornetPattern1 = (function () {
    const path = new Path2D();
    path.moveTo(20, -14.907119750976562);
    path.lineTo(20, 14.907119750976562);
    path.quadraticCurveTo(17.813514709472656, 16.210886001586914, 15.289612770080566, 17.207592010498047);
    path.quadraticCurveTo(12.765708923339844, 18.204296112060547, 10, 18.85618019104004);
    path.lineTo(10, -18.85618019104004);
    path.quadraticCurveTo(12.765708923339844, -18.204296112060547, 15.28961181640625, -17.207592010498047);
    path.quadraticCurveTo(17.813514709472656, -16.210886001586914, 20, -14.907119750976562);
    path.closePath();
    return path;
})();
const hornetPattern2 = (function () {
    const path = new Path2D();
    path.moveTo(-10, -18.85618019104004);
    path.quadraticCurveTo(-7.591191291809082, -19.42394256591797, -5.07305908203125, -19.711971282958984);
    path.quadraticCurveTo(-2.554927110671997, -20, 0, -20);
    path.lineTo(0, 20);
    path.quadraticCurveTo(-2.554927110671997, 20, -5.07305908203125, 19.711971282958984);
    path.quadraticCurveTo(-7.591191291809082, 19.42394256591797, -10, 18.85618019104004);
    path.lineTo(-10, -18.85618019104004);
    path.closePath();
    return path;
})();
const hornetPattern3 = (function () {
    const path = new Path2D();
    path.moveTo(-20, 14.907119750976562);
    path.quadraticCurveTo(-24.77225685119629, 12.06149673461914, -27.386127471923828, 8.164966583251953);
    path.quadraticCurveTo(-30, 4.268435478210449, -30, 0);
    path.quadraticCurveTo(-30, -4.268435478210449, -27.38612937927246, -8.164966583251953);
    path.quadraticCurveTo(-24.77225685119629, -12.06149673461914, -20, -14.907119750976562);
    path.lineTo(-20, 14.907119750976562);
    path.closePath();
    return path;
})();
const hornetBodyStroke = (function () {
    const path = new Path2D();
    path.moveTo(32.5, 0);
    path.quadraticCurveTo(32.5, 9.62222671508789, 22.59995460510254, 16.222261428833008);
    path.quadraticCurveTo(13.183349609375, 22.500003814697266, 0, 22.5);
    path.quadraticCurveTo(-13.183344841003418, 22.5, -22.59995460510254, 16.222261428833008);
    path.quadraticCurveTo(-32.5, 9.622234344482422, -32.5, 0);
    path.quadraticCurveTo(-32.5, -9.62222671508789, -22.59995460510254, -16.222261428833008);
    path.quadraticCurveTo(-13.183349609375, -22.500003814697266, 0, -22.5);
    path.quadraticCurveTo(13.183344841003418, -22.5, 22.59995460510254, -16.222261428833008);
    path.quadraticCurveTo(32.5, -9.622234344482422, 32.5, 0);
    path.quadraticCurveTo(32.499996185302734, 1.0355339050292969, 31.767765045166016, 1.7677669525146484);
    path.quadraticCurveTo(31.03553009033203, 2.5, 30, 2.5);
    path.quadraticCurveTo(28.964462280273438, 2.5, 28.23223114013672, 1.7677669525146484);
    path.quadraticCurveTo(27.499996185302734, 1.0355339050292969, 27.5, 0);
    path.quadraticCurveTo(27.500003814697266, -6.946311950683594, 19.826452255249023, -12.062009811401367);
    path.quadraticCurveTo(11.669464111328125, -17.5, 0, -17.5);
    path.quadraticCurveTo(-11.66946029663086, -17.5, -19.826452255249023, -12.062009811401367);
    path.quadraticCurveTo(-27.499996185302734, -6.946311950683594, -27.5, 0);
    path.quadraticCurveTo(-27.500003814697266, 6.946311950683594, -19.826452255249023, 12.062009811401367);
    path.quadraticCurveTo(-11.669464111328125, 17.5, 0, 17.5);
    path.quadraticCurveTo(11.66946029663086, 17.5, 19.826452255249023, 12.062009811401367);
    path.quadraticCurveTo(27.499996185302734, 6.946311950683594, 27.5, 0);
    path.quadraticCurveTo(27.499996185302734, -1.0355339050292969, 28.23223114013672, -1.7677669525146484);
    path.quadraticCurveTo(28.964462280273438, -2.5, 30, -2.5);
    path.quadraticCurveTo(31.03553009033203, -2.5, 31.767765045166016, -1.7677669525146484);
    path.quadraticCurveTo(32.499996185302734, -1.0355339050292969, 32.5, 0);
    path.closePath();
    return path;
})();
const antennae = (function () {
    const path = new Path2D();
    path.moveTo(-0.47434163093566895, 1.4230250120162964);
    path.quadraticCurveTo(-0.9337265491485596, 1.2698967456817627, -1.2168631553649902, 0.8770654201507568);
    path.quadraticCurveTo(-1.5, 0.4842342138290405, -1.5, 0);
    path.quadraticCurveTo(-1.5, -0.6213203072547913, -1.0606601238250732, -1.0606601238250732);
    path.quadraticCurveTo(-0.6213203072547913, -1.5, 0, -1.5);
    path.quadraticCurveTo(15.621322631835938, -1.5, 26.060659408569336, 8.939339637756348);
    path.quadraticCurveTo(26.403064727783203, 9.281744956970215, 26.48063087463379, 9.759726524353027);
    path.quadraticCurveTo(26.558197021484375, 10.23770809173584, 26.34164047241211, 10.670820236206055);
    path.quadraticCurveTo(26.06377601623535, 11.226545333862305, 25.47433853149414, 11.423023223876953);
    path.quadraticCurveTo(24.884902954101562, 11.619503021240234, 24.329179763793945, 11.34164047241211);
    path.quadraticCurveTo(14.424531936645508, 6.389315605163574, -0.47434163093566895, 1.4230250120162964);
    path.closePath();
    return path;
})();
const TAU = 2 * Math.PI;
class MobRendererHornet extends MobRenderer_1.default {
    render(context) {
        // Non-recursive renderer
        // super.render(context);
        const { ctx, entity } = context;
        // Change angle
        ctx.rotate(entity.angle);
        const scale = entity.size / 25;
        ctx.scale(scale, scale);
        ctx.lineJoin = ctx.lineCap = "round";
        ctx.lineWidth = 5;
        const missileColor = this.toEffectedColor(context, "#333333");
        { // Draw missile
            ctx.save();
            ctx.translate(-38.55711364746094, 0);
            ctx.rotate(Math.PI);
            ctx.fillStyle = missileColor;
            ctx.fill(MobRendererMissileProjectile_1.missileBody, "nonzero");
            ctx.fill(MobRendererMissileProjectile_1.missileBodyStroke, "nonzero");
            ctx.restore();
        }
        {
            ctx.save();
            ctx.fillStyle = this.toEffectedColor(context, "#FFD363");
            ctx.fill(hornetBody, "nonzero");
            ctx.fillStyle = missileColor;
            ctx.fill(hornetPattern1, "evenodd");
            ctx.fill(hornetPattern2, "evenodd");
            ctx.fill(hornetPattern3, "evenodd");
            ctx.fillStyle = this.toEffectedColor(context, "#D3AD46");
            ctx.fill(hornetBodyStroke, "nonzero");
            ctx.restore();
        }
        {
            ctx.fillStyle = missileColor;
            for (let dir = -1; dir <= 1; dir += 2) {
                ctx.save();
                ctx.translate(25, dir * 5);
                ctx.scale(1, dir);
                ctx.fill(antennae, "evenodd");
                ctx.restore();
            }
        }
    }
}
exports.default = MobRendererHornet;
