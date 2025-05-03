///! This module proivded minimal path2d operations for wasm.

const Path2D = @This();

pub const PathId = u32;

id: PathId,

pub inline fn deinit(self: Path2D) void {
    @"57"(self.id);
}

pub inline fn init() Path2D {
    const path_id = @"58"();

    return .{ .id = path_id };
}

pub inline fn moveTo(self: Path2D, x: f32, y: f32) void {
    @"59"(self.id, x, y);
}

pub inline fn lineTo(self: Path2D, x: f32, y: f32) void {
    @"60"(self.id, x, y);
}

pub inline fn quadraticCurveTo(self: Path2D, cpx: f32, cpy: f32, x: f32, y: f32) void {
    @"61"(self.id, cpx, cpy, x, y);
}

pub inline fn bezierCurveTo(self: Path2D, cp1x: f32, cp1y: f32, cp2x: f32, cp2y: f32, x: f32, y: f32) void {
    @"62"(self.id, cp1x, cp1y, cp2x, cp2y, x, y);
}

pub inline fn closePath(self: Path2D) void {
    @"63"(self.id);
}

/// Destroys a Path2D object.
extern "0" fn @"57"(path_id: PathId) void;
/// Creates a new Path2D object and returns its ID.
extern "0" fn @"58"() PathId;
/// Performs moveTo on path.
extern "0" fn @"59"(path_id: PathId, x: f32, y: f32) void;
/// Performs lineTo on path.
extern "0" fn @"60"(path_id: PathId, x: f32, y: f32) void;
/// Performs quadraticCurveTo on path.
extern "0" fn @"61"(path_id: PathId, cpx: f32, cpy: f32, x: f32, y: f32) void;
/// Performs bezierCurveTo on path.
extern "0" fn @"62"(path_id: PathId, cp1x: f32, cp1y: f32, cp2x: f32, cp2y: f32, x: f32, y: f32) void;
/// Performs closePath on path.
extern "0" fn @"63"(path_id: PathId) void;