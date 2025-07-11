const std = @import("std");
const mem = std.mem;
const CanvasContext = @import("../WebAssembly/Interop/Canvas2D/CanvasContext.zig");
const Component = @import("Layout/Components/Component.zig");
const Color = @import("../WebAssembly/Interop/Canvas2D/Color.zig");
const UI = @This();

pub const Point = @Vector(2, f32);

pub const Components = std.BoundedArray(*Component, std.math.pow(usize, 2, 8));

allocator: mem.Allocator,

ctx: *CanvasContext,
components: Components,
mouse_position: Point,

hovered_component: ?*Component = null,
clicked_component: ?*Component = null,

pub fn init(allocator: mem.Allocator, ctx: *CanvasContext) !UI {
    return .{
        .allocator = allocator,

        .ctx = ctx,
        .components = try Components.init(0),
        .mouse_position = .{ 0, 0 },
    };
}

pub fn addComponent(self: *UI, component: *Component) !void {
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

fn isPointInComponent(p: Point, component: *Component) bool {
    const p_x, const p_y = p;

    // zig fmt: off
    return (
        p_x >= component.x and 
        p_x <= component.x + component.w and
        p_y >= component.y and 
        p_y <= component.y + component.h
    );
    // zig fmt: on
}

pub fn render(self: *UI) void {
    // Render all components
    for (self.components.constSlice()) |component| {
        if (component.is_visible) {
            self.ctx.fillColor(comptime (Color.comptimeFromCSSColorName("mintcream").lightened(0.1)));
            self.ctx.rect(component.x, component.y, component.w, component.h);
            self.ctx.fill();
        }
    }
}

pub fn destroy(self: *UI) void {
    for (self.components.constSlice()) |component| {
        component.destroy();
    }

    self.components.clear();
}
