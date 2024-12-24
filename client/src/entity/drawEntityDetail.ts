import { MOB_PROFILES } from "../../../shared/entity/mob/mobProfiles";
import { isPetal } from "../utils/common";
import { waveSelfId } from "../utils/Networking";
import Entity from "./Entity";
import Mob from "./Mob";
import Player from "./Player";

/**
 * Draw entity details (e.g. health gage, nickname).
 */
export default function drawEntityDetail(entity: Entity, ctx: CanvasRenderingContext2D) {
    if (
        entity.hpAlpha <= 0 ||
        entity instanceof Mob && isPetal(entity.type)
    ) {
        return;
    }

    // Draw nickname if not self
    if (entity instanceof Player && entity.id !== waveSelfId) {
        ctx.save();

        if (entity.isDead) ctx.globalAlpha *= 1 - Math.sin(entity.deadT * Math.PI / 2);

        ctx.translate(0, -(entity.size + 10));
        ctx.scale(0.2, 0.2);

        ctx.font = "4em Ubuntu";
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.lineWidth = 8;
        ctx.strokeStyle = '#000000';
        ctx.fillStyle = "#ffffff";

        ctx.strokeText(entity.nickname, 0, 0);
        ctx.fillText(entity.nickname, 0, 0);

        ctx.restore();
    }

    const HP_BAR_MAX_WIDTH: number = 45;

    // Draw hp bar if health decreasing and living
    if (!entity.isDead && entity.maxHealth > entity.health) {
        ctx.save();

        ctx.globalAlpha = entity.hpAlpha;
        ctx.strokeStyle = "#222";
        ctx.beginPath();

        let lineWidth: number;

        if (entity instanceof Player) {
            lineWidth = 5;

            ctx.translate(0, entity.size);
            ctx.translate(-HP_BAR_MAX_WIDTH / 2, 9 / 2 + 5);
        } else if (entity instanceof Mob) {
            lineWidth = 6.5;

            const profile = MOB_PROFILES[entity.type];
            const scale = ((profile.rx + profile.ry) * (entity.size / profile.fraction)) / 30;
            ctx.scale(scale, scale);
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