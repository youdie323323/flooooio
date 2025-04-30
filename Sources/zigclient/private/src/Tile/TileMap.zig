const std = @import("std");
const math = std.math;
const Allocator = std.mem.Allocator;
const CanvasRenderingContext2D = @import("../Dom/Canvas/CanvasRenderingContext2D.zig");
const LruCache = @import("../zig-caches/lru/LruCache.zig").LruCache;
const TileMap = @This();

pub const Vector2 = @Vector(2, f32);

pub const Bounds = struct {
    top_left: Vector2,
    bottom_right: Vector2,
};

pub const TileMapLayer = struct {
    tiles: []const CanvasRenderingContext2D,
    data: []const []const i32,
    opacity: f64 = 1.0,
};

pub const TileMapOptions = struct {
    clamp_position_to_bounds: bool = false,
    tile_size: u32 = 16,
    layers: []const TileMapLayer,
    chunk_size: u32 = 8,
    chunk_border: Vector2 = Vector2{ 1, 1 },
    chunk_buffer_max_items: u32 = 64,
    min_scale: ?f32 = null,
    max_scale: ?f32 = null,
    bounds: ?Bounds = null,
};

pub const TileMapChunk = struct {
    chunk_position: Vector2,
    image: CanvasRenderingContext2D,
};

fn map(vec: Vector2, callback: fn (f32) f32) Vector2 {
    return Vector2{
        callback(vec[0]),
        callback(vec[1]),
    };
}

inline fn pairvector(vec: Vector2) []const u8 {
    const x = vec[0];
    const y = vec[1];

    const mx = @max(x, y);

    var buffer: [16]u8 = undefined;

    return std.fmt.bufPrint(&buffer, "{d}", .{mx * mx + mx + x - y}) catch unreachable;
}

fn ceilf32(x: f32) f32 {
    return math.ceil(x);
}

fn floorf32(x: f32) f32 {
    return math.floor(x);
}

options: TileMapOptions,
chunk_buffer: LruCache(.non_locking, []const u8, TileMapChunk),

pub fn init(allocator: Allocator, options: TileMapOptions) !TileMap {
    return .{
        .options = options,
        .chunk_buffer = try LruCache(.non_locking, []const u8, TileMapChunk).init(allocator, options.chunk_buffer_max_items),
    };
}

pub fn deinit(self: *TileMap) void {
    self.chunk_buffer.deinit();
}

fn generateChunk(self: *TileMap, chunk_position: Vector2, absolute_chunk_size: f32) !TileMapChunk {
    const tile_size: f32 = @floatFromInt(self.options.tile_size);
    const chunk_size: f32 = @floatFromInt(self.options.chunk_size);

    const chunk_context = CanvasRenderingContext2D.createCanvas(absolute_chunk_size, absolute_chunk_size);

    const top_left_tile: Vector2 = chunk_position * @as(Vector2, @splat(chunk_size));
    const bottom_right_tile: Vector2 = top_left_tile + Vector2{ chunk_size - 1, chunk_size - 1 };

    const bounds_top_left = if (self.options.bounds) |b| b.top_left else comptime Vector2{ 0, 0 };

    chunk_context.save();

    for (self.options.layers) |layer| {
        const data = layer.data;
        const tiles = layer.tiles;

        // chunk_context.globalAlpha(layer.opacity);

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

                const data_row_index: usize = @intFromFloat(tile_data_position[1]);
                if (data_row_index >= data.len) continue;

                const data_row = data[data_row_index];

                const data_cell_index: usize = @intFromFloat(tile_data_position[0]);

                std.debug.print("{}", .{tile_data_position[0]});

                if (data_cell_index >= data_row.len) continue;

                const tile_data: usize = @intCast(data_row[data_cell_index]);

                if (tile_data >= tiles.len or tile_data == -1) continue;

                const tile_image = tiles[tile_data];

                const tile_absolute_position: Vector2 =
                    (tile_position * @as(Vector2, @splat(tile_size))) -
                    (chunk_position * @as(Vector2, @splat(absolute_chunk_size)));

                chunk_context.drawImage2(
                    tile_image,
                    tile_absolute_position[0],
                    tile_absolute_position[1],
                    tile_size,
                    tile_size,
                );
            }
        }
    }

    chunk_context.restore();

    return TileMapChunk{
        .chunk_position = chunk_position,
        .image = chunk_context,
    };
}

pub fn draw(
    self: *TileMap,
    context: CanvasRenderingContext2D,
    screen: Vector2,
    position: Vector2,
    scale: f32,
) void {
    const options = self.options;
    const tile_size = options.tile_size;
    const chunk_size = options.chunk_size;
    const chunk_border = options.chunk_border;
    const min_scale = options.min_scale;
    const max_scale = options.max_scale;
    const clamp_position_to_bounds = options.clamp_position_to_bounds;
    const bounds = options.bounds;

    const absolute_chunk_size: f32 = @floatFromInt(tile_size * chunk_size);
    const absolute_chunk_size_vector: Vector2 = @as(Vector2, @splat(absolute_chunk_size));

    var actual_scale = scale;
    if (min_scale) |ms| {
        actual_scale = @max(actual_scale, ms);
    }
    if (max_scale) |ms| {
        actual_scale = @min(actual_scale, ms);
    }

    var actual_position = position;
    if (clamp_position_to_bounds) {
        if (bounds) |b| {
            const tile_size_scaled: f32 = @as(f32, @floatFromInt(tile_size)) / actual_scale;
            const half_screen_scaled: Vector2 = map(screen * @as(Vector2, @splat(1 / (actual_scale * 2))), ceilf32);
            const min_position = Vector2{
                b.top_left[0] * tile_size_scaled + half_screen_scaled[0],
                b.top_left[1] * tile_size_scaled + half_screen_scaled[1],
            };
            const max_position = Vector2{
                b.bottom_right[0] * tile_size_scaled - half_screen_scaled[0],
                b.bottom_right[1] * tile_size_scaled - half_screen_scaled[1],
            };

            actual_position[0] = math.clamp(actual_position[0], min_position[0], max_position[0]);
            actual_position[1] = math.clamp(actual_position[1], min_position[1], max_position[1]);
        }
    }

    const screen_size_in_chunks: Vector2 = map(screen * @as(Vector2, @splat(1 / (absolute_chunk_size * actual_scale))), ceilf32);
    const screen_center_chunk: Vector2 = map(actual_position * @as(Vector2, @splat(1 / absolute_chunk_size)), floorf32);

    const half_screen_size_in_chunks: Vector2 = map(screen_size_in_chunks * comptime @as(Vector2, @splat(0.5)), ceilf32);

    const top_left_chunk: Vector2 = (screen_center_chunk - half_screen_size_in_chunks) - chunk_border;
    const bottom_right_chunk: Vector2 = (screen_center_chunk + half_screen_size_in_chunks) + chunk_border;

    context.save();

    context.scale(actual_scale, actual_scale);
    context.translate(
        -actual_position[0] + screen[0] / (actual_scale * 2),
        -actual_position[1] + screen[1] / (actual_scale * 2),
    );

    var y_chunk: i32 = @intFromFloat(top_left_chunk[1]);
    while (y_chunk <= @as(i32, @intFromFloat(bottom_right_chunk[1]))) : (y_chunk += 1) {
        var x_chunk: i32 = @intFromFloat(top_left_chunk[0]);
        while (x_chunk <= @as(i32, @intFromFloat(bottom_right_chunk[0]))) : (x_chunk += 1) {
            const chunk_position = Vector2{
                @as(f32, @floatFromInt(x_chunk)),
                @as(f32, @floatFromInt(y_chunk)),
            };

            const chunk_absolute_position = chunk_position * absolute_chunk_size_vector;

            const chunk_hash = pairvector(chunk_position);

            if (self.chunk_buffer.get(chunk_hash)) |chunk| {
                context.drawImage1(
                    chunk.image,
                    chunk_absolute_position[0],
                    chunk_absolute_position[1],
                );
            } else {
                const chunk = self.generateChunk(chunk_position, absolute_chunk_size) catch continue;

                _ = self.chunk_buffer.put(chunk_hash, chunk);

                context.drawImage1(
                    chunk.image,
                    chunk_absolute_position[0],
                    chunk_absolute_position[1],
                );
            }
        }
    }

    context.restore();
}
