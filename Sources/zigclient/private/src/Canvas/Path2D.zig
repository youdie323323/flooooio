const Path2D = @This();

pub const PathId = u32;

id: PathId,

pub inline fn deinit(self: Path2D) void {
    @"34"(self.id);
}

pub inline fn init() Path2D {
    const path_id = @"35"();

    return .{ .id = path_id };
}

pub inline fn moveTo(self: Path2D, x: f64, y: f64) void {
    @"36"(self.id, x, y);
}

pub inline fn lineTo(self: Path2D, x: f64, y: f64) void {
    @"37"(self.id, x, y);
}

pub inline fn quadraticCurveTo(self: Path2D, cpx: f64, cpy: f64, x: f64, y: f64) void {
    @"38"(self.id, cpx, cpy, x, y);
}

pub inline fn bezierCurveTo(self: Path2D, cp1x: f64, cp1y: f64, cp2x: f64, cp2y: f64, x: f64, y: f64) void {
    @"39"(self.id, cp1x, cp1y, cp2x, cp2y, x, y);
}

pub inline fn closePath(self: Path2D) void {
    @"40"(self.id);
}

/// Destroys a Path2D object.
extern "0" fn @"34"(path_id: PathId) void;
/// Creates a new Path2D object and returns its ID.
extern "0" fn @"35"() PathId;
/// Performs moveTo on path.
extern "0" fn @"36"(path_id: PathId, x: f64, y: f64) void;
/// Performs lineTo on path.
extern "0" fn @"37"(path_id: PathId, x: f64, y: f64) void;
/// Performs quadraticCurveTo on path.
extern "0" fn @"38"(path_id: PathId, cpx: f64, cpy: f64, x: f64, y: f64) void;
/// Performs bezierCurveTo on path.
extern "0" fn @"39"(path_id: PathId, cp1x: f64, cp1y: f64, cp2x: f64, cp2y: f64, x: f64, y: f64) void;
/// Performs closePath on path.
extern "0" fn @"40"(path_id: PathId) void;