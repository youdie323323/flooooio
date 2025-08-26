/// Factor used for darken skin colors, especially for this game.
pub const skin_darken: comptime_float = 0.19;

/// Creates a render context for the specified entity type.
pub fn RenderContext(comptime AnyEntity: type) type {
    return struct {
        const AnyImpl =
            if (@hasField(AnyEntity, "impl"))
                @FieldType(AnyEntity, "impl")
            else
                @compileError("AnyEntity must have an implementation");

        // Reconstruct typed AnyEntity using unknown implementation
        const TypedAnyEntity = Entity(AnyImpl);
        const TypedAnyImpl = @FieldType(TypedAnyEntity, "impl");

        comptime { // Ensure they are same type
            assert(TypedAnyEntity == AnyEntity);
            assert(TypedAnyImpl == AnyImpl);
        }

        const is_mob_impl = @hasField(TypedAnyImpl, "type");
        const is_player_impl = !is_mob_impl;

        /// Canvas context to render this render context.
        ctx: *CanvasContext,

        /// A entity used to render this render context.
        entity: *TypedAnyEntity,

        /// Whether this render context is specimen.
        is_specimen: bool,

        players: *Players,
        mobs: *Mobs,
        petals: *Mobs,

        /// Determines if the entity should be rendered based on its state.
        /// Returns false if the entity is dead and past its death animation time.
        pub fn shouldRender(self: *const @This()) bool {
            const entity = self.entity;
            const is_specimen = self.is_specimen;

            return !(!is_specimen and entity.is_dead and entity.dead_t > 1);
        }

        /// Applies death animation to the rendering context.
        pub fn applyDeathAnimation(self: *const @This()) void {
            const ctx = self.ctx;
            const entity = self.entity;
            const impl = &entity.impl;

            if (entity.is_dead) {
                const is_leech =
                    is_mob_impl and impl.type.isMobTypeOf(.leech);

                const sin_waved_dead_t = @sin(entity.dead_t * math.pi / @as(
                    f32,
                    if (is_leech)
                        9
                    else
                        3,
                ));

                const scale = sin_waved_dead_t + 1;

                ctx.scale(scale, scale);
                ctx.setGlobalAlpha(ctx.globalAlpha() * (1 - sin_waved_dead_t));
            }
        }

        const hurt_target_color_middle: Color = .comptimeFromRgbString("rgb(255, 0, 0)");
        const hurt_target_color_last: Color = .comptimeFromRgbString("rgb(255, 255, 255)");

        const poison_target_color: Color = .comptimeFromRgbString("rgb(208, 112, 207)");

        /// Blend colors based on this render context entity effect values.
        /// All effect values should ranged in [0, 1].
        pub fn blendEffectColors(self: *const @This(), color: Color) Color {
            const entity = self.entity;

            const hurt_t = entity.hurt_t;
            const poison_t = entity.poison_t;

            const hurt_t_equal_zero = hurt_t == 0;
            const poison_t_equal_zero = poison_t == 0;

            // No effects to apply
            if (hurt_t_equal_zero and poison_t_equal_zero) return color;

            // Copy color
            var applied: Color = color;

            if (!poison_t_equal_zero) // Poison effect
                applied = applied.interpolate(poison_target_color, poison_t);

            if (!hurt_t_equal_zero) { // Damage effect
                if (poison_t_equal_zero)
                    applied = .nColorInterpolate(&.{ applied, hurt_target_color_middle, hurt_target_color_last }, 1 - hurt_t)
                else
                    applied = applied.interpolate(hurt_target_color_middle, 1 - hurt_t);

                // Only blend 50% of original color to applied color when hurt effect is active and no poison,
                // so applied color didn't looks like too affected by effect
                applied = applied.interpolate(color, if (poison_t_equal_zero) 0.5 else 0.25);
            }

            return applied;
        }

        /// Calculates a fade value based on a threshold.
        pub fn fadeValue(x: f32, comptime after: comptime_float) f32 {
            return if (x < after)
                x / after
            else
                1;
        }

        const hp_bar_line_width: comptime_float = 5;

        const hp_bar_info_size: comptime_float = hp_bar_line_width + 1;
        const two_minus_hp_bar_info_size: comptime_float = 2 - hp_bar_info_size;
        const hp_bar_info_size_plus_two: comptime_float = hp_bar_info_size + 2;

        /// Renders entity status indicators like health bars.
        pub fn drawEntityStatuses(self: *const @This()) void {
            var ctx = self.ctx;
            const entity = self.entity;
            const impl = &entity.impl;

            if (is_mob_impl and (impl.type.isPetal() or impl.type.isMobTypeOf(.missile_projectile)))
                return;

            if (entity.hp_alpha <= 0) return;

            if (!entity.is_dead and entity.health < 1) {
                ctx.save();
                defer ctx.restore();

                var hp_bar_max_width: f32 = 0;

                if (is_player_impl) {
                    hp_bar_max_width = 45;

                    ctx.translate(0, entity.size);
                    ctx.translate(-hp_bar_max_width / 2.0, 9.0 / 2.0 + 5);
                } else {
                    const profile = impl.mobProfile() orelse return;
                    const name = profile.i18n.name;
                    const collision = profile.collision;
                    const radius = collision.radius;
                    const fraction = collision.fraction;

                    // Diameter, same as server-side
                    hp_bar_max_width = 2 * (radius * (entity.size / fraction));

                    const y_translate = 8 * (entity.size * radius) / (5 * fraction);

                    ctx.translate(-hp_bar_max_width / 2.0, y_translate);

                    if (is_mob_impl) {
                        ctx.setTextAlign(.left);
                        setupFont(ctx, hp_bar_info_size);
                        ctx.fillColor(comptime .comptimeFromHex(0xFFFFFF));

                        ctx.strokeText(name, -1, two_minus_hp_bar_info_size);
                        ctx.fillText(name, -1, two_minus_hp_bar_info_size);

                        if (impl.rarity.color()) |rarity_color| {
                            if (impl.rarity.name()) |rarity_name| {
                                const rarity_name_translate_x = hp_bar_max_width + 2;

                                ctx.setTextAlign(.right);
                                ctx.fillColor(rarity_color);

                                ctx.strokeText(rarity_name, rarity_name_translate_x, hp_bar_info_size_plus_two);
                                ctx.fillText(rarity_name, rarity_name_translate_x, hp_bar_info_size_plus_two);
                            }
                        }
                    }
                }

                ctx.setLineCap(.round);
                ctx.setGlobalAlpha(entity.hp_alpha);

                { // Health bar background
                    ctx.beginPath();

                    ctx.moveTo(0, 0);
                    ctx.lineTo(hp_bar_max_width, 0);

                    ctx.setLineWidth(hp_bar_line_width);
                    ctx.strokeColor(comptime .comptimeFromHex(0x222222));
                    ctx.stroke();
                }

                if (entity.red_health > 0) {
                    ctx.setGlobalAlpha(fadeValue(entity.red_health, 0.05));

                    ctx.beginPath();

                    ctx.moveTo(0, 0);
                    ctx.lineTo(hp_bar_max_width * entity.red_health, 0);

                    ctx.setLineWidth(hp_bar_line_width * 0.44);
                    ctx.strokeColor(comptime .comptimeFromHex(0xFF2222));
                    ctx.stroke();
                }

                if (entity.health > 0) {
                    ctx.setGlobalAlpha(fadeValue(entity.health, 0.05));

                    ctx.beginPath();

                    ctx.moveTo(0, 0);
                    ctx.lineTo(hp_bar_max_width * entity.health, 0);

                    ctx.setLineWidth(hp_bar_line_width * 0.66);
                    ctx.strokeColor(comptime .comptimeFromHex(0x75DD34));
                    ctx.stroke();
                }
            }
        }
    };
}

/// Function type for entity renderers.
pub fn RenderFn(comptime AnyEntity: type) type {
    return *const fn (rctx: *RenderContext(AnyEntity)) void;
}

/// Creates a renderer type with initialization and render methods.
pub fn Renderer(
    comptime AnyEntity: type,
    comptime is_ancestor: bool,
    comptime render_fn: RenderFn(AnyEntity),
    comptime static_init_fn: ?*const fn (allocator: mem.Allocator) void,
) type {
    return struct {
        /// Performs any necessary static initialization for the renderer.
        pub fn initStatic(allocator: mem.Allocator) void {
            if (static_init_fn) |f|
                f(allocator);
        }

        /// Renders an entity using the specified render context.
        pub fn render(rctx: *RenderContext(AnyEntity)) void {
            if (is_ancestor) {
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

/// Renders an entity using its implementation renderer.
pub fn renderEntity(comptime Impl: type, rctx: *RenderContext(ValidatedImpl(Impl).Super)) void {
    if (!rctx.shouldRender()) return;

    const ctx = rctx.ctx;

    ctx.save();

    Impl.Renderer.render(rctx);

    ctx.restore();
}

/// Validates an entity implementation and returns itself.
pub fn ValidatedImpl(comptime Impl: type) type {
    if (!@hasDecl(Impl, "Super"))
        @compileError("entity implementation must have a Super declaration");

    if (!@hasDecl(Impl, "Renderer"))
        @compileError("entity implementation must have a Renderer declaration");

    return Impl;
}

const std = @import("std");
const mem = std.mem;
const math = std.math;
const debug = std.debug;

const assert = debug.assert;

const CanvasContext = @import("../../../../Kernel/WebAssembly/Interop/Canvas2D/CanvasContext.zig");
const Color = @import("../../../../Kernel/WebAssembly/Interop/Canvas2D/Color.zig");
const MobType = @import("../EntityType.zig").MobType;
const Entity = @import("../Entity.zig").Entity;
const Mobs = @import("../Entity.zig").Mobs;
const Players = @import("../Entity.zig").Players;
const setupFont = @import("../../../../Kernel/UI/Layout/Components/WellKnown/Text.zig").setupFont;
