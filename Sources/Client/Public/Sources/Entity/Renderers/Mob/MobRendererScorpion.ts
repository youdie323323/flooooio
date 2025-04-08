import type Mob from "../../Mob";
import type { RenderingContext } from "../RendererRenderingContext";
import AbstractMobRenderer from "./MobRenderer";

const scorpionTail = (function () {
    const path = new Path2D();

    path.moveTo(0.6085600256919861, 36.22243881225586);
    path.bezierCurveTo(0.834030032157898, 59.97243881225586, 9.074830055236816, 71.84744262695312, 32.05949020385742, 71.72244262695312);
    path.bezierCurveTo(55.044151306152344, 71.59744262695312, 83.05949401855469, 58.722442626953125, 92.48587036132812, 36.222442626953125);
    path.bezierCurveTo(78.25892639160156, -0.24285000562667847, -2.8690900802612305, -21.410219192504883, 0.6085600256919861, 36.22243881225586);
    path.closePath();

    return path;
})();

const scorpionTailStroke = (function () {
    const path = new Path2D();

    path.moveTo(8.108222007751465, 36.151241302490234);
    path.quadraticCurveTo(8.25671672821045, 51.79310607910156, 13.548282623291016, 58.108978271484375);
    path.quadraticCurveTo(18.73090362548828, 64.2948226928711, 32.018699645996094, 64.2225570678711);
    path.quadraticCurveTo(48.49220275878906, 64.13297271728516, 63.757965087890625, 55.78304672241211);
    path.quadraticCurveTo(79.84596252441406, 46.98338317871094, 85.56841278076172, 33.32437515258789);
    path.lineTo(92.48587036132812, 36.222442626953125);
    path.lineTo(85.49881744384766, 38.94844436645508);
    path.quadraticCurveTo(81.18331146240234, 27.887290954589844, 67.55020141601562, 19.021472930908203);
    path.quadraticCurveTo(54.011810302734375, 10.217248916625977, 38.99715042114258, 8.380192756652832);
    path.quadraticCurveTo(24.207897186279297, 6.570713043212891, 16.02060890197754, 12.762636184692383);
    path.quadraticCurveTo(7.113079071044922, 19.499269485473633, 8.094919204711914, 35.77069854736328);
    path.quadraticCurveTo(8.100666046142578, 35.8657341003418, 8.103991508483887, 35.96088409423828);
    path.quadraticCurveTo(8.107316970825195, 36.05603790283203, 8.108221054077148, 36.151241302490234);
    path.lineTo(8.108222007751465, 36.151241302490234);
    path.closePath();
    path.moveTo(-6.891101837158203, 36.293636322021484);
    path.lineTo(0.6085600256919861, 36.22243881225586);
    path.lineTo(-6.877847194671631, 36.674171447753906);
    path.quadraticCurveTo(-8.34365463256836, 12.38224983215332, 6.972555637359619, 0.7988262176513672);
    path.quadraticCurveTo(20.002670288085938, -9.055655479431152, 40.81882858276367, -6.5087785720825195);
    path.quadraticCurveTo(59.27922821044922, -4.250129699707031, 75.72781372070312, 6.44663143157959);
    path.quadraticCurveTo(93.40434265136719, 17.941944122314453, 99.4729232788086, 33.49644088745117);
    path.quadraticCurveTo(100.00334930419922, 34.855995178222656, 99.98529052734375, 36.31524658203125);
    path.quadraticCurveTo(99.96723937988281, 37.774497985839844, 99.40332794189453, 39.12051010131836);
    path.quadraticCurveTo(91.65159606933594, 57.623260498046875, 70.95611572265625, 68.94308471679688);
    path.quadraticCurveTo(52.36455154418945, 79.11212158203125, 32.10027313232422, 79.22232818603516);
    path.quadraticCurveTo(-6.4815673828125, 79.43215942382812, -6.891101837158203, 36.293636322021484);
    path.closePath();

    return path;
})();

const scorpionTailWrinkle1 = (function () {
    const path = new Path2D();

    path.moveTo(-24.127342224121094, -3.297753095626831);
    path.quadraticCurveTo(-25.364002227783203, 0, -24.127342224121094, 3.297753095626831);
    path.quadraticCurveTo(-23.83646011352539, 4.073432922363281, -24.17926597595215, 4.827605247497559);
    path.quadraticCurveTo(-24.522071838378906, 5.581777572631836, -25.297752380371094, 5.8726582527160645);
    path.quadraticCurveTo(-26.07343101501465, 6.163537979125977, -26.82760238647461, 5.820732593536377);
    path.quadraticCurveTo(-27.581775665283203, 5.477927207946777, -27.872657775878906, 4.70224666595459);
    path.quadraticCurveTo(-29.635997772216797, -4.76837158203125e-7, -27.872657775878906, -4.70224666595459);
    path.quadraticCurveTo(-27.581775665283203, -5.477927207946777, -26.827604293823242, -5.820732593536377);
    path.quadraticCurveTo(-26.07343101501465, -6.163537979125977, -25.297752380371094, -5.8726582527160645);
    path.quadraticCurveTo(-24.522071838378906, -5.581777572631836, -24.17926597595215, -4.827605247497559);
    path.quadraticCurveTo(-23.83646011352539, -4.073432922363281, -24.127342224121094, -3.297753095626831);
    path.closePath();

    return path;
})();

const scorpionTailWrinkle2 = (function () {
    const path = new Path2D();

    path.moveTo(-34.28501510620117, -3.971008539199829);
    path.quadraticCurveTo(-36.66761779785156, 4.76837158203125e-7, -34.28501510620117, 3.971008539199829);
    path.quadraticCurveTo(-33.85879135131836, 4.681378364562988, -34.059715270996094, 5.485071182250977);
    path.quadraticCurveTo(-34.26063537597656, 6.288763046264648, -34.97100830078125, 6.7149858474731445);
    path.quadraticCurveTo(-35.681373596191406, 7.141207695007324, -36.485069274902344, 6.940284729003906);
    path.quadraticCurveTo(-37.288761138916016, 6.739361763000488, -37.71498489379883, 6.02899169921875);
    path.quadraticCurveTo(-41.33238220214844, 0, -37.71498489379883, -6.02899169921875);
    path.quadraticCurveTo(-37.288761138916016, -6.739361763000488, -36.485069274902344, -6.940284729003906);
    path.quadraticCurveTo(-35.681373596191406, -7.141207695007324, -34.97100830078125, -6.7149858474731445);
    path.quadraticCurveTo(-34.26063537597656, -6.288763046264648, -34.05971145629883, -5.485071182250977);
    path.quadraticCurveTo(-33.85879135131836, -4.681378364562988, -34.28501510620117, -3.971008539199829);
    path.closePath();

    return path;
})();

export default class MobRendererScorpion extends AbstractMobRenderer {
    override render(context: RenderingContext<Mob>): void {
        // Non-recursive renderer
        // super.render(context);

        const { ctx, entity } = context;

        // Change angle
        ctx.rotate(entity.angle);

        const scale = entity.size / 30;
        ctx.scale(scale, scale);

        ctx.lineJoin = ctx.lineCap = "round";

        ctx.lineWidth = 7;

        {
            ctx.save();

            ctx.fillStyle = ctx.strokeStyle = "#333333";

            ctx.translate(85 - 64, 67.80140686035156 - 64);
            ctx.scale(0.6628867661928461, 0.6628867198043205);

            // TODO: this is not movement counter
            const sinMoveCounter = Math.sin(entity.moveCounter);

            {
                ctx.save();

                ctx.rotate(sinMoveCounter * 0.1);

                ctx.beginPath();
                ctx.moveTo(-10, 5);
                ctx.quadraticCurveTo(15, 30, 35, 10);
                ctx.quadraticCurveTo(15, 20, -10, 5);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                ctx.restore();
            }

            {
                ctx.save();

                ctx.rotate(sinMoveCounter * -0.1);

                ctx.beginPath();
                ctx.moveTo(-10, -5);
                ctx.quadraticCurveTo(15, -30, 35, -10);
                ctx.quadraticCurveTo(15, -20, -10, -5);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                ctx.restore();
            }

            ctx.restore();
        }

        {
            ctx.save();

            ctx.translate(67.80140686035156 - 64, 67.80140686035156 - 64);
            ctx.scale(0.7679999578592127, 0.7679999578592127);

            { // Legs
                ctx.strokeStyle = "#333333";

                const LEG_LENGTH = 35;

                ctx.beginPath();

                for (let i = 0; i < 8; i++) {
                    let dir = (0.25 + i % 4 / 3 * 0.4) * Math.PI + Math.sin(i + entity.moveCounter * 1.3) * 0.2;
                    if (i >= 4) {
                        dir *= -1;
                    }

                    ctx.moveTo(0, 0);
                    ctx.lineTo(Math.cos(dir) * LEG_LENGTH, Math.sin(dir) * LEG_LENGTH);
                }

                ctx.stroke();
            }

            { // Body
                ctx.beginPath();
                ctx.moveTo(0, -30);
                ctx.quadraticCurveTo(40, -20, 40, 0);
                ctx.quadraticCurveTo(40, 20, 0, 30);
                ctx.quadraticCurveTo(-40, 35, -40, 0);
                ctx.quadraticCurveTo(-40, -35, 0, -30);
                ctx.closePath();

                ctx.fillStyle = this.calculateDamageEffectColor(context, "#C69A2D");
                ctx.strokeStyle = this.calculateDamageEffectColor(context, "#9E7C24");
                ctx.lineWidth = 7;
                ctx.fill();
                ctx.stroke();
            }

            { // Wrinkles
                ctx.lineWidth = 7;

                ctx.strokeStyle = this.calculateDamageEffectColor(context, "#9E7C24");

                ctx.beginPath();
                ctx.moveTo(22, -12);
                ctx.quadraticCurveTo(26, 0, 22, 12);
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(7, -18);
                ctx.quadraticCurveTo(10.5, 0, 7, 18);
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(-7, -18);
                ctx.quadraticCurveTo(-10.5, 0, -7, 18);
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(-22, -15);
                ctx.quadraticCurveTo(-27, 0, -22, 15);
                ctx.stroke();
            }

            ctx.restore();
        }

        {
            ctx.save();

            ctx.translate(30 - 64, 57 - 64);
            ctx.scale(0.30719998103634244, 0.30719998103634244);

            ctx.fillStyle = this.calculateDamageEffectColor(context, "#DBAB32");
            ctx.fill(scorpionTail, "nonzero");

            ctx.fillStyle = this.calculateDamageEffectColor(context, "#B18B28");
            ctx.fill(scorpionTailStroke, "nonzero");

            ctx.restore();
        }

        {
            ctx.save();

            ctx.translate(67.80140686035156 - 64, 67.80140686035156 - 64);
            ctx.scale(0.7679999578592127, 0.7679999578592127);

            ctx.fillStyle = this.calculateDamageEffectColor(context, "#B18B28");

            ctx.fill(scorpionTailWrinkle1, "nonzero");
            ctx.fill(scorpionTailWrinkle2, "nonzero");

            ctx.restore();
        }

        { // Pincer
            ctx.save();

            ctx.lineWidth = 4;
            ctx.fillStyle = "#333333";
            ctx.strokeStyle = "#292929";

            ctx.translate(59 - 64, 67.80140686035156 - 64);
            ctx.scale(0.7679999578592127, 0.7679999578592127);

            ctx.beginPath();
            ctx.moveTo(3.5, 0);
            ctx.lineTo(-3.5, -7);
            ctx.lineTo(-3.5, 7);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.restore();
        }
    }
}