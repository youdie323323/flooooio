const std = @import("std");
const math = std.math;
const Allocator = std.mem.Allocator;
const CanvasContext = @import("../Interop/Canvas/CanvasContext.zig");
const S3fifo = @import("../zig-caches/S3fifo.zig").S3fifo;
const Color = @import("../Interop/Canvas/Color.zig");
const TileMap = @This();

pub const Vector2 = @Vector(2, f32);

const zero_vector: Vector2 = @splat(0);

const halfone_scalar_vector: Vector2 = @splat(0.5);

const one_scalar_vector: Vector2 = @splat(1);

const two_scalar_vector: Vector2 = @splat(2);

pub const Bounds = struct {
    top_left: Vector2,
    bottom_right: Vector2,
};

pub const TileMapLayer = struct {
    tiles: []const CanvasContext,
    data: []const []const u8,
};

pub const TileMapDebugOptions = struct {
    show_origin: bool = false,
    show_chunk_borders: bool = false,
    show_tile_borders: bool = false,
};

pub const TileMapOptions = struct {
    clamp_position_to_bounds: bool = false,
    tile_size: u32 = 16,
    layers: []const TileMapLayer,
    chunk_size: @Vector(2, u8) = .{ 4, 3 },
    chunk_border: Vector2 = @splat(1),
    chunk_buffer_max_items: u32 = 64,
    min_scale: ?f32 = null,
    max_scale: ?f32 = null,
    bounds: ?Bounds = null,
    debug: ?TileMapDebugOptions = null,
};

inline fn hashVector(vec: Vector2) u64 {
    const x = @as(u32, @intFromFloat(vec[0]));
    const y = @as(u32, @intFromFloat(vec[1]));

    return (@as(u64, x) << 32) | y;
}

const Chunk = CanvasContext;

const ChunkBuffer = S3fifo(u64, Chunk);

options: TileMapOptions,
chunk_buffer: ChunkBuffer,

pub fn init(allocator: Allocator, options: TileMapOptions) !TileMap {
    return .{
        .options = options,
        .chunk_buffer = ChunkBuffer.init(allocator, options.chunk_buffer_max_items),
    };
}

pub fn deinit(self: *TileMap) void {
    self.chunk_buffer.deinit();
}

inline fn generateChunk(
    self: *TileMap,
    chunk_position: Vector2,
    absolute_chunk_size_vector: Vector2,
    tile_size_vector: Vector2,
    chunk_size_vector: Vector2,
) !Chunk {
    const options = self.options;

    const chunk_ctx: Chunk = CanvasContext.createCanvasContext(
        absolute_chunk_size_vector[0],
        absolute_chunk_size_vector[1],
        false,
    );

    const top_left_tile: Vector2 = chunk_position * chunk_size_vector;
    const bottom_right_tile: Vector2 = top_left_tile + chunk_size_vector - one_scalar_vector;

    const bounds_top_left = if (options.bounds) |b| b.top_left else zero_vector;

    for (options.layers) |layer| {
        // const data = layer.data;
        const tiles = layer.tiles;

        var y_tile: f32 = top_left_tile[1];
        while (y_tile <= bottom_right_tile[1]) : (y_tile += 1) {
            var x_tile: f32 = top_left_tile[0];
            while (x_tile <= bottom_right_tile[0]) : (x_tile += 1) {
                const tile_position = Vector2{
                    x_tile,
                    y_tile,
                };

                const tile_data_position: Vector2 = tile_position - bounds_top_left;
                if (tile_data_position[0] < 0 or tile_data_position[1] < 0) continue;

                // const data_row_index: usize = @intFromFloat(tile_data_position[1]);
                // if (data_row_index >= data.len) continue;

                // const data_row = data[data_row_index];

                // const data_cell_index: usize = @intFromFloat(tile_data_position[0]);
                // if (data_cell_index >= data_row.len) continue;

                // const tile_data: usize = @intCast(data_row[data_cell_index]);
                // if (tile_data >= tiles.len) continue;

                const tile_absolute_position: Vector2 =
                    (tile_position * tile_size_vector) -
                    (chunk_position * absolute_chunk_size_vector);

                chunk_ctx.copyCanvasScaled(
                    tiles[0], // tiles[tile_data],
                    tile_absolute_position[0],
                    tile_absolute_position[1],
                    tile_size_vector[0],
                    tile_size_vector[1],
                );
            }
        }
    }

    return chunk_ctx;
}

inline fn drawChunk(
    _: *TileMap,
    ctx: CanvasContext,
    chunk: Chunk,
    size: Vector2,
    position: Vector2,
) void {
    ctx.copyCanvasScaled(
        chunk,
        position[0],
        position[1],
        size[0] + 1,
        size[1] + 1,
    );
}

pub fn draw(
    self: *TileMap,
    ctx: CanvasContext,
    screen: Vector2,
    position: Vector2,
    scale: f32,
) void {
    const options = self.options;

    const chunk_border = options.chunk_border;

    const chunk_size: Vector2 = @floatFromInt(options.chunk_size);

    const tile_size: f32 = @floatFromInt(options.tile_size);

    const tile_size_vector: Vector2 = @splat(tile_size);

    const absolute_chunk_size_vector: Vector2 = tile_size_vector * chunk_size;

    var actual_scale = scale;

    if (options.min_scale) |ms| {
        actual_scale = @max(actual_scale, ms);
    }

    if (options.max_scale) |ms| {
        actual_scale = @min(actual_scale, ms);
    }

    const actual_scale_vector: Vector2 = @splat(actual_scale);
    const actual_scale_vector_2mul: Vector2 = actual_scale_vector * two_scalar_vector;

    const half_screen_scaled: Vector2 = @ceil(screen / actual_scale_vector_2mul);

    var actual_position: Vector2 = undefined;

    if (options.clamp_position_to_bounds) {
        if (options.bounds) |bounds| {
            const tile_size_scaled: Vector2 = tile_size_vector / actual_scale_vector;
            const min_position: Vector2 = @mulAdd(Vector2, bounds.top_left, tile_size_scaled, half_screen_scaled);
            const max_position: Vector2 = @mulAdd(Vector2, bounds.bottom_right, tile_size_scaled, -half_screen_scaled);

            actual_position = math.clamp(position, min_position, max_position);
        } else {
            actual_position = position;
        }
    } else {
        actual_position = position;
    }

    const screen_center_chunk: Vector2 = @floor(actual_position / absolute_chunk_size_vector);

    const half_screen_size_in_chunks: Vector2 = @ceil(
        // Original calculation: (screen / (actual_scale_vector * absolute_chunk_size_vector)) * halfone_scalar_vector
        (halfone_scalar_vector * screen) / (actual_scale_vector * absolute_chunk_size_vector),
    );

    const top_left_chunk: Vector2 = (screen_center_chunk - half_screen_size_in_chunks) - chunk_border;
    const bottom_right_chunk: Vector2 = (screen_center_chunk + half_screen_size_in_chunks) + chunk_border;

    const translate_position: Vector2 = half_screen_scaled - actual_position;

    ctx.save();

    ctx.setImageSmoothingEnabled(false);

    ctx.scale(actual_scale, actual_scale);
    ctx.translate(
        translate_position[0],
        translate_position[1],
    );

    var y_chunk: f32 = top_left_chunk[1];
    while (y_chunk < bottom_right_chunk[1]) : (y_chunk += 1) {
        var x_chunk: f32 = top_left_chunk[0];
        while (x_chunk < bottom_right_chunk[0]) : (x_chunk += 1) {
            const chunk_position = Vector2{
                x_chunk,
                y_chunk,
            };

            const absolute_chunk_position = chunk_position * absolute_chunk_size_vector;

            const chunk_hash = hashVector(chunk_position);

            if (self.chunk_buffer.get(chunk_hash)) |chunk| {
                self.drawChunk(ctx, chunk, absolute_chunk_size_vector, absolute_chunk_position);
            } else {
                const chunk = self.generateChunk(
                    chunk_position,
                    absolute_chunk_size_vector,
                    tile_size_vector,
                    chunk_size,
                ) catch continue;

                self.chunk_buffer.insert(chunk_hash, chunk) catch unreachable;

                self.drawChunk(ctx, chunk, absolute_chunk_size_vector, absolute_chunk_position);
            }
        }
    }

    if (self.options.debug) |debug| {
        if (debug.show_tile_borders) {
            const top_left_tile = @floor((screen_center_chunk - half_screen_size_in_chunks - one_scalar_vector) * chunk_size);
            const bottom_right_tile = @ceil((screen_center_chunk + half_screen_size_in_chunks + one_scalar_vector) * chunk_size);

            ctx.strokeColor(comptime Color.fromHex("ffa500")); // orange
            ctx.setLineWidth(2);

            var y: f32 = top_left_tile[1];
            while (y < bottom_right_tile[1]) : (y += 1) {
                const start = Vector2{
                    actual_position[0] - screen[0] / (actual_scale * 2),
                    y * tile_size,
                };
                const end = Vector2{
                    actual_position[0] + screen[0] / (actual_scale * 2),
                    y * tile_size,
                };

                drawLine(ctx, start, end);
            }

            var x: f32 = top_left_tile[0];
            while (x < bottom_right_tile[0]) : (x += 1) {
                const start = Vector2{
                    x * tile_size,
                    actual_position[1] - screen[1] / (actual_scale * 2),
                };
                const end = Vector2{
                    x * tile_size,
                    actual_position[1] + screen[1] / (actual_scale * 2),
                };

                drawLine(ctx, start, end);
            }
        }

        if (debug.show_chunk_borders) {
            ctx.strokeColor(comptime Color.fromHex("ffff00")); // yellow
            ctx.setLineWidth(4);

            var y: f32 = top_left_chunk[1];
            while (y < bottom_right_chunk[1]) : (y += 1) {
                const start = Vector2{
                    actual_position[0] - screen[0] / (actual_scale * 2),
                    y * absolute_chunk_size_vector[1],
                };
                const end = Vector2{
                    actual_position[0] + screen[0] / (actual_scale * 2),
                    y * absolute_chunk_size_vector[1],
                };

                drawLine(ctx, start, end);
            }

            var x: f32 = top_left_chunk[0];
            while (x < bottom_right_chunk[0]) : (x += 1) {
                const start = Vector2{
                    x * absolute_chunk_size_vector[0],
                    actual_position[1] - screen[1] / (actual_scale * 2),
                };
                const end = Vector2{
                    x * absolute_chunk_size_vector[0],
                    actual_position[1] + screen[1] / (actual_scale * 2),
                };

                drawLine(ctx, start, end);
            }
        }

        if (debug.show_origin) {
            const in_view = pointInBounds(
                zero_vector,
                top_left_chunk,
                bottom_right_chunk,
            );

            if (in_view) {
                drawCross(ctx, zero_vector, 20);
            }
        }
    }

    ctx.restore();
}

fn drawLine(ctx: CanvasContext, start: Vector2, end: Vector2) void {
    ctx.beginPath();
    ctx.moveTo(start[0], start[1]);
    ctx.lineTo(end[0], end[1]);
    ctx.stroke();
}

fn drawCross(ctx: CanvasContext, position: Vector2, size: f32) void {
    const half_size = @ceil(size / 2);

    ctx.strokeColor(comptime Color.fromHex("00ffff")); // cyan
    ctx.setLineWidth(2);

    ctx.beginPath();
    ctx.moveTo(position[0] - half_size, position[1] - half_size);
    ctx.lineTo(position[0] + half_size, position[1] + half_size);
    ctx.moveTo(position[0] - half_size, position[1] + half_size);
    ctx.lineTo(position[0] + half_size, position[1] - half_size);
    ctx.stroke();
}

fn pointInBounds(point: Vector2, top_left: Vector2, bottom_right: Vector2) bool {
    return point[0] >= top_left[0] and
        point[1] >= top_left[1] and
        point[0] < bottom_right[0] and
        point[1] < bottom_right[1];
}
