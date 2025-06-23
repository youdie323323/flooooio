"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const MobRenderer_1 = __importDefault(require("./MobRenderer"));
const getLinkedLeechBodies = (leech) => {
    const bodies = new Array();
    bodies.push(leech);
    leech.connectedSegments.forEach((body) => {
        bodies.push(...getLinkedLeechBodies(body));
    });
    return bodies;
};
const TAU = 2 * Math.PI;
class MobRendererLeech extends MobRenderer_1.default {
    render(context) {
        // Non-recursive renderer
        // super.render(context);
        const { ctx, entity, isSpecimen } = context;
        // Dont draw if this is a connecting (body) segment
        if (!isSpecimen && entity.connectingSegment)
            return;
        const scale = entity.size / 20;
        ctx.scale(scale, scale);
        ctx.lineCap = "round";
        if (isSpecimen) {
            ctx.scale(0.5, 0.5);
            { // Beak
                ctx.save();
                ctx.translate(-35, -32);
                ctx.rotate(-1.6561946489531953);
                ctx.lineWidth = 4;
                ctx.strokeStyle = "#292929";
                // Upper beak
                ctx.beginPath();
                ctx.moveTo(0, 10);
                ctx.quadraticCurveTo(11, 10, 22, 5);
                ctx.stroke();
                // Lower beak
                ctx.beginPath();
                ctx.moveTo(0, -10);
                ctx.quadraticCurveTo(11, -10, 22, -5);
                ctx.stroke();
                ctx.restore();
            }
            {
                ctx.beginPath();
                ctx.rotate(-2.356194599949769);
                ctx.moveTo(50, 0);
                ctx.quadraticCurveTo(0, -30, -50, 0);
                this.strokeBodyCurve(context);
            }
            return;
        }
        if (entity.isFirstSegment) { // Beak
            const { beakAngle } = entity;
            ctx.save();
            // Change angle
            ctx.rotate(entity.angle);
            ctx.strokeStyle = this.toEffectedColor(context, "#292929");
            ctx.lineWidth = 4;
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
        {
            const bodies = getLinkedLeechBodies(entity)
                .map(({ x, y }) => [
                x / scale,
                y / scale,
            ]);
            // First body (me)
            const firstBody = bodies[0];
            ctx.translate(-firstBody[0], -firstBody[1]);
            this.prepareNPointSmoothCurve(ctx, bodies);
            this.strokeBodyCurve(context);
        }
    }
    prepareNPointSmoothCurve(ctx, points) {
        ctx.beginPath();
        const firstPoint = points[0];
        const lenPoints = points.length;
        if (lenPoints > 1) {
            ctx.moveTo(firstPoint[0], firstPoint[1]);
            for (let i = 0; i < lenPoints - 1; i++) {
                const p0 = (i >= 1)
                    ? points[i - 1]
                    : firstPoint;
                const p1 = points[i];
                const p2 = points[i + 1];
                const p3 = (i !== lenPoints - 2)
                    ? points[i + 2]
                    : p2;
                const [p1x, p1y] = p1;
                const [p2x, p2y] = p2;
                const cp1x = p1x + (p2x - p0[0]) / 6;
                const cp1y = p1y + (p2y - p0[1]) / 6;
                const cp2x = p2x - (p3[0] - p1x) / 6;
                const cp2y = p2y - (p3[1] - p1y) / 6;
                ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2x, p2y);
            }
        }
        else {
            // Just do arc if not enough points
            ctx.arc(firstPoint[0], firstPoint[1], 1, 0, TAU);
        }
    }
    strokeBodyCurve(context) {
        const { ctx } = context;
        // Body stroke
        ctx.lineWidth = 25;
        ctx.strokeStyle = this.toEffectedColor(context, "#292929");
        ctx.stroke();
        // Body
        ctx.lineWidth = 22;
        ctx.strokeStyle = this.toEffectedColor(context, "#333333");
        ctx.stroke();
    }
}
exports.default = MobRendererLeech;
