const std = @import("std");
const math = std.math;
const Allocator = std.mem.Allocator;
const CanvasContext = @import("../Dom/Canvas/CanvasContext.zig");
const LruCache = @import("../zig-caches/lru/LruCache.zig").LruCache;
const Color = @import("../Dom/Color.zig");
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

pub const TileMapOptions = struct {
    clamp_position_to_bounds: bool = false,
    tile_size: u32 = 16,
    layers: []const TileMapLayer,
    chunk_size: Vector2 = Vector2{ 4, 3 },
    chunk_border: Vector2 = @splat(1),
    chunk_buffer_max_items: u32 = 64,
    min_scale: ?f32 = null,
    max_scale: ?f32 = null,
    bounds: ?Bounds = null,
};

inline fn hashVector(vec: Vector2) u64 {
    const x = @as(u32, @intFromFloat(vec[0]));
    const y = @as(u32, @intFromFloat(vec[1]));

    return (@as(u64, x) << 32) | y;
}

const Chunk = CanvasContext;

const ChunkBuffer = LruCache(.non_locking, u64, Chunk);

options: TileMapOptions,
chunk_buffer: ChunkBuffer,

pub fn init(allocator: Allocator, options: TileMapOptions) !TileMap {
    return .{
        .options = options,
        .chunk_buffer = try ChunkBuffer.init(allocator, options.chunk_buffer_max_items),
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
    position: Vector2,
) void {
    ctx.copyCanvas(
        chunk,
        position[0],
        position[1],
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

    const chunk_size = options.chunk_size;

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
            const min_position: Vector2 = bounds.top_left * tile_size_scaled + half_screen_scaled;
            const max_position: Vector2 = bounds.bottom_right * tile_size_scaled - half_screen_scaled;

            actual_position = math.clamp(position, min_position, max_position);
        } else {
            actual_position = position;
        }
    } else {
        actual_position = position;
    }
    
    const screen_center_chunk: Vector2 = @floor(actual_position / absolute_chunk_size_vector);

    const half_screen_size_in_chunks: Vector2 = @ceil((halfone_scalar_vector * screen) / (actual_scale_vector * absolute_chunk_size_vector));

    const top_left_chunk: Vector2 = (screen_center_chunk - half_screen_size_in_chunks) - chunk_border;
    const bottom_right_chunk: Vector2 = (screen_center_chunk + half_screen_size_in_chunks) + chunk_border;

    const translate_position: Vector2 = (-actual_position) + half_screen_scaled;

    ctx.save();

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

            const chunk_absolute_position = chunk_position * absolute_chunk_size_vector;

            const chunk_hash = hashVector(chunk_position);

            if (self.chunk_buffer.get(chunk_hash)) |chunk| {
                self.drawChunk(ctx, chunk, chunk_absolute_position);
            } else {
                const chunk = self.generateChunk(
                    chunk_position,
                    absolute_chunk_size_vector,
                    tile_size_vector,
                    chunk_size,
                ) catch continue;

                _ = self.chunk_buffer.put(chunk_hash, chunk);

                self.drawChunk(ctx, chunk, chunk_absolute_position);
            }
        }
    }

    ctx.restore();
}
