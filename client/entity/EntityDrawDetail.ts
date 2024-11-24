import { MOB_PROFILES } from "../../shared/mobProfiles";
import { isPetal } from "../utils/common";
import { selfId } from "../Networking";
import Entity from "./Entity";
import EntityMob from "./EntityMob";
import EntityPlayer from "./EntityPlayer";

export const HP_BAR_MAX_WIDTH: number = 45;

export function drawEntityDetail(entity: Entity, ctx: CanvasRenderingContext2D, scale = 1) {
    if (entity.hpAlpha <= 0 || entity instanceof EntityMob && isPetal(entity.type)) {   
        return;
    }

    // Draw nickname if not self
    if (entity instanceof EntityPlayer && entity.id !== selfId) {
        ctx.save();

        ctx.translate(0, -(entity.size + 10));
        ctx.scale(0.2, 0.2);

        ctx.font = "4em Ubuntu, sans-serif";
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.lineWidth = 8;
        ctx.strokeStyle = '#000000';
        ctx.strokeText(entity.nickname, 0, 0);
        ctx.fillStyle = "white";
        ctx.fillText(entity.nickname, 0, 0);

        ctx.restore();
    }

    // Draw hp bar if health decreasing and living
    if (!entity.isDead && entity.maxHealth > entity.health) {
        ctx.save();

        ctx.globalAlpha = entity.hpAlpha;
        ctx.strokeStyle = "#222";
        ctx.beginPath();

        let lineWidth: number;

        if (entity instanceof EntityPlayer) {
            lineWidth = 5;

            ctx.translate(0, entity.size);
            ctx.scale(scale, scale);
            ctx.translate(-HP_BAR_MAX_WIDTH / 2, 9 / 2 + 5);
        } else if (entity instanceof EntityMob) {
            lineWidth = 6.5;
  
            const profile = MOB_PROFILES[entity.type];
            const rQ = ((profile.rx + profile.ry) * (entity.size / profile.fraction)) / 30;
            ctx.scale(rQ, rQ);
            ctx.translate(-HP_BAR_MAX_WIDTH / 2, 25);
        }

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(HP_BAR_MAX_WIDTH, 0);
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
            ctx.lineTo(HP_BAR_MAX_WIDTH * (entity.redHealth / entity.maxHealth), 0);
            ctx.lineWidth = lineWidth * 0.44;
            ctx.strokeStyle = "#f22";
            ctx.stroke();
        }
        if (entity.health > 0) {
            setGlobalAlpha(entity.health);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(HP_BAR_MAX_WIDTH * (entity.health / entity.maxHealth), 0);
            ctx.lineWidth = lineWidth * 0.66;
            ctx.strokeStyle = "#75dd34";
            ctx.stroke();
        }

        ctx.restore();
    }
}