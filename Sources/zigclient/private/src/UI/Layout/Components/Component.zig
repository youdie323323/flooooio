const std = @import("std");
const Component = @This();

x: f64 = 0,
y: f64 = 0,
width: f64 = 0,
height: f64 = 0,
isVisible: bool = true,

pub fn init() Component {
    return .{};
}

pub fn setX(self: *Component, x: f64) void {
    self.x = x;
}

pub fn setY(self: *Component, y: f64) void {
    self.y = y;
}

pub fn setWidth(self: *Component, width: f64) void {
    self.width = width;
}

pub fn setHeight(self: *Component, height: f64) void {
    self.height = height;
}

pub fn destroy(_: *Component) void {}
