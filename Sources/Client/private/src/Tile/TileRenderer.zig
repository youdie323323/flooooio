const std = @import("std");
const math = std.math;
const CanvasContext = @import("../WebAssembly/Interop/Canvas2D/CanvasContext.zig");
const Color = @import("../WebAssembly/Interop/Canvas2D/Color.zig");

const Tile = *CanvasContext;

/// Array of tiles.
const Tileset = []const Tile;

const Vector2 = @Vector(2, f32);

const U16Vector2 = @Vector(2, u16);

const two_vector: Vector2 = @splat(2);

const eighty_vector: Vector2 = @splat(80);

const one_over_three_vector: Vector2 = @splat(1.0 / 3.0);

const MapRenderingOptions = struct {
    ctx: *CanvasContext,

    tileset: Tileset,

    tile_size: Vector2,

    radius: Vector2 = @splat(1),

    pos: Vector2,

    screen: Vector2,

    scale: Vector2,
};

fn isWithinBound(
    pos: Vector2,
    size: Vector2,
    bound: Vector2,
) bool {
    const x, const y = pos;
    const size_width, const size_height = size;
    const bound_width, const bound_height = bound;

    // zig fmt: off
    return !(
        x + size_width < 0 or
        x > bound_width or
        y + size_height < 0 or
        y > bound_height
    );
    // zig fmt: on
}

fn renderTile(
    ctx: *CanvasContext,
    tile: Tile,
    pos: Vector2,
    size: Vector2,
    padding: Vector2,
) void {
    const x, const y = pos;
    const padded_size_x, const padded_size_y = size + padding;

    ctx.copyCanvasWithScale(
        tile,
        x,
        y,
        padded_size_x,
        padded_size_y,
    );
}

inline fn renderBoundaryCircle(
    ctx: *CanvasContext,
    center: Vector2,
    radius: Vector2,
    screen: Vector2,
    scale: Vector2,
) void {
    ctx.save();
    defer ctx.restore();

    ctx.beginPath();

    const center_x, const center_y = center;

    // These vectors (scale, radius, etc) is created with splat (its not 100%, but i cant think situation that used different value for each components)
    // so get scalar of these just access the first component
    const scale_scalar = scale[0];
    const radius_scalar = radius[0];

    const line_width = 5 * @reduce(.Add, screen) * scale_scalar;

    ctx.arc(
        center_x,
        center_y,
        (radius_scalar + 0.5) * scale_scalar + line_width / 2,
        0,
        math.tau,
        false,
    );

    ctx.setGlobalAlpha(0.15);
    ctx.setLineWidth(line_width);
    ctx.strokeColor(comptime Color.comptimeFromHexColorCode("#000000"));
    ctx.stroke();
}

pub fn renderGameTileset(options: MapRenderingOptions) void {
    const ctx = options.ctx;

    const tileset = options.tileset;
    const tile_size = options.tile_size;
    const radius = options.radius;
    const pos = options.pos;
    const screen = options.screen;
    const scale = options.scale;

    const grid_size = radius / eighty_vector;
    const grid_size_usize: U16Vector2 = @intFromFloat(grid_size);

    const scaled_tile_size = tile_size * scale;

    const center = @mulAdd(Vector2, scale, radius - pos, screen / two_vector);

    const start = center - (grid_size / two_vector * scaled_tile_size);

    for (0..grid_size_usize[0]) |i| {
        for (0..grid_size_usize[1]) |j| {
            const ij_vector: Vector2 = .{
                @floatFromInt(i),
                @floatFromInt(j),
            };

            const tile_pos = @mulAdd(Vector2, ij_vector, scaled_tile_size, start);

            if (isWithinBound(tile_pos, scaled_tile_size, screen)) {
                renderTile(ctx, tileset[0], tile_pos, scaled_tile_size, one_over_three_vector);
            }
        }
    }

    renderBoundaryCircle(
        ctx,
        center,
        radius,
        screen,
        scale,
    );
}
