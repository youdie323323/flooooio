import type Mob from "../../../Mob";
import type { RenderingContext } from "../../RendererRenderingContext";
import AbstractMobRenderer from "../MobRenderer";

export const missileBody = (function () {
    const path = new Path2D();

    path.moveTo(11, 0);
    path.lineTo(-11, -6);
    path.lineTo(-11, 6);
    path.lineTo(11, 0);
    path.closePath();

    return path;
})();

export const missileBodyStroke = (function () {
    const path = new Path2D();

    path.moveTo(10.342206954956055, 2.411909580230713);
    path.lineTo(-11.657793045043945, -3.588090419769287);
    path.lineTo(-11, -6);
    path.lineTo(-8.5, -6);
    path.lineTo(-8.5, 6);
    path.lineTo(-11, 6);
    path.lineTo(-11.657793045043945, 3.588090419769287);
    path.lineTo(10.342206954956055, -2.411909580230713);
    path.lineTo(11, 0);
    path.lineTo(10.342206954956055, 2.411909580230713);
    path.closePath();
    path.moveTo(11.657793045043945, -2.411909580230713);
    path.quadraticCurveTo(12.298311233520508, -2.237222671508789, 12.767766952514648, -1.7677668333053589);
    path.quadraticCurveTo(13.237222671508789, -1.2983107566833496, 13.411909103393555, -0.6577935218811035);
    path.quadraticCurveTo(13.684375762939453, 0.34125208854675293, 13.17060661315918, 1.2403472661972046);
    path.quadraticCurveTo(12.656837463378906, 2.1394424438476562, 11.657793045043945, 2.411909580230713);
    path.lineTo(-10.342206954956055, 8.411909103393555);
    path.quadraticCurveTo(-10.502988815307617, 8.455759048461914, -10.668167114257812, 8.477879524230957);
    path.quadraticCurveTo(-10.833346366882324, 8.5, -11, 8.5);
    path.quadraticCurveTo(-12.03553295135498, 8.5, -12.767765045166016, 7.767766952514648);
    path.quadraticCurveTo(-13.499999046325684, 7.035533905029297, -13.5, 6);
    path.lineTo(-13.5, -6);
    path.quadraticCurveTo(-13.5, -6.166653633117676, -13.477879524230957, -6.3318328857421875);
    path.quadraticCurveTo(-13.455759048461914, -6.497012138366699, -13.411909103393555, -6.6577935218811035);
    path.quadraticCurveTo(-13.13944149017334, -7.656838417053223, -12.240346908569336, -8.17060661315918);
    path.quadraticCurveTo(-11.341251373291016, -8.684375762939453, -10.342206954956055, -8.411909103393555);
    path.lineTo(11.657793045043945, -2.411909580230713);
    path.closePath();

    return path;
})();

export default class MobRendererMissileProjectile extends AbstractMobRenderer {
    override render(context: RenderingContext<Mob>): void {
        // Non-recursive renderer
        // super.render(context);

        const { ctx, entity } = context;

        // Change angle
        ctx.rotate(entity.angle);

        const scale = entity.size / 25;
        ctx.scale(scale, scale);

        ctx.fillStyle = this.toEffectedColor(context, "#333333");
        ctx.fill(missileBody, "nonzero");
        ctx.fill(missileBodyStroke, "nonzero");
    }
}