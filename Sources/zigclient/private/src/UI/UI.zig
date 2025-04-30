const std = @import("std");
const CanvasRenderingContext2D = @import("../Dom/Canvas/CanvasRenderingContext2D.zig");
const Component = @import("./Layout/Components/Component.zig");
const UI = @This();

ctx: CanvasRenderingContext2D,
components: std.ArrayList(Component),
mouseX: f64 = 0,
mouseY: f64 = 0,
hoveredComponent: ?*Component = null,
clickedComponent: ?*Component = null,

pub fn init(ctx: CanvasRenderingContext2D) UI {
    return .{
        .ctx = ctx,
        .components = std.ArrayList(Component).init(std.heap.page_allocator),
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

fn isPointInComponent(_: *UI, x: f64, y: f64, component: *Component) bool {
    return x >= component.x and x <= component.x + component.width and
        y >= component.y and y <= component.y + component.height;
}

pub fn render(self: *UI) void {
    // Clear canvas
    self.ctx.clearRectFull();

    // Render all components
    for (self.components.items) |component| {
        if (component.isVisible) {
            self.ctx.fillStyle("black");
            self.ctx.fillRect(component.x, component.y, component.width, component.height);
        }
    }
}

pub fn destroy(self: *UI) void {
    for (self.components.items) |*component| {
        component.destroy();
    }

    self.components.deinit();
}
