const std = @import("std");
const CanvasContext = @import("../WasmInterop/Canvas/CanvasContext.zig");
const Component = @import("./Layout/Components/Component.zig");
const Color = @import("../WasmInterop/Canvas/Color.zig");
const Allocator = std.mem.Allocator;
const UI = @This();

ctx: CanvasContext,
components: std.ArrayList(Component),
mouse_x: f32 = 0,
mouse_y: f32 = 0,
hovered_component: ?*Component = null,
clicked_component: ?*Component = null,

pub fn init(allocator: Allocator, ctx: CanvasContext) UI {
    return .{
        .ctx = ctx,
        .components = std.ArrayList(Component).init(allocator),
    };
}

pub fn addComponent(self: *UI, component: Component) void {
    self.components.append(component) catch unreachable;
}

pub fn removeComponent(self: *UI, component: Component) void {
    for (self.components.items, 0..) |item, i| {
        if (std.meta.eql(item, component)) {
            _ = self.components.orderedRemove(i);

            break;
        }
    }
}

fn isPointInComponent(x: f32, y: f32, component: *Component) bool {
    return x >= component.x and x <= component.x + component.w and
        y >= component.y and y <= component.y + component.h;
}

pub fn render(self: *UI) void {
    // Clear canvas
    self.ctx.clearRectFull();

    // Render all components
    for (self.components.items) |component| {
        if (component.is_visible) {
            self.ctx.fillColor(comptime Color.fromCSSColorName("mintcream").lightened(0.1));
            self.ctx.rect(component.x, component.y, component.w, component.h);
            self.ctx.fill();
        }
    }
}

pub fn destroy(self: *UI) void {
    for (self.components.items) |*component| {
        component.destroy();
    }

    self.components.deinit();
}
