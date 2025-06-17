const std = @import("std");
const math = std.math;
const CanvasContext = @import("../../WebAssembly/Interop/Canvas2D/CanvasContext.zig");
const Color = @import("../../WebAssembly/Interop/Canvas2D/Color.zig");
const MobType = @import("../../Florr/Native/Entity/EntityType.zig").MobType;
const main = @import("../../main.zig");

/// Factor for darken skin color.
/// Mainly used with body stroke color.
pub const darkened_base: f32 = 0.1875;

pub fn RenderContext(comptime Entity: type) type {
    return *const struct {
        const PtrConstSelf = *const @This();

        /// Canvas context to render this render context.
        ctx: *CanvasContext,

        /// A entity used to render this render context.
        entity: *Entity,

        /// Whether this render context is specimen.
        is_specimen: bool,

        players: *main.Players,
        mobs: *main.Mobs,

        // We'll place functions here which hasn't used outside comptime environments (something kind like: { comptime recursive: bool })

        /// Returns whether this render context entity is mob.
        pub inline fn isMob(self: PtrConstSelf) bool {
            return @hasDecl(@TypeOf(self.entity.impl), "type");
        }

        /// Returns whether this render context should rendered.
        pub inline fn isCandidate(self: PtrConstSelf) bool {
            const entity = self.entity;
            const is_specimen = self.is_specimen;

            return !(!is_specimen and entity.is_dead and entity.dead_t > 1);
        }

        /// Apply death animation with this render context.
        pub inline fn applyDeathAnimation(self: PtrConstSelf) void {
            const ctx = self.ctx;
            const entity = self.entity;

            if (entity.is_dead) {
                const is_leech =
                    self.isMob() and entity.type == .leech;

                const sin_waved_dead_t = @sin(entity.dead_t * math.pi / (if (is_leech) 9 else 3));

                const scale = 1 + sin_waved_dead_t;

                ctx.scale(scale, scale);
                ctx.setGlobalAlpha(ctx.globalAlpha() * (1 - sin_waved_dead_t));
            }
        }

        const hurt_target_color_middle = Color.comptimeFromRgbString("rgb(255, 0, 0)");
        const hurt_target_color_last = Color.comptimeFromRgbString("rgb(255, 255, 255)");

        const poison_target_color = Color.comptimeFromRgbString("rgb(189, 80, 255)");

        /// Blend colors based on this render context entity effect values.
        /// All effect values should in [0, 1].
        pub inline fn blendStatusEffects(self: PtrConstSelf, color: Color) Color {
            const entity = self.entity;

            const hurt_t = entity.hurt_t;
            const poison_t = entity.poison_t;

            // No effects to apply
            if (hurt_t == 0 and poison_t == 0) return color;

            // Copy color
            var applied: Color = color;

            { // Apply effects
                if (poison_t > 0) applied = poison_target_color.interpolate(applied, 0.75 * (1 - poison_t));
            }

            applied = Color.multiColorInterpolate(&.{ applied, hurt_target_color_middle, hurt_target_color_last }, 1 - hurt_t);

            return applied.interpolate(color, 0.5);
        }

        pub inline fn fadeOut(x: f32, comptime after: f32) f32 {
            return if (x < after)
                x / after
            else
                1;
        }

        const hp_bar_max_width = 45;

        /// Draw the entity statuses (e.g. health bar).
        pub inline fn drawEntityStatuses(self: PtrConstSelf) void {
            const ctx = self.ctx;
            const entity = self.entity;

            const is_mob = self.isMob();
            const is_player = !is_mob;

            if (is_mob and (entity.type.isPetal() or entity.type == .missile_projectile))
                return;

            if (entity.hp_alpha <= 0) return;

            // TODO
            // if (
            //     entity instanceof Player &&
            //     uiCtx.currentContext instanceof UIGame &&
            //     // Draw nickname if not self
            //     entity.id !== uiCtx.currentContext.waveSelfId
            // ) {
            //     ctx.save();
            //     ctx.translate(0, -entity.size - 10);
            //     ctx.textBaseline = "middle";
            //     ctx.textAlign = "center";
            //     ctx.fillStyle = "#FFFFFF";
            //     setGameFont(ctx, 12);
            //     ctx.strokeText(entity.name, 0, 0);
            //     ctx.fillText(entity.name, 0, 0);
            //     ctx.restore();
            // }

            if (!entity.is_dead and entity.health < 1) {
                ctx.save();
                defer ctx.restore();

                const line_width: f32 =
                    if (is_player) blk: {
                        ctx.translate(0, entity.size);
                        ctx.translate(-hp_bar_max_width / 2, 9 / 2 + 5);

                        break :blk 5;
                    } else blk: {
                        // TODO: めんどくっせ！
                        // const { collision: { radius, fraction } }: MobData = MOB_PROFILES[entity.type];
                        // const scale = (entity.size * radius) / (15 * fraction);
                        // ctx.scale(scale, scale);
                        // ctx.translate(-HP_BAR_MAX_WIDTH / 2, 25);

                        ctx.scale(40, 40);
                        ctx.translate(-hp_bar_max_width / 2, 25);

                        break :blk 6.5;
                    };

                ctx.setLineCap(.round);
                ctx.setGlobalAlpha(entity.hp_alpha);

                { // Health bar background
                    ctx.beginPath();

                    ctx.moveTo(0, 0);
                    ctx.lineTo(hp_bar_max_width, 0);

                    ctx.setLineWidth(line_width);
                    ctx.strokeColor(comptime Color.comptimeFromHexColorCode("#222222"));
                    ctx.stroke();
                }

                if (entity.red_health > 0) {
                    ctx.setGlobalAlpha(fadeOut(entity.red_health, 0.05));

                    ctx.beginPath();

                    ctx.moveTo(0, 0);
                    ctx.lineTo(hp_bar_max_width * entity.red_health, 0);

                    ctx.setLineWidth(line_width * 0.44);
                    ctx.strokeColor(comptime Color.comptimeFromHexColorCode("#ff2222"));
                    ctx.stroke();
                }

                if (entity.health > 0) {
                    ctx.setGlobalAlpha(fadeOut(entity.health, 0.05));

                    ctx.beginPath();

                    ctx.moveTo(0, 0);
                    ctx.lineTo(hp_bar_max_width * entity.health, 0);

                    ctx.setLineWidth(line_width * 0.66);
                    ctx.strokeColor(comptime Color.comptimeFromHexColorCode("#75dd34"));
                    ctx.stroke();
                }
            }
        }
    };
}

pub fn RenderFn(comptime Entity: type) type {
    return *const fn (rctx: RenderContext(Entity)) void;
}

pub fn Renderer(
    comptime Entity: type,
    comptime is_ancestor: bool,
    comptime render_fn: RenderFn(Entity),
    comptime static_init_fn: ?*const fn (allocator: std.mem.Allocator) void,
) type {
    return struct {
        pub inline fn staticInit(allocator: std.mem.Allocator) void {
            if (comptime static_init_fn) |f| f(allocator);
        }

        /// Renders the entity.
        pub fn render(rctx: RenderContext(Entity)) void {
            if (comptime is_ancestor) {
                const ctx = rctx.ctx;
                const entity = rctx.entity;
                const is_specimen = rctx.is_specimen;

                const x, const y = entity.pos;

                ctx.translate(x, y);

                if (!is_specimen) {
                    rctx.applyDeathAnimation();

                    rctx.drawEntityStatuses();
                }
            }

            render_fn(rctx);
        }
    };
}

/// Renders the entity.
pub fn renderEntity(comptime Impl: type, rctx: RenderContext(Impl.Super)) void {
    // Validate implementation
    comptime validateEntityImplementation(Impl);

    const ctx = rctx.ctx;

    const EntityRenderer = Impl.Renderer;

    if (!rctx.isCandidate()) return;

    ctx.save();
    defer ctx.restore();

    EntityRenderer.render(rctx);
}

/// Validates the given Entity implementation type.
pub inline fn validateEntityImplementation(comptime Impl: type) void {
    if (!@hasDecl(Impl, "Super"))
        @compileError("entity implementation must have a Super declaration");

    if (!@hasDecl(Impl, "Renderer"))
        @compileError("entity implementation must have a Renderer declaration");
}
