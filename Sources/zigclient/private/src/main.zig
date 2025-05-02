const std = @import("std");
const builtin = std.builtin;
const math = std.math;
const allocator = std.heap.page_allocator;

const dom = @import("./Dom/Event.zig");

const requestAnimationFrame = @import("./Dom/animationFrame.zig").requestAnimationFrame;

const CanvasContext = @import("./Dom/Canvas/CanvasContext.zig");
const Path2D = @import("./Dom/Canvas/Path2D.zig");

const UI = @import("./UI/UI.zig");

const Zoop = @import("./Zoop.zig");

const TileMap = @import("./Tile/TileMap.zig");

var ctx: CanvasContext = undefined;
var current_ui: UI = undefined;

var tile_map: TileMap = undefined;

fn onResize(event: *const dom.Event) callconv(.C) void {
    const output = std.fmt.allocPrint(allocator, "{}", .{event}) catch unreachable;
    defer allocator.free(output);
    
    std.io.getStdOut().writeAll(output) catch unreachable;
}

export fn init() void {
    std.debug.print("init()", .{});

    dom.addGlobalEventListener(.window, .resize, onResize);

    ctx = CanvasContext.getCanvasContextFromElement("canvas", false);

    current_ui = UI.init(ctx);

    var ctx_svg = CanvasContext.createCanvasContext(256 * 4, 256 * 4, false);

    ctx_svg.drawSvg(
        \\<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" viewBox="0 0 256 256">
        \\    <path fill="#E0D1AF" d="M0,0h256v256H0V0z"/>
        \\    <polyline fill="#D7C9A8" points="84.2,214.9 76.4,235.1 96.5,243.1 104.6,223 84.2,214.9 "/>
        \\    <polyline fill="#D7C9A8" points="226.2,171.7 215.4,152.6 196.4,163.6 207.3,182.6 226.2,171.7 "/>
        \\    <polyline fill="#D7C9A8" points="19.8,81.8 36.3,96 50.4,79.6 34,65.4 19.8,81.8 "/>
        \\    <polyline fill="#D7C9A8" points="111.4,55 93.6,67.4 106,85.2 123.8,72.8 111.4,55 "/>
        \\    <polygon fill="#D7C9A8" points="104.6,14.9 82.8,14.7 82.7,36.6 104.5,36.5 "/>
        \\    <path fill="#ECDCB8" d="M256,256v-91c-18.7,24.2-27.9,61.2-39.2,91H256"/>
        \\    <path fill="#ECDCB8" d="M29.8,29.2C33,18.9,36.7,9.2,41,0H0v92.6C14.3,73.5,23.5,53.3,29.8,29.2"/>
        \\    <path fill="#ECDCB8" d="M216.8,0C195.1,48.5,158,105.2,98.5,98.3S23.7,131,0,165v91h41c23.9-52.5,51.4-81,117.3-99.1 s75.4-34.8,97.7-64.3V0H216.8"/>
        \\    <polyline fill="#F3E2BE" points="74.7,150 53.8,145.3 48.9,166.4 70.2,171.1 74.7,150 "/>
        \\    <polyline fill="#F3E2BE" points="27.4,213.1 12.9,226.1 25.7,240.7 40.3,227.9 27.4,213.1 "/>
        \\    <polyline fill="#F3E2BE" points="245.9,75.8 233.4,58 215.6,70.4 228.1,88.3 245.9,75.8 "/>
        \\    <polyline fill="#F3E2BE" points="175.1,107.1 184.3,126.9 204.4,117.6 194.8,97.8 175.1,107.1 "/>
        \\    <polygon fill="#F3E2BE" points="117.1,133.1 138.5,137 142.5,115.5 121,111.7 "/>
        \\    <polyline fill="#D7C9A8" points="177.6,25.3 161.7,10.1 146.7,26.1 162.6,41.1 177.6,25.3 "/>
        \\    <polyline fill="#D7C9A8" points="159.6,204.5 148.8,223.2 167.4,234.3 178.5,215.7 159.6,204.5 "/>
        \\</svg>
    );

    tile_map = TileMap.init(allocator, .{
        .tile_size = comptime 128 * 4,
        .chunk_border = comptime @splat(2),
        .layers = &[_]TileMap.TileMapLayer{
            TileMap.TileMapLayer{
                .tiles = &[_]CanvasContext{ctx_svg},
                .data = &[_][]const u8{
                    &[_]u8{ 0, 0 },
                    &[_]u8{ 0, 0 },
                },
            },
        },
        .debug = .{
            .show_chunk_borders = true,
            .show_origin = true,
            .show_tile_borders = true,
        },
    }) catch |err| {
        std.debug.print("Error: {}", .{err});

        return;
    };

    const psuperman = Zoop.new(allocator, SuperMan, null) catch |err| {
        std.debug.print("Error: {}", .{err});

        return;
    };
    psuperman.super.setName("super");

    std.debug.print("{d}", .{Zoop.getField(psuperman, "age", u8).*});
    std.debug.print("{d}", .{Zoop.getField(psuperman, "age", u16).*});
    std.debug.print("{s}", .{psuperman.super.name});

    draw(1);
}

var i: f64 = 0;

fn draw(_: f64) callconv(.C) void {
    ctx.save();

    current_ui.render();

    const sin_i = @as(f32, @floatCast(@sin(i)));

    const screen = TileMap.Vector2{ 3440, 1351 };
    const position = TileMap.Vector2{ sin_i * 500, sin_i * 500 };

    tile_map.draw(
        ctx,
        screen,
        position,
        1,
    );

    i += 0.005;

    ctx.restore();

    _ = requestAnimationFrame(draw);
}

// Define a class Human
pub const Human = struct {
    // The first field of the zoop class must be aligned to `zoop.alignment`
    name: []const u8 align(Zoop.alignment),
    age: u8 = 30,

    // If there is no cleanup work, can skip define `deinit`
    pub fn deinit(self: *Human) void {
        self.name = "";
    }

    pub fn getName(self: *const Human) []const u8 {
        return self.name;
    }

    pub fn setName(self: *Human, name: []const u8) void {
        self.name = name;
    }
};

pub const SuperMan = struct {
    super: Human align(Zoop.alignment),
    // SuperMan can live a long time, u8 can't satisfy it, we use u16
    age: u16 = 9999,

    pub fn getAge(self: *SuperMan) u16 {
        return self.age;
    }

    pub fn setAge(self: *SuperMan, age: u16) void {
        self.age = age;
    }
};
