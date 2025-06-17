const std = @import("std");
const math = std.math;
const CanvasContext = @import("../../WebAssembly/Interop/Canvas2D/CanvasContext.zig");
const Color = @import("../../WebAssembly/Interop/Canvas2D/Color.zig");
const MobType = @import("../../Florr/Native/Entity/EntityType.zig").MobType;
const Entity = @import("../Entity.zig").Entity;
const main = @import("../../main.zig");

/// Factor for darken skin color.
/// Mainly used with body stroke color.
pub const darkened_base: f32 = 0.1875;

pub fn RenderContext(comptime AnyEntity: type) type {
    return *const struct {
        const AnyImpl = @FieldType(AnyEntity, "impl");

        /// Canvas context to render this render context.
        ctx: *CanvasContext,

        /// A entity used to render this render context.
        entity: *AnyEntity,

        /// Whether this render context is specimen.
        is_specimen: bool,

        players: *main.Players,
        mobs: *main.Mobs,

        /// Returns strictly typed entity.
        pub inline fn typedEntity(self: @This()) *Entity(AnyImpl) {
            return self.entity;
        }

        /// Returns whether this render context entity is mob.
        pub inline fn isMob(_: @This()) bool {
            return comptime @hasField(AnyImpl, "type");
        }

        /// Returns whether this render context should rendered.
        pub inline fn shouldRender(self: @This()) bool {
            const entity = self.typedEntity();
            const is_specimen = self.is_specimen;

            return !(!is_specimen and entity.is_dead and entity.dead_t > 1);
        }

        /// Apply death animation with this render context.
        pub inline fn applyDeathAnimation(self: @This()) void {
            const ctx = self.ctx;
            const entity = self.typedEntity();
            const impl = entity.impl;

            if (entity.is_dead) {
                const is_leech =
                    self.isMob() and impl.type.isMobTypeOf(.leech);

                const sin_waved_dead_t = @sin(entity.dead_t * math.pi / @as(
                    f32,
                    if (is_leech)
                        9
                    else
                        3,
                ));

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
        pub inline fn blendEffectColors(self: @This(), color: Color) Color {
            const entity = self.typedEntity();

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

        pub inline fn fadeValue(x: f32, comptime after: f32) f32 {
            return if (x < after)
                x / after
            else
                1;
        }

        const hp_bar_max_width = 45;

        /// Draw the entity statuses (e.g. health bar).
        pub inline fn drawEntityStatuses(self: @This()) void {
            const ctx = self.ctx;
            const entity = self.typedEntity();
            const impl = entity.impl;

            const is_mob = self.isMob();
            const is_player = !is_mob;

            if (is_mob and (impl.type.isPetal() or impl.type.isMobTypeOf(.missile_projectile)))
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
                    ctx.setGlobalAlpha(fadeValue(entity.red_health, 0.05));

                    ctx.beginPath();

                    ctx.moveTo(0, 0);
                    ctx.lineTo(hp_bar_max_width * entity.red_health, 0);

                    ctx.setLineWidth(line_width * 0.44);
                    ctx.strokeColor(comptime Color.comptimeFromHexColorCode("#ff2222"));
                    ctx.stroke();
                }

                if (entity.health > 0) {
                    ctx.setGlobalAlpha(fadeValue(entity.health, 0.05));

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

pub fn RenderFn(comptime AnyEntity: type) type {
    return *const fn (rctx: RenderContext(AnyEntity)) void;
}

pub fn Renderer(
    comptime AnyEntity: type,
    comptime is_ancestor: bool,
    comptime render_fn: RenderFn(AnyEntity),
    comptime static_init_fn: ?*const fn (allocator: std.mem.Allocator) void,
) type {
    return struct {
        pub inline fn staticInit(allocator: std.mem.Allocator) void {
            if (comptime static_init_fn) |f| f(allocator);
        }

        /// Renders the entity.
        pub fn render(rctx: RenderContext(AnyEntity)) void {
            if (comptime is_ancestor) {
                const ctx = rctx.ctx;
                const entity = rctx.typedEntity();
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

    if (!rctx.shouldRender()) return;

    ctx.save();
    defer ctx.restore();

    Impl.Renderer.render(rctx);
}

/// Validates the given Entity implementation type.
/// TODO: too much locs use this function, decide one loc to call.
pub inline fn validateEntityImplementation(comptime Impl: type) void {
    if (!@hasDecl(Impl, "Super"))
        @compileError("entity implementation must have a Super declaration");

    if (!@hasDecl(Impl, "Renderer"))
        @compileError("entity implementation must have a Renderer declaration");
}
