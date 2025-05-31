import type Mob from "../../Mob";
import type { RenderingContext } from "../RendererRenderingContext";
import AbstractMobRenderer from "./MobRenderer";

const crabHand = (function () {
    const path = new Path2D();

    path.moveTo(0, -14);
    path.quadraticCurveTo(11, -20, 16, -9);
    path.lineTo(11, -12);
    path.lineTo(13, -7);
    path.quadraticCurveTo(6, -13, 0, -10);
    path.lineTo(0, -14);
    path.closePath();

    return path;
})();

const crabHandStroke = (function () {
    const path = new Path2D();

    path.moveTo(-0.47885212302207947, -14.87789535522461);
    path.quadraticCurveTo(5.39346981048584, -18.080978393554688, 9.798274993896484, -16.704479217529297);
    path.quadraticCurveTo(14.22525405883789, -15.321048736572266, 16.91036605834961, -9.413803100585938);
    path.quadraticCurveTo(17.081768035888672, -9.03671646118164, 16.936328887939453, -8.648876190185547);
    path.quadraticCurveTo(16.7908878326416, -8.261035919189453, 16.413803100585938, -8.08963394165039);
    path.quadraticCurveTo(16.189319610595703, -7.98759651184082, 15.943134307861328, -8.001618385314941);
    path.quadraticCurveTo(15.696948051452637, -8.015640258789062, 15.485504150390625, -8.142507553100586);
    path.lineTo(10.485504150390625, -11.142507553100586);
    path.lineTo(11, -12);
    path.lineTo(11.928476333618164, -12.371390342712402);
    path.lineTo(13.928476333618164, -7.3713908195495605);
    path.quadraticCurveTo(14.082310676574707, -6.986802577972412, 13.919143676757812, -6.606080055236816);
    path.quadraticCurveTo(13.755977630615234, -6.225358009338379, 13.371390342712402, -6.071523189544678);
    path.quadraticCurveTo(13.112142562866211, -5.9678239822387695, 12.836674690246582, -6.013427257537842);
    path.quadraticCurveTo(12.561206817626953, -6.059030532836914, 12.34920883178711, -6.240743637084961);
    path.quadraticCurveTo(5.853340148925781, -11.808631896972656, 0.4472135901451111, -9.105572700500488);
    path.quadraticCurveTo(0.07672972977161407, -8.920330047607422, -0.3162277340888977, -9.051316261291504);
    path.quadraticCurveTo(-0.7091852426528931, -9.182302474975586, -0.8944271802902222, -9.552786827087402);
    path.quadraticCurveTo(-0.9464979767799377, -9.656928062438965, -0.9732489585876465, -9.770246505737305);
    path.quadraticCurveTo(-0.9999999403953552, -9.883565902709961, -0.9999999403953552, -10);
    path.lineTo(-1, -14);
    path.quadraticCurveTo(-1, -14.274457931518555, -0.8598988056182861, -14.510464668273926);
    path.quadraticCurveTo(-0.7197977304458618, -14.74647045135498, -0.47885212302207947, -14.87789535522461);
    path.closePath();
    path.moveTo(0.47885212302207947, -13.12210464477539);
    path.lineTo(0, -14);
    path.lineTo(1, -14);
    path.lineTo(1, -10);
    path.lineTo(0, -10);
    path.lineTo(-0.4472135901451111, -10.894427299499512);
    path.quadraticCurveTo(6.14666748046875, -14.191360473632812, 13.65079116821289, -7.759256362915039);
    path.lineTo(13, -7);
    path.lineTo(12.071523666381836, -6.6286091804504395);
    path.lineTo(10.071523666381836, -11.628609657287598);
    path.quadraticCurveTo(9.98447322845459, -11.846231460571289, 10.003193855285645, -12.079870223999023);
    path.quadraticCurveTo(10.021915435791016, -12.313508987426758, 10.142507553100586, -12.514495849609375);
    path.quadraticCurveTo(10.35561752319336, -12.869680404663086, 10.757463455200195, -12.970141410827637);
    path.quadraticCurveTo(11.159309387207031, -13.070602416992188, 11.514495849609375, -12.857492446899414);
    path.lineTo(16.514495849609375, -9.857492446899414);
    path.lineTo(16, -9);
    path.lineTo(15.08963394165039, -8.586196899414062);
    path.quadraticCurveTo(12.77474594116211, -13.678951263427734, 9.201725006103516, -14.795519828796387);
    path.quadraticCurveTo(5.606527328491211, -15.919017791748047, 0.47885212302207947, -13.12210464477539);
    path.closePath();

    return path;
})();

const crabBody = (function () {
    const path = new Path2D();

    path.moveTo(0, -23);
    path.quadraticCurveTo(-7.455843925476074, -23, -12.727921485900879, -16.26345443725586);
    path.quadraticCurveTo(-18, -9.526911735534668, -18, 0);
    path.quadraticCurveTo(-18, 9.526911735534668, -12.727921485900879, 16.26345443725586);
    path.quadraticCurveTo(-7.455843925476074, 23, 0, 23);
    path.quadraticCurveTo(7.455843925476074, 23, 12.727921485900879, 16.26345443725586);
    path.quadraticCurveTo(18, 9.526911735534668, 18, 0);
    path.quadraticCurveTo(18, -9.526911735534668, 12.727921485900879, -16.26345443725586);
    path.quadraticCurveTo(7.455843925476074, -23, 0, -23);
    path.closePath();

    return path;
})();

const crabBodyStroke = (function () {
    const path = new Path2D();

    path.moveTo(0, -21);
    path.quadraticCurveTo(-6.4813947677612305, -20.999996185302734, -11.152910232543945, -15.030839920043945);
    path.quadraticCurveTo(-16, -8.837337493896484, -16, 0);
    path.quadraticCurveTo(-16, 8.837334632873535, -11.152910232543945, 15.030839920043945);
    path.quadraticCurveTo(-6.481395721435547, 21, 0, 21);
    path.quadraticCurveTo(6.4813947677612305, 20.999996185302734, 11.152910232543945, 15.030839920043945);
    path.quadraticCurveTo(16, 8.837337493896484, 16, 0);
    path.quadraticCurveTo(16, -8.837334632873535, 11.152910232543945, -15.030839920043945);
    path.quadraticCurveTo(6.481395721435547, -21, 0, -21);
    path.closePath();
    path.moveTo(0, -25);
    path.quadraticCurveTo(8.430290222167969, -25, 14.30293083190918, -17.49607276916504);
    path.quadraticCurveTo(20, -10.216482162475586, 20, 0);
    path.quadraticCurveTo(20, 10.216480255126953, 14.30293083190918, 17.49607276916504);
    path.quadraticCurveTo(8.430294036865234, 25, 0, 25);
    path.quadraticCurveTo(-8.430290222167969, 25, -14.30293083190918, 17.49607276916504);
    path.quadraticCurveTo(-20, 10.216482162475586, -20, 0);
    path.quadraticCurveTo(-20, -10.216480255126953, -14.30293083190918, -17.49607276916504);
    path.quadraticCurveTo(-8.430294036865234, -25, 0, -25);
    path.closePath();

    return path;
})();

export default class MobRendererCrab extends AbstractMobRenderer {
    override render(context: RenderingContext<Mob>): void {
        // Non-recursive renderer
        // super.render(context);

        const { ctx, entity } = context;

        // Change angle
        ctx.rotate(entity.angle);

        const scale = entity.size / 25;
        ctx.scale(scale, scale);

        ctx.lineJoin = ctx.lineCap = "round";

        { // Draw legs
            ctx.lineWidth = 5;
            ctx.strokeStyle = "#4D2621";

            ctx.beginPath();

            for (let dir = -1; dir <= 1; dir += 2) {
                for (let i = 0; i < 4; i++) {
                    const legRotation = 0.15 * Math.sin(entity.moveCounter + dir + 2 * i) + 0.15;
                    const legDir = i < 2 ? 1 : -1;

                    ctx.save();

                    ctx.scale(1, dir);

                    ctx.translate(i / 5 * 20 - 5, 0);

                    ctx.rotate(legRotation * legDir);

                    ctx.moveTo(0, 0);
                    ctx.translate(0, 25);
                    ctx.lineTo(0, 0);
                    ctx.rotate(legDir * 0.7 * (legRotation + 0.3));
                    ctx.lineTo(0, 10);

                    ctx.restore();
                }
            }

            ctx.stroke();
        }

        { // Draw hand
            ctx.fillStyle = ctx.strokeStyle = "#4D2621";
            ctx.lineWidth = 2;

            const clawAngle = 0.15 * Math.sin(entity.moveCounter * 2) + 0.15;

            for (let dir = -1; dir <= 1; dir += 2) {
                ctx.save();

                ctx.translate(12, 2 * dir);
                ctx.scale(1, -dir);
                ctx.rotate(clawAngle);

                ctx.fill(crabHand, "nonzero");
                ctx.fill(crabHandStroke, "nonzero");

                ctx.restore();
            }
        }

        { // Draw body
            ctx.save();

            const shellColor = this.toEffectedColor(context, "#DB6F4B");

            ctx.fillStyle = shellColor;
            ctx.fill(crabBody, "nonzero");

            const strokeColor = this.toEffectedColor(context, "#B15A3D");

            ctx.fillStyle = strokeColor;
            ctx.fill(crabBodyStroke, "nonzero");

            { // Draw body wrinkle
                ctx.strokeStyle = strokeColor;
                ctx.lineWidth = 4;

                ctx.beginPath();

                ctx.moveTo(-10, 8);
                ctx.quadraticCurveTo(0, 3, 10, 8);

                ctx.stroke();

                ctx.beginPath();

                ctx.moveTo(-10, -8);
                ctx.quadraticCurveTo(0, -3, 10, -8);

                ctx.stroke();
            }

            ctx.restore();
        }
    }
}