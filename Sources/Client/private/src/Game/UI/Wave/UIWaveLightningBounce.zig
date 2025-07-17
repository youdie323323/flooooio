const LightningBounce = @This();

pub const Vector2 = @Vector(2, f32);

/// Total elpased time of this lightning bounce.
t: f32,
/// Lightning bounce path to render.
path: Path2D,

var rand: Random = undefined;

pub fn staticInit() void {
    var seed: u64 = undefined;

    posix.getrandom(mem.asBytes(&seed)) catch |err|
        debug.panic("Failed to get random seed: {}", .{err});

    var prng: Random.DefaultPrng = .init(seed);

    rand = prng.random();
}

fn distortValue(value: f32) f32 {
    return value + (4 * rand.float(f32) + 2);
}

const jitter_amount: f32 = 25;
const jitter_amount_vector: Vector2 = @splat(jitter_amount);

/// Callee owns array list memory.
pub fn init(allocator: mem.Allocator, points: *std.ArrayListUnmanaged(Vector2)) mem.Allocator.Error!LightningBounce {
    defer points.deinit(allocator);

    const bounces_path: Path2D = .init();

    const len = points.items.len;

    const first_point = points.items[0];
    const first_x, const first_y = first_point;

    // If lightning points length is equals to one, add distorted that one point, to render correctly
    if (len == 1) {
        try points.append(allocator, .{
            distortValue(first_x),
            distortValue(first_y),
        });
    }

    bounces_path.moveTo(first_x, first_y);

    for (0..(len - 1)) |i| {
        const start_point = points.items[i];
        const end_point = points.items[i + 1];

        const delta_point = end_point - start_point;
        const delta_x, const delta_y = delta_point;

        const total_distance = math.hypot(delta_x, delta_y);

        var current_distance: f32 = 0;

        while (current_distance < total_distance) {
            const ratio_vector: Vector2 = @splat(current_distance / total_distance);

            const jitter_vector: Vector2 = @as(Vector2, .{
                rand.float(f32) * 2 - 1,
                rand.float(f32) * 2 - 1,
            }) * jitter_amount_vector;

            const this_x, const this_y = start_point + ratio_vector * delta_point + jitter_vector;

            bounces_path.lineTo(this_x, this_y);

            current_distance += rand.float(f32) * 50 + 50;
        }

        const end_x, const end_y = end_point;
        bounces_path.lineTo(end_x, end_y);
    }

    return .{
        .t = 1,
        .path = bounces_path,
    };
}

const std = @import("std");
const mem = std.mem;
const posix = std.posix;
const debug = std.debug;
const math = std.math;
const Random = std.Random;

const Path2D = @import("../../Kernel/WebAssembly/Interop/Canvas2D/Path2D.zig");
