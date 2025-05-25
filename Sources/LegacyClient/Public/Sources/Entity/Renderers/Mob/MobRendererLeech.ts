import type Mob from "../../Mob";
import type { RenderingContext } from "../RendererRenderingContext";
import AbstractMobRenderer from "./MobRenderer";

const getLinkedLeechBodies = (leech: Mob): Array<Mob> => {
    const bodies: Array<Mob> = new Array();

    bodies.push(leech);

    leech.connectedSegments.forEach((body) => {
        bodies.push(...getLinkedLeechBodies(body));
    });

    return bodies;
};

export default class MobRendererLeech extends AbstractMobRenderer {
    override render(context: RenderingContext<Mob>): void {
        // Non-recursive renderer
        // super.render(context);

        const { ctx, entity } = context;

        // Don't draw if this is a connecting (body) segment
        if (entity.connectingSegment) return;

        // Change angle
        ctx.rotate(entity.angle);

        const scale = entity.size / 20;
        ctx.scale(scale, scale);

        ctx.lineCap = "round";

        if (entity.isFirstSegment) {
            ctx.strokeStyle = "#292929";
            ctx.lineWidth = 4;

            { // Beak
                const { beakAngle } = entity;

                ctx.save();

                // Upper beak
                ctx.beginPath();
                ctx.rotate(beakAngle);
                ctx.moveTo(0, 10);
                ctx.quadraticCurveTo(11, 10, 22, 5);
                ctx.stroke();

                // Lower beak
                ctx.beginPath();
                ctx.rotate(-beakAngle * 2);
                ctx.moveTo(0, -10);
                ctx.quadraticCurveTo(11, -10, 22, -5);
                ctx.stroke();

                ctx.restore();
            }
        }

        ctx.rotate(-entity.angle);

        ctx.beginPath();

        const bodies =
            entity.isDead
                ? [entity]
                : getLinkedLeechBodies(entity);

        ctx.lineTo(0, 0);

        // Draw smooth curves between segments
        for (let i = 1; i < bodies.length; i++) {
            const current = bodies[i];
            const prev = bodies[i - 1];

            // Calculate control point as the midpoint between segments
            const cpx = ((prev.x + current.x) / 2 - entity.x) / scale;
            const cpy = ((prev.y + current.y) / 2 - entity.y) / scale;

            // Calculate end point
            const endX = (current.x - entity.x) / scale;
            const endY = (current.y - entity.y) / scale;

            // Draw curved line
            ctx.quadraticCurveTo(cpx, cpy, endX, endY);
        }

        // Body stroke
        ctx.lineWidth = 25;
        ctx.strokeStyle = this.calculateDamageEffectColor(context, "#292929");
        ctx.stroke();

        // Body
        ctx.lineWidth = 22;
        ctx.strokeStyle = this.calculateDamageEffectColor(context, "#333333");
        ctx.stroke();
    }
}