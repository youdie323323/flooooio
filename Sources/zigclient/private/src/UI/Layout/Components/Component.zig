const std = @import("std");
const Component = @This();

x: f32 = 0,
y: f32 = 0,
w: f32 = 0,
h: f32 = 0,
is_visible: bool = true,

pub fn init() Component {
    return .{};
}

pub fn setX(self: *Component, x: f32) void {
    self.x = x;
}

pub fn setY(self: *Component, y: f32) void {
    self.y = y;
}

pub fn setW(self: *Component, w: f32) void {
    self.w = w;
}

pub fn setH(self: *Component, h: f32) void {
    self.h = h;
}

pub fn destroy(_: *Component) void {}
