const std = @import("std");
const math = std.math;
const CanvasContext = @import("../../WebAssembly/Interop/Canvas/CanvasContext.zig");
const Color = @import("../../WebAssembly/Interop/Canvas/Color.zig");
const allocator = @import("../../mem.zig").allocator;
const MobType = @import("../EntityType.zig").MobType;

/// A factor used for darken skin color.
/// Mainly used for stroke color.
pub const darkened_base: f32 = 0.1875;

pub fn RenderingContext(comptime Entity: type) type {
    return *const struct {
        /// Context to render entities.
        ctx: *CanvasContext,

        /// A entity used to render.
        entity: *Entity,

        /// Whether this rendering is specimen.
        is_specimen: bool,
    };
}

const hurt_target_color_middle = Color.comptimeFromRgbString("rgb(255, 0, 0)");
const hurt_target_color_last = Color.comptimeFromRgbString("rgb(255, 255, 255)");

const poison_target_color = Color.comptimeFromRgbString("rgb(189, 80, 255)");

pub fn RendererFn(comptime Entity: type) type {
    return *const fn (rctx: RenderingContext(Entity)) void;
}

pub fn Renderer(
    comptime Entity: type,
    comptime recursive: bool,
    render_fn: RendererFn(Entity),
    static_init_fn: ?*const fn () void,
) type {
    return struct {
        pub fn initStatic() void {
            if (comptime static_init_fn) |f| f();
        }

        /// Render the entity.
        pub fn render(rctx: RenderingContext(Entity)) void {
            if (comptime recursive) {
                const ctx = rctx.ctx;
                const entity = rctx.entity;
                const is_specimen = rctx.is_specimen;

                const x, const y = entity.pos;

                ctx.translate(x, y);

                if (!is_specimen) {
                    applyDeathAnimation(rctx);
                }
            }

            render_fn(rctx);
        }

        /// Whether entity should render.
        pub fn isRenderingCandidate(rctx: RenderingContext(Entity)) bool {
            const entity = rctx.entity;
            const is_specimen = rctx.is_specimen;

            return !(!is_specimen and entity.is_dead and entity.dead_t > 1);
        }

        /// Apply death animation to current context.
        pub fn applyDeathAnimation(rctx: RenderingContext(Entity)) void {
            const ctx = rctx.ctx;
            const entity = rctx.entity;

            if (entity.is_dead) {
                const impl = entity.impl;

                const is_leech =
                    // Check if entity is mob
                    @hasDecl(@TypeOf(impl), "type") and
                    entity.type.get() == @intFromEnum(MobType.leech);

                const sin_waved_dead_t = @sin(entity.dead_t * math.pi / (if (is_leech) 9 else 3));

                const scale = 1 + sin_waved_dead_t;

                ctx.scale(scale, scale);
                ctx.@"globalAlpha ="(ctx.global_alpha * (1 - (if (is_leech) 2 else 1) * sin_waved_dead_t));
            }
        }

        /// Blend colors based on entity effects.
        /// All effect times should ranged in [0, 1].
        pub fn blendStatusEffects(rctx: RenderingContext(Entity), color: Color) Color {
            const entity = rctx.entity;

            const hurt_t = entity.hurt_t;
            const poison_t = entity.poison_t;

            // No effects to apply
            if (hurt_t == 0 and poison_t == 0) return color;

            var applied: Color = color;

            // Apply effects

            if (poison_t > 0) applied = poison_target_color.interpolate(applied, 0.75 * (1 - poison_t));

            applied = Color.multiColorInterpolate(&.{ applied, hurt_target_color_middle, hurt_target_color_last }, 1 - hurt_t);

            return applied.interpolate(color, 0.5);
        }
    };
}

/// Render the entity.
pub fn renderEntity(comptime Impl: type, rctx: RenderingContext(Impl.Super)) void {
    const ctx = rctx.ctx;

    // Validate implementation
    comptime validateEntityImplementation(Impl);

    const EntityRenderer = Impl.Renderer;

    if (!EntityRenderer.isRenderingCandidate(rctx)) return;

    ctx.save();

    EntityRenderer.render(rctx);

    ctx.restore();
}

/// Validates the given Entity implementation object (type check).
inline fn validateEntityImplementation(comptime Impl: type) void {
    if (!@hasDecl(Impl, "Super"))
        @compileError("entity implementation must have a Super declaration");

    if (!@hasDecl(Impl, "Renderer"))
        @compileError("entity implementation must have a Renderer declaration");
}
