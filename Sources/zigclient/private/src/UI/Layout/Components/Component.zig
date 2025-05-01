const std = @import("std");
const Component = @This();

x: f32 = 0,
y: f32 = 0,
width: f32 = 0,
height: f32 = 0,
isVisible: bool = true,

pub fn init() Component {
    return .{};
}

pub fn setX(self: *Component, x: f32) void {
    self.x = x;
}

pub fn setY(self: *Component, y: f32) void {
    self.y = y;
}

pub fn setWidth(self: *Component, width: f32) void {
    self.width = width;
}

pub fn setHeight(self: *Component, height: f32) void {
    self.height = height;
}

pub fn destroy(_: *Component) void {}
