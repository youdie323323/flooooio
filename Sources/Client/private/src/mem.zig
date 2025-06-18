const std = @import("std");
const testing = std.testing;
const heap = std.heap;

// IF SOME WEIRD BUG APPEARS, MUST CHECK BUFFER SIZE
// I WAS GOT STRESSED OUT FOR 2 WEEKS BECAUSE OF THAT
// 🤡 🤡 🤡 🤡 🤡 🤡 🤡 🤡 🤡 🤡 🤡 🤡 🤡 🤡 🤡

// Use fba for no-growed memory (growing memory disposes memory buffer and heaps cant used anymore)
// Maybe too big size?
var buffer: [std.wasm.page_size * 512]u8 = undefined;

var fba = std.heap.FixedBufferAllocator.init(&buffer);
pub const allocator = fba.allocator();

// Setting up the free/alloc functions also overrides malloc and free in C

const size_of_usize = @sizeOf(usize);

const alignment_of_usize = @alignOf(usize);

pub const MemoryPtr = *align(size_of_usize) anyopaque;

pub export fn malloc(size: usize) callconv(.c) MemoryPtr {
    const total_size = size + size_of_usize;
    const ptr = allocator.alignedAlloc(u8, alignment_of_usize, total_size) catch unreachable;

    @as(*usize, @ptrCast(ptr)).* = total_size;

    return ptr.ptr + size_of_usize;
}

pub export fn free(ptr: MemoryPtr) callconv(.c) void {
    const to_free = @as([*]align(size_of_usize) u8, @ptrCast(ptr)) - size_of_usize;
    const total_size = @as(*usize, @ptrCast(to_free)).*;

    allocator.free(to_free[0..total_size]);
}

test "malloc/free benchmark" {
    const sizes = [_]usize{ 8, 64, 512, 4096, 16384 };
    const iterations = 10000;

    std.debug.print("\nRunning malloc/free benchmark ({d} iterations each):\n", .{iterations});

    for (sizes) |size| {
        var i: usize = 0;

        var timer = try std.time.Timer.start();

        while (i < iterations) : (i += 1) {
            const ptr = malloc(size);
            defer free(ptr);

            const slice = @as([*]u8, @ptrCast(ptr))[0..size];
            @memset(slice, 0xAA);
        }

        const elapsed = timer.read();
        const avg_ns = @as(f64, @floatFromInt(elapsed)) / @as(f64, @floatFromInt(iterations));

        std.debug.print("Size: {d:>6} bytes | Total: {d:>10}ns | Avg: {d:>10.2}ns\n", .{
            size,
            elapsed,
            avg_ns,
        });
    }
}

pub const CStringPointer = [*:0]u8;
pub const ConstCStringPointer = [*:0]const u8;

pub fn allocCString(slice: []const u8) CStringPointer {
    return allocator.dupeZ(u8, slice) catch unreachable;
}

pub fn freeCString(ptr: CStringPointer) void {
    const len = std.mem.len(ptr) + 1;

    allocator.free(ptr[0..len]);
}

// https://zigbin.io/9a46a9
pub const comptime_allocator: Allocator = .{
    .ptr = undefined,
    .vtable = &.{ .alloc = &comptimeAlloc, .resize = &comptimeResize, .remap = &comptimeRemap, .free = &Allocator.noFree },
};

fn comptimeAlloc(_: *anyopaque, len: usize, alignment: Alignment, ra: usize) ?[*]u8 {
    _ = ra;
    if (!@inComptime()) @panic("comptimeAlloc called at runtime");
    var buf: [len]u8 align(alignment.toByteUnits()) = undefined;
    return &buf;
}

fn comptimeResize(_: *anyopaque, mem: []u8, alignment: Alignment, new_len: usize, ra: usize) bool {
    _ = alignment;
    _ = ra;
    if (!@inComptime()) @panic("comptimeResize called at runtime");
    return new_len <= mem.len; // allow shrinking in-place
}

fn comptimeRemap(_: *anyopaque, mem: []u8, alignment: Alignment, new_len: usize, ra: usize) ?[*]u8 {
    _ = alignment;
    _ = ra;
    if (!@inComptime()) @panic("comptimeRemap called at runtime");
    return if (new_len <= mem.len) mem.ptr else null; // allow shrinking in-place
}

const Allocator = std.mem.Allocator;
const Alignment = std.mem.Alignment;
