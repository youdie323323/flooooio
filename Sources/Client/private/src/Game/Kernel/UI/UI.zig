const UI = @This();

pub const Point = @Vector(2, f32);

pub const VTable = struct {
    /// Function to be called when this base ui initialization is done.
    on_initialize: *const fn (*anyopaque) void,

    /// Render the implementation-depending components.
    render: *const fn (*anyopaque, *CanvasContext) void,

    /// Deinits implementation properties.
    deinit: *const fn (*anyopaque) void,
};

/// The type erased pointer to the ui implementation.
///
/// Any comparison of this field may result in illegal behavior, since it may
/// be set to `undefined` in cases where the allocator implementation does not
/// have any associated state.
ptr: *anyopaque,
vtable: *const VTable,

allocator: mem.Allocator,

components: std.BoundedArray(*Component, std.math.pow(usize, 2, 8)) = .{},
mouse_position: Point = .{ 0, 0 },

hovered_component: ?*Component = null,
clicked_component: ?*Component = null,

/// Pseudo initialize for setup properties of this base ui.
/// This method is intended to be called from implementation of an `UI`.
pub fn init(self: *UI) void {
    self.rawOnInitialize();
}

pub fn addComponent(self: *UI, component: *Component) !void {
    try self.components.append(component);
}

pub fn removeComponent(self: *UI, component: *Component) void {
    for (self.components.constSlice(), 0..) |inner_component, i| {
        if (std.meta.eql(inner_component, component)) {
            _ = self.components.orderedRemove(i);

            break;
        }
    }
}

fn isPointOverlapsComponent(p: Point, component: *Component) bool {
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

pub fn render(self: *const UI, ctx: *CanvasContext) void {
    self.rawRender(ctx);
}

/// Render all components.
/// This method is intended to be called from implementation of an `UI`.
pub fn renderComponents(self: *const UI, ctx: *CanvasContext) void {
    // Render all components
    for (self.components.constSlice()) |component| {
        if (component.is_visible) {
            ctx.fillColor(comptime (Color.comptimeFromCSSColorName("mintcream").lightened(0.1)));
            ctx.rect(component.x, component.y, component.w, component.h);
            ctx.fill();
        }
    }
}

pub fn destroy(self: *UI) void {
    for (self.components.constSlice()) |component| {
        component.destroy();
    }

    self.components.clear();

    self.rawDeinit();

    self.* = undefined;
}

/// This function is not intended to be called except from within the
/// implementation of an `UI`.
pub inline fn rawOnInitialize(self: *const UI) void {
    self.vtable.on_initialize(self.ptr);
}

/// This function is not intended to be called except from within the
/// implementation of an `UI`.
pub inline fn rawRender(self: *const UI, ctx: *CanvasContext) void {
    self.vtable.render(self.ptr, ctx);
}

/// This function is not intended to be called except from within the
/// implementation of an `UI`.
pub inline fn rawDeinit(self: *const UI) void {
    self.vtable.deinit(self.ptr);
}

const std = @import("std");
const mem = std.mem;

const Component = @import("Layout/Components/Component.zig");

const CanvasContext = @import("../WebAssembly/Interop/Canvas2D/CanvasContext.zig");
const Color = @import("../WebAssembly/Interop/Canvas2D/Color.zig");
