import type Mob from "../../../Mob";
import type { RenderingContext } from "../../RendererRenderingContext";
import AbstractPetalRenderer from "./PetalRenderer";

const clawBody = (function () {
    const path = new Path2D();

    path.moveTo(-14, -4);
    path.quadraticCurveTo(8, -16, 18, 6);
    path.lineTo(8, 0);
    path.lineTo(12, 10);
    path.quadraticCurveTo(-2, -2, -14, 4);
    path.quadraticCurveTo(-12, 0, -14, -4);
    path.closePath();

    return path;
})();

const clawBodyStroke = (function () {
    const path = new Path2D();

    path.moveTo(-14.957704544067383, -5.755791187286377);
    path.quadraticCurveTo(-3.2130584716796875, -12.161964416503906, 5.596549987792969, -9.408960342407227);
    path.quadraticCurveTo(14.450504302978516, -6.642097473144531, 19.82073211669922, 5.172394275665283);
    path.quadraticCurveTo(20.163536071777344, 5.926566123962402, 19.872657775878906, 6.70224666595459);
    path.quadraticCurveTo(19.581775665283203, 7.477927207946777, 18.827606201171875, 7.820733070373535);
    path.quadraticCurveTo(18.37864112854004, 8.02480697631836, 17.886268615722656, 7.996763229370117);
    path.quadraticCurveTo(17.393898010253906, 7.968719005584717, 16.97100830078125, 7.7149858474731445);
    path.lineTo(6.97100830078125, 1.7149858474731445);
    path.lineTo(8, 0);
    path.lineTo(9.856953620910645, -0.7427813410758972);
    path.lineTo(13.856953620910645, 9.257218360900879);
    path.quadraticCurveTo(14.164623260498047, 10.02639389038086, 13.838290214538574, 10.787837982177734);
    path.quadraticCurveTo(13.511956214904785, 11.54928207397461, 12.742781639099121, 11.856953620910645);
    path.quadraticCurveTo(12.224287033081055, 12.064351081848145, 11.67335033416748, 11.97314453125);
    path.quadraticCurveTo(11.122413635253906, 11.881937026977539, 10.698417663574219, 11.518512725830078);
    path.quadraticCurveTo(-2.2933197021484375, 0.3827362060546875, -13.105572700500488, 5.788854598999023);
    path.quadraticCurveTo(-13.846540451049805, 6.159337997436523, -14.632455825805664, 5.897366046905518);
    path.quadraticCurveTo(-15.418370246887207, 5.63539457321167, -15.788854598999023, 4.894427299499512);
    path.quadraticCurveTo(-16, 4.4721360206604, -16, 4);
    path.quadraticCurveTo(-16, 3.5278639793395996, -15.788854598999023, 3.1055727005004883);
    path.quadraticCurveTo(-14.236069679260254, 0.0000016689300537109375, -15.788854598999023, -3.1055727005004883);
    path.quadraticCurveTo(-16.150020599365234, -3.827904462814331, -15.908353805541992, -4.598489284515381);
    path.quadraticCurveTo(-15.666685104370117, -5.369073867797852, -14.957704544067383, -5.755791187286377);
    path.closePath();
    path.moveTo(-13.042295455932617, -2.244208812713623);
    path.lineTo(-14, -4);
    path.lineTo(-12.211145401000977, -4.894427299499512);
    path.quadraticCurveTo(-9.763931274414062, 0, -12.211145401000977, 4.894427299499512);
    path.lineTo(-14, 4);
    path.lineTo(-14.894427299499512, 2.2111456394195557);
    path.quadraticCurveTo(-1.7066726684570312, -4.3827362060546875, 13.301582336425781, 8.481487274169922);
    path.lineTo(12, 10);
    path.lineTo(10.143046379089355, 10.742781639099121);
    path.lineTo(6.143046855926514, 0.7427812218666077);
    path.quadraticCurveTo(5.968947410583496, 0.3075345754623413, 6.006389141082764, -0.1597428023815155);
    path.quadraticCurveTo(6.043830871582031, -0.6270201802253723, 6.2850141525268555, -1.028991460800171);
    path.quadraticCurveTo(6.711236000061035, -1.7393617630004883, 7.514928817749023, -1.9402847290039062);
    path.quadraticCurveTo(8.318620681762695, -2.1412079334259033, 9.02899169921875, -1.7149858474731445);
    path.lineTo(19.02899169921875, 4.2850141525268555);
    path.lineTo(18, 6);
    path.lineTo(16.17926788330078, 6.827605724334717);
    path.quadraticCurveTo(11.54948902130127, -3.357903480529785, 4.403450012207031, -5.591040134429932);
    path.quadraticCurveTo(-2.7869415283203125, -7.838038444519043, -13.042295455932617, -2.244208812713623);
    path.closePath();

    return path;
})();

export default class PetalRendererClaw extends AbstractPetalRenderer {
    override render(context: RenderingContext<Mob>): void {
        // Non-recursive renderer
        // super.render(context);

        const { ctx, entity } = context;

        // Change angle
        ctx.rotate(entity.angle);

        const scale = entity.size / 10;
        ctx.scale(scale, scale);

        ctx.lineJoin = "round";
    
        ctx.fillStyle = this.toEffectedColor(context, "#4D2621");
        ctx.fill(clawBody, "nonzero");
        
        ctx.fillStyle = this.toEffectedColor(context, "#3E1F1B");
        ctx.fill(clawBodyStroke, "nonzero");
    }
}