const std = @import("std");
const math = std.math;
const Allocator = std.mem.Allocator;
const CanvasContext = @import("../WebAssembly/Interop/Canvas2D/CanvasContext.zig");
const S3FIFO = @import("./S3FIFO/S3FIFO.zig").S3FIFO;
const Color = @import("../WebAssembly/Interop/Canvas2D/Color.zig");
const Deque = @import("./S3FIFO/Deque.zig").Deque;
const TileMap = @This();

pub const Vector2 = @Vector(2, f32);

inline fn szudzikPair(x: f32, y: f32) i64 {
    return @intFromFloat(
        if (x >= y)
            @mulAdd(f32, x, x, x + y)
        else
            @mulAdd(f32, y, y, x),
    );
}

const U16Vector2 = @Vector(2, u16);

const zero_vector: Vector2 = @splat(0);

const halfone_vector: Vector2 = @splat(0.5);

const one_vector: Vector2 = @splat(1);

const two_vector: Vector2 = @splat(2);

pub const Bounds = struct {
    top_left: Vector2,
    bottom_right: Vector2,
};

pub const TileMapLayer = struct {
    tiles: []const *CanvasContext,
    data: []const []const u8,
};

pub const TileMapOptions = struct {
    tile_size: U16Vector2 = @splat(16),
    chunk_size: U16Vector2 = .{ 4, 3 },
    chunk_border: U16Vector2 = @splat(1),
    chunk_max_cache_size: u32 = 64,
    layers: []const TileMapLayer,
    bounds: ?Bounds = null,
    scale_bound: Vector2 = .{ -math.inf(f32), math.inf(f32) },
};

const Chunk = *CanvasContext;

const ChunkCacheKey = i64;

const ChunkCache = S3FIFO(ChunkCacheKey, Chunk, *TileMap, onChunkEvict);

const ChunkList = Deque(Chunk);

fn onChunkEvict(self: *TileMap, _: ChunkCacheKey, chunk: Chunk) void {
    self.pending_destruction.pushBack(chunk) catch {
        // Force deinit if not enough memory
        chunk.deinit();
    };
}

options: TileMapOptions,
chunk_cache: ChunkCache,
pending_destruction: ChunkList,

pub fn init(allocator: Allocator, options: TileMapOptions) Allocator.Error!TileMap {
    var tile_map: TileMap = .{
        .options = options,
        .chunk_cache = undefined,
        .pending_destruction = try ChunkList.init(allocator),
    };

    tile_map.chunk_cache = try ChunkCache.init(allocator, &tile_map, options.chunk_max_cache_size);

    return tile_map;
}

pub fn deinit(self: *TileMap) void {
    self.chunk_cache.deinit();
    self.pending_destruction.deinit();

    self.* = undefined;
}

inline fn generateChunk(
    self: TileMap,
    chunk_position: Vector2,
    absolute_chunk_position: Vector2,
    absolute_chunk_size: Vector2,
    tile_size: Vector2,
    chunk_size: Vector2,
) Chunk {
    const options = self.options;

    const chunk_ctx: Chunk = CanvasContext.createCanvasContext(
        absolute_chunk_size[0],
        absolute_chunk_size[1],
        false,
    );

    const tile_size_w: f32, const tile_size_h: f32 = tile_size;

    const top_left_tile: Vector2 = chunk_position * chunk_size;
    const top_left_tile_x: f32, const top_left_tile_y: f32 = top_left_tile;

    const bottom_right_tile: Vector2 = top_left_tile + chunk_size - one_vector;
    const bottom_right_tile_x: f32, const bottom_right_tile_y: f32 = bottom_right_tile;

    const bounds_top_left = if (options.bounds) |b| b.top_left else zero_vector;

    chunk_ctx.@"imageSmoothingEnabled ="(false);

    for (options.layers) |layer| {
        // const data = layer.data;
        const tiles = layer.tiles;

        var y_tile: f32 = top_left_tile_y;
        while (y_tile <= bottom_right_tile_y) : (y_tile += 1) {
            var x_tile: f32 = top_left_tile_x;
            while (x_tile <= bottom_right_tile_x) : (x_tile += 1) {
                const tile_position = Vector2{ x_tile, y_tile };

                const tile_data_position: Vector2 = tile_position - bounds_top_left;
                if (tile_data_position[0] < 0 or tile_data_position[1] < 0) continue;

                // const data_row_index: usize = @intFromFloat(tile_data_position[1]);
                // if (data_row_index >= data.len) continue;

                // const data_row = data[data_row_index];

                // const data_cell_index: usize = @intFromFloat(tile_data_position[0]);
                // if (data_cell_index >= data_row.len) continue;

                // const tile_data: usize = @intCast(data_row[data_cell_index]);
                // if (tile_data >= tiles.len) continue;

                const tile_absolute_position_x: f32, const tile_absolute_position_y: f32 =
                    @mulAdd(Vector2, tile_position, tile_size, -absolute_chunk_position);

                chunk_ctx.copyCanvasWithScale(
                    tiles[0], // tiles[tile_data],
                    tile_absolute_position_x,
                    tile_absolute_position_y,
                    tile_size_w,
                    tile_size_h,
                );
            }
        }
    }

    return chunk_ctx;
}

inline fn drawChunk(
    _: TileMap,
    ctx: *CanvasContext,
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
    ctx: *CanvasContext,
    screen: Vector2,
    position: Vector2,
    scale: f32,
) !void {
    @setRuntimeSafety(false);
    
    const options = self.options;

    const tile_size: Vector2 = @floatFromInt(options.tile_size);

    const chunk_size: Vector2 = @floatFromInt(options.chunk_size);

    const chunk_border: Vector2 = @floatFromInt(options.chunk_border);

    const scale_bound_lower: f32, const scale_bound_upper: f32 = options.scale_bound;

    // tile_size and chunk_size are u16 vector, so this vector is actually integer vector
    const absolute_chunk_size: Vector2 = tile_size * chunk_size;

    const actual_scale: f32 = math.clamp(scale, scale_bound_lower, scale_bound_upper);
    const actual_scale_vector: Vector2 = @splat(actual_scale);
    const actual_scale_vector_2mul: Vector2 = actual_scale_vector * two_vector;

    const half_screen_scaled: Vector2 = @ceil(screen / actual_scale_vector_2mul);

    const actual_position: Vector2 = @round(if (options.bounds) |bounds| blk: {
        const tile_size_scaled: Vector2 = tile_size / actual_scale_vector;
        const min_position = @mulAdd(Vector2, bounds.top_left, tile_size_scaled, half_screen_scaled);
        const max_position = @mulAdd(Vector2, bounds.bottom_right, tile_size_scaled, -half_screen_scaled);

        break :blk math.clamp(position, min_position, max_position);
    } else position);

    const screen_center_chunk: Vector2 = @divFloor(actual_position, absolute_chunk_size);

    const half_screen_size_in_chunks: Vector2 = @ceil(
        // Original calculation: (screen / (actual_scale_vector * absolute_chunk_size_vector)) * halfone_scalar_vector
        (halfone_vector * screen) / (actual_scale_vector * absolute_chunk_size),
    );

    // screen_center_chunk is floor'ed, half_screen_size_in_chunks is ceil'ed, chunk_border is u16 vector
    // so top_left_chunk, bottom_right_chunk is integer vector
    const top_left_chunk_x: f32, const top_left_chunk_y: f32 = (screen_center_chunk - half_screen_size_in_chunks) - chunk_border;
    const bottom_right_chunk_x: f32, const bottom_right_chunk_y: f32 = (screen_center_chunk + half_screen_size_in_chunks) + chunk_border;

    // Using round here because of:
    // https://stackoverflow.com/questions/9942209/unwanted-lines-appearing-in-html5-canvas-using-tiles
    // I̶ ̶d̶i̶d̶ ̶t̶h̶i̶s̶ ̶t̶o̶ ̶a̶b̶s̶o̶l̶u̶t̶e̶_̶c̶h̶u̶n̶k̶_̶p̶o̶s̶i̶t̶i̶o̶n̶ ̶t̶o̶o̶
    // half_screen_scaled and actual_position is actually integer vector,
    // so no need to round
    const translate_position_x: f32, const translate_position_y: f32 = half_screen_scaled - actual_position;

    ctx.save();

    ctx.@"imageSmoothingEnabled ="(false);

    ctx.scale(
        actual_scale,
        actual_scale,
    );
    ctx.translate(
        translate_position_x,
        translate_position_y,
    );

    var y_chunk: f32 = top_left_chunk_y;
    while (y_chunk < bottom_right_chunk_y) : (y_chunk += 1) {
        var x_chunk: f32 = top_left_chunk_x;
        while (x_chunk < bottom_right_chunk_x) : (x_chunk += 1) {
            const chunk_position = Vector2{ x_chunk, y_chunk };

            const chunk_hash = szudzikPair(x_chunk, y_chunk);

            // chunk_position and absolute_chunk_size_vector is actually integer vector, so no need to round
            const absolute_chunk_position: Vector2 = chunk_position * absolute_chunk_size;

            if (self.chunk_cache.get(chunk_hash)) |chunk|
                self.drawChunk(ctx, chunk, absolute_chunk_position)
            else {
                const chunk = self.generateChunk(
                    chunk_position,
                    absolute_chunk_position,
                    absolute_chunk_size,
                    tile_size,
                    chunk_size,
                );

                try self.chunk_cache.insert(chunk_hash, chunk);

                self.drawChunk(ctx, chunk, absolute_chunk_position);
            }
        }
    }

    ctx.restore();

    // Deinit all pending chunks
    while (self.pending_destruction.popBack()) |chunk| chunk.deinit();
}
