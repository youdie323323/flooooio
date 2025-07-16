const UITitle = @This();

/// This should not accessed directly, if you want to get value, call ui().
super: UI,

pub fn init(allocator: mem.Allocator) UITitle {
    var self: UITitle = .{
        .super = undefined,
    };

    { // Initialize super
        self.super = .{
            .ptr = &self,
            .vtable = &.{
                .on_initialize = onInitialize,
                .render = render,
                .deinit = deinit,
            },

            .allocator = allocator,
        };

        self.super.init();
    }

    return self;
}

pub fn ui(self: *const UITitle) UI {
    return self.super;
}

pub fn onInitialize(ui_ctx: *anyopaque) void {
    const self: *UITitle = @ptrCast(@alignCast(ui_ctx));

    _ = self;
}

pub fn render(ui_ctx: *anyopaque, ctx: *CanvasContext) void {
    const self: *UITitle = @ptrCast(@alignCast(ui_ctx));

    self.super.renderComponents(ctx);
}

pub fn deinit(ui_ctx: *anyopaque) void {
    const self: *UITitle = @ptrCast(@alignCast(ui_ctx));

    self.* = undefined;
}

const std = @import("std");
const mem = std.mem;

const UI = @import("../../Kernel/UI/UI.zig");

const CanvasContext = @import("../../Kernel/WebAssembly/Interop/Canvas2D/CanvasContext.zig");
