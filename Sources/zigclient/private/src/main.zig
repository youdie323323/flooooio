const std = @import("std");
const builtin = std.builtin;
const math = std.math;
const allocator = std.heap.page_allocator;
const Color = @import("./Dom/Color.zig");

const EventTarget = @import("./Dom/EventTarget.zig");

const requestAnimationFrame = @import("./Dom/animationFrame.zig").requestAnimationFrame;

const CanvasContext = @import("./Dom/Canvas/CanvasContext.zig");
const Path2D = @import("./Dom/Canvas/Path2D.zig");

const UI = @import("./UI/UI.zig");

const Zoop = @import("./Zoop.zig");

const TileMap = @import("./Tile/TileMap.zig");

var ctx: CanvasContext = undefined;
var current_ui: UI = undefined;

var tile_map: TileMap = undefined;

fn onMouseMove() void {
    EventTarget.setProperty("canvas", "width", EventTarget.getProperty("canvas", "clientWidth"));
    EventTarget.setProperty("canvas", "height", EventTarget.getProperty("canvas", "clientHeight"));
}

export fn init() void {
    std.debug.print("init()", .{});

    onMouseMove();

    EventTarget.addEventListener("", "resize", onMouseMove);

    ctx = CanvasContext.getCanvasContextFromElement("canvas", false);

    current_ui = UI.init(ctx);

    var ctx_svg = CanvasContext.createCanvasContext(256 * 4, 256 * 4, false);

    ctx_svg.drawSvg(
        \\<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" viewBox="0 0 256 256">
        \\    <path fill="#E0D1AF" d="M0,0h256v256H0V0z"/>
        \\    <polyline fill="#D7C9A8" points="127.4,217.2 107.8,226.2 116.6,246 136.4,237.2 127.4,217.2 "/>
        \\    <polyline fill="#D7C9A8" points="215.8,222 218.2,200.2 196.4,198 194.2,219.8 215.8,222 "/>
        \\    <polyline fill="#D7C9A8" points="61.2,51.4 59,73 80.6,75.2 82.8,53.6 61.2,51.4 "/>
        \\    <polyline fill="#D7C9A8" points="118.4,34.8 115,13.4 93.6,16.8 97,38.2 118.4,34.8 "/>
        \\    <polygon fill="#D7C9A8" points="184.6,26.2 167,13.4 154.2,31.2 172,43.8 "/>
        \\    <path fill="#ECDCB8" d="M256,256v-91c-18.7,24.2-27.9,61.2-39.2,91H256"/>
        \\    <path fill="#ECDCB8" d="M29.8,29.2C33,18.9,36.7,9.2,41,0H0v92.6C14.3,73.5,23.5,53.3,29.8,29.2"/>
        \\    <path fill="#ECDCB8" d="M216.8,0c-21.7,48.5-71.6,86.2-118.3,98.3S23.7,131,0,165v91h41c23.9-52.5,68.7-90,117.3-99.1 s75.4-34.8,97.7-64.3V0H216.8"/>
        \\    <polyline fill="#F3E2BE" points="53.6,153.4 36.2,140.8 23.4,158.2 41,171 53.6,153.4 "/>
        \\    <polyline fill="#F3E2BE" points="52.8,181.4 34.4,187.8 40.6,206.2 59,200 52.8,181.4 "/>
        \\    <polyline fill="#F3E2BE" points="220.8,83.8 235.8,68 220,53 205,68.8 220.8,83.8 "/>
        \\    <polyline fill="#F3E2BE" points="188.8,99.2 181,119.6 201.6,127.6 209.2,107 188.8,99.2 "/>
        \\    <polygon fill="#F3E2BE" points="140.2,120.8 154,137.6 171,123.8 157,107 "/>
        \\</svg>
    );

    tile_map = TileMap.init(allocator, .{
        .tile_size = 128 * 4,
        .chunk_border = @splat(2),
        .layers = &[_]TileMap.TileMapLayer{
            TileMap.TileMapLayer{
                .tiles = &[_]CanvasContext{ctx_svg},
                .data = &[_][]const u8{
                    &[_]u8{ 0, 0 },
                    &[_]u8{ 0, 0 },
                },
            },
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

    ctx.save();

    ctx.scale(1, 1);

    ctx.translate(
        -position[0] + screen[0] / 2,
        -position[1] + screen[1] / 2,
    );

    ctx.fillColor(comptime Color.fromHex("ff0000"));
    
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, math.tau, false);
    ctx.fill();

    ctx.restore();

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
