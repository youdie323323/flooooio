const std = @import("std");
const CanvasContext = @import("../WebAssembly/Interop/Canvas/CanvasContext.zig");
const Component = @import("./Layout/Components/Component.zig");
const Color = @import("../WebAssembly/Interop/Canvas/Color.zig");
const Allocator = std.mem.Allocator;
const UI = @This();

pub const Point = @Vector(2, f32);

pub const Components = std.BoundedArray(*Component, std.math.pow(usize, 2, 8));

ctx: CanvasContext,
components: Components,
mouse_position: Point,
allocator: Allocator,
hovered_component: ?*Component = null,
clicked_component: ?*Component = null,

pub fn init(allocator: Allocator, ctx: CanvasContext) error{Overflow}!UI {
    return .{
        .ctx = ctx,
        .components = try Components.init(0),
        .mouse_position = .{ 0, 0 },
        .allocator = allocator,
    };
}

pub fn addComponent(self: *UI, component: *Component) error{Overflow}!void {
    try self.components.append(component);
}

pub fn removeComponent(self: *UI, component: *Component) void {
    for (self.components.constSlice(), 0..) |c, i| {
        if (std.meta.eql(c, component)) {
            _ = self.components.orderedRemove(i);

            break;
        }
    }
}

inline fn isPointInComponent(p: Point, component: *Component) bool {
    const p_x, const p_y = p;

    return p_x >= component.x and p_x <= component.x + component.w and
        p_y >= component.y and p_y <= component.y + component.h;
}

pub fn render(self: *UI) void {
    // Clear canvas
    self.ctx.clearContextRect();

    // Render all components
    for (self.components.constSlice()) |component| {
        if (component.is_visible) {
            self.ctx.fillStyle(comptime (Color.comptimeFromCSSColorName("mintcream").lightened(0.1)));
            self.ctx.rect(component.x, component.y, component.w, component.h);
            self.ctx.fill();
        }
    }
}

pub fn destroy(self: *UI) void {
    for (self.components.constSlice()) |component| {
        component.destroy();
    }
}
