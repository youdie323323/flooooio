import { selfId } from "../main";
import { isPetal } from "../utils/small";
import Entity from "./Entity";
import EntityMob from "./EntityMob";
import EntityPlayer from "./EntityPlayer";

export function drawEntityDetail(entity: Entity, ctx: CanvasRenderingContext2D, scale = 1) {
    ctx.save();
    _drawEntityDetail(entity, ctx, scale);
    ctx.restore();
}

function _drawEntityDetail(entity: Entity, ctx: CanvasRenderingContext2D, scale = 1) {
    if (entity.hpAlpha <= 0 || entity instanceof EntityMob && isPetal(entity.type) || entity instanceof EntityMob && entity.maxHealth <= entity.health) {
        return;
    }

    if (entity instanceof EntityPlayer && entity.id !== selfId) {
        // Draw nickname if not self
        ctx.save();

        ctx.translate(0, -(entity.size + 8));
        ctx.scale(0.2, 0.2);

        ctx.font = "3em Ubuntu, sans-serif";
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.lineWidth = 6;
        ctx.strokeStyle = '#000000';
        ctx.strokeText(entity.nickname, 0, 0);
        ctx.fillStyle = "white";
        ctx.fillText(entity.nickname, 0, 0);

        ctx.restore();
    }
    if (!entity.isDead) {
        ctx.save();

        ctx.globalAlpha = entity.hpAlpha;
        ctx.strokeStyle = "#222";
        ctx.beginPath();

        let maxWidth: number;
        let lineWidth: number;

        if (entity instanceof EntityPlayer) {
            lineWidth = 5;
            maxWidth = 45;

            ctx.translate(0, entity.size);
            ctx.scale(scale, scale);
            ctx.translate(-maxWidth / 2, 9 / 2 + 5);
        } else if (entity instanceof EntityMob) {
            lineWidth = 7;
            maxWidth = 55;

            const rQ = entity.size / 20;
            ctx.scale(rQ, rQ);
            ctx.translate(-maxWidth / 2, entity.size / rQ + 15);
        }

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(maxWidth, 0);
        ctx.lineCap = "round";
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = "#222";
        ctx.stroke();

        function setGlobalAlpha(hp: number) {
            ctx.globalAlpha = hp < 0.05 ? hp / 0.05 : 1;
        }
        if (entity.redHealth > 0) {
            setGlobalAlpha(entity.redHealth);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(maxWidth * (entity.redHealth / entity.maxHealth), 0);
            ctx.lineWidth = lineWidth * 0.44;
            ctx.strokeStyle = "#f22";
            ctx.stroke();
        }
        if (entity.health > 0) {
            setGlobalAlpha(entity.health);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(maxWidth * (entity.health / entity.maxHealth), 0);
            ctx.lineWidth = lineWidth * 0.66;
            ctx.strokeStyle = "#75dd34";
            ctx.stroke();
        }

        ctx.restore();
    }
}