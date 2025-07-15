/// Factor used to darken skin colors.
pub const skin_darken: comptime_float = 0.2;

/// Factor used for darken a body color.
pub const body_darken: comptime_float = 0.1;

/// Creates a render context for the specified entity type.
pub fn RenderContext(comptime AnyEntity: type) type {
    return *const struct {
        const AnyImpl =
            if (@hasField(AnyEntity, "impl"))
                @FieldType(AnyEntity, "impl")
            else
                @compileError("AnyEntity must have an implementation");

        const TypedAnyEntity = Entity(AnyImpl);
        const TypedAnyImpl = @FieldType(TypedAnyEntity, "impl");

        comptime { // Ensure they are same type
            debug.assert(TypedAnyEntity == AnyEntity);
            debug.assert(TypedAnyImpl == AnyImpl);
        }

        const is_mob_impl = @hasField(TypedAnyImpl, "type");
        const is_player_impl = !is_mob_impl;

        /// Canvas context to render this render context.
        ctx: *CanvasContext,

        /// A entity used to render this render context.
        entity: *TypedAnyEntity,

        /// Whether this render context is specimen.
        is_specimen: bool,

        players: *Main.Players,
        mobs: *Main.Mobs,

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
            const impl = entity.impl;

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

                const scale = 1 + sin_waved_dead_t;

                ctx.scale(scale, scale);
                ctx.setGlobalAlpha(ctx.globalAlpha() * (1 - sin_waved_dead_t));
            }
        }

        const hurt_target_color_middle: Color = .comptimeFromRgbString("rgb(255, 0, 0)");
        const hurt_target_color_last: Color = .comptimeFromRgbString("rgb(255, 255, 255)");

        const poison_target_color: Color = .comptimeFromRgbString("rgb(189, 80, 255)");

        /// Blend colors based on this render context entity effect values.
        /// All effect values should ranged in [0, 1].
        pub fn blendEffectColors(self: *const @This(), color: Color) Color {
            const entity = self.entity;

            const hurt_t = entity.hurt_t;
            const poison_t = entity.poison_t;

            // No effects to apply
            if (hurt_t == 0 and poison_t == 0) return color;

            // Copy color
            var applied: Color = color;

            { // Apply effects
                // Poison effect
                if (poison_t > 0) applied = applied.interpolate(poison_target_color, 1 - poison_t);

                // Damage effect
                applied = Color.nColorInterpolate(&.{ applied, hurt_target_color_middle, hurt_target_color_last }, 1 - hurt_t);
            }

            return applied.interpolate(color, 0.5);
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

        /// Renders entity status indicators like health bars.
        pub fn drawEntityStatuses(self: *const @This()) void {
            var ctx = self.ctx;
            const entity = self.entity;
            const impl = entity.impl;

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
                        ctx.fillColor(comptime Color.comptimeFromHexColorCode("#ffffff"));

                        ctx.strokeText(name, -1, comptime (-hp_bar_info_size + 2));
                        ctx.fillText(name, -1, comptime (-hp_bar_info_size + 2));

                        if (entity.impl.rarity.color()) |rarity_color| {
                            if (entity.impl.rarity.name()) |rarity_name| {
                                const rarity_name_translate_x = hp_bar_max_width + 2;

                                ctx.setTextAlign(.right);
                                ctx.fillColor(rarity_color);

                                ctx.strokeText(rarity_name, rarity_name_translate_x, comptime (hp_bar_info_size + 2));
                                ctx.fillText(rarity_name, rarity_name_translate_x, comptime (hp_bar_info_size + 2));
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
                    ctx.strokeColor(comptime Color.comptimeFromHexColorCode("#222222"));
                    ctx.stroke();
                }

                if (entity.red_health > 0) {
                    ctx.setGlobalAlpha(fadeValue(entity.red_health, 0.05));

                    ctx.beginPath();

                    ctx.moveTo(0, 0);
                    ctx.lineTo(hp_bar_max_width * entity.red_health, 0);

                    ctx.setLineWidth(hp_bar_line_width * 0.44);
                    ctx.strokeColor(comptime Color.comptimeFromHexColorCode("#ff2222"));
                    ctx.stroke();
                }

                if (entity.health > 0) {
                    ctx.setGlobalAlpha(fadeValue(entity.health, 0.05));

                    ctx.beginPath();

                    ctx.moveTo(0, 0);
                    ctx.lineTo(hp_bar_max_width * entity.health, 0);

                    ctx.setLineWidth(hp_bar_line_width * 0.66);
                    ctx.strokeColor(comptime Color.comptimeFromHexColorCode("#75dd34"));
                    ctx.stroke();
                }
            }
        }
    };
}

/// Defines a function type for entity renderers.
pub fn RenderFn(comptime AnyEntity: type) type {
    return *const fn (rctx: RenderContext(AnyEntity)) void;
}

/// Creates a renderer type with initialization and render methods.
pub fn Renderer(
    comptime AnyEntity: type,
    comptime is_ancestor: bool,
    comptime render_fn: RenderFn(AnyEntity),
    comptime static_init_fn: ?*const fn (allocator: std.mem.Allocator) void,
) type {
    return struct {
        /// Performs any necessary static initialization for the renderer.
        pub fn staticInit(allocator: std.mem.Allocator) void {
            if (comptime static_init_fn) |f| f(allocator);
        }

        /// Renders an entity using the specified render context.
        pub fn render(rctx: RenderContext(AnyEntity)) void {
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

/// Renders an entity using its implementation's renderer.
pub fn renderEntity(comptime Impl: type, rctx: RenderContext(Impl.Super)) void {
    // Validate implementation
    comptime validateEntityImplementation(Impl);

    if (!rctx.shouldRender()) return;

    const ctx = rctx.ctx;

    ctx.save();
    defer ctx.restore();

    Impl.Renderer.render(rctx);
}

/// Validates that an entity implementation has the required declarations.
/// TODO: too much locations use this function, decide one robust location to call.
pub fn validateEntityImplementation(comptime Impl: type) void {
    if (!@hasDecl(Impl, "Super"))
        @compileError("entity implementation must have a Super declaration");

    if (!@hasDecl(Impl, "Renderer"))
        @compileError("entity implementation must have a Renderer declaration");
}

const std = @import("std");
const math = std.math;
const debug = std.debug;

const CanvasContext = @import("../../../../Kernel/WebAssembly/Interop/Canvas2D/CanvasContext.zig");
const Color = @import("../../../../Kernel/WebAssembly/Interop/Canvas2D/Color.zig");
const MobType = @import("../EntityType.zig").MobType;
const Entity = @import("../Entity.zig").Entity;
const Main = @import("../../../../../main.zig");
const setupFont = @import("../../../../Kernel/UI/Layout/Components/WellKnown/Text.zig").setupFont;
