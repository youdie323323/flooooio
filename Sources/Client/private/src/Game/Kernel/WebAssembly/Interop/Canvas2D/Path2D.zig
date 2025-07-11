//! Provides minimal path2d operations for wasm.
const Path2D = @This();

pub const Id = u16;

id: Id,

pub inline fn init() Path2D {
    return .{ .id = @"59"() };
}

pub inline fn deinit(self: Path2D) void {
    @"58"(self.id);
}

pub inline fn closePath(self: Path2D) void {
    @"64"(self.id);
}

pub inline fn moveTo(self: Path2D, comptime x: comptime_float, comptime y: comptime_float) void {
    @"60"(self.id, x, y);
}

pub inline fn lineTo(self: Path2D, comptime x: comptime_float, comptime y: comptime_float) void {
    @"61"(self.id, x, y);
}

pub inline fn quadraticCurveTo(self: Path2D, comptime cpx: comptime_float, comptime cpy: comptime_float, comptime x: comptime_float, comptime y: comptime_float) void {
    @"62"(self.id, cpx, cpy, x, y);
}

pub inline fn bezierCurveTo(self: Path2D, comptime cp1x: comptime_float, comptime cp1y: comptime_float, comptime cp2x: comptime_float, comptime cp2y: comptime_float, comptime x: comptime_float, comptime y: comptime_float) void {
    @"63"(self.id, cp1x, cp1y, cp2x, cp2y, x, y);
}

/// Destroys a Path2D object.
extern "0" fn @"58"(path_id: Id) void;
/// Creates a new Path2D object and returns its Id.
extern "0" fn @"59"() Id;
/// Performs moveTo on path.
extern "0" fn @"60"(path_id: Id, x: f32, y: f32) void;
/// Performs lineTo on path.
extern "0" fn @"61"(path_id: Id, x: f32, y: f32) void;
/// Performs quadraticCurveTo on path.
extern "0" fn @"62"(path_id: Id, cpx: f32, cpy: f32, x: f32, y: f32) void;
/// Performs bezierCurveTo on path.
extern "0" fn @"63"(path_id: Id, cp1x: f32, cp1y: f32, cp2x: f32, cp2y: f32, x: f32, y: f32) void;
/// Performs closePath on path.
extern "0" fn @"64"(path_id: Id) void;
