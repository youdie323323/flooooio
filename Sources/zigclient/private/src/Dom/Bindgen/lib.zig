/// Higher-order generic slice wrapper for `extern struct` use cases
/// S = slice type
/// P = pointer type
pub fn Slice(comptime S: type, comptime P: type) type {
    return extern struct {
        ptr: P = @as(S, &.{}).ptr,
        len: usize = 0,

        const Self = @This();

        pub inline fn wrap(slice: S) Self {
            return .{
                .ptr = @ptrCast(slice.ptr),
                .len = slice.len,
            };
        }

        pub inline fn toSlice(self: *Self) S {
            return @as(*S, @ptrCast(self)).*;
        }
    };
}

pub const StringPtr = [*:0]u8;
pub const ConstStringPtr = [*:0]const u8;

/// `[]u8` slice wrapper for `extern struct` use cases
pub const String = Slice([]u8, StringPtr);
/// `[]const u8` slice wrapper for `extern struct` use cases
pub const ConstString = Slice([]const u8, ConstStringPtr);

/// Slice of `String`s
pub const StringSlice = Slice([]String, [*]String);
pub const ConstStringSlice = Slice([]ConstString, [*]ConstString);

/// Slice of `StringPtr`s
pub const StringPtrSlice = Slice([]StringPtr, [*]StringPtr);
pub const ConstStringPtrSlice = Slice([]ConstStringPtr, [*]ConstStringPtr);

/// Alias for `*anyopaque`
pub const OpaquePtr = *anyopaque;
pub const ConstOpaquePtr = *const anyopaque;

/// Slice of `OpaquePtr`s
pub const OpaquePtrSlice = Slice([]OpaquePtr, [*]OpaquePtr);
pub const ConstOpaquePtrSlice = Slice([]ConstOpaquePtr, [*]ConstOpaquePtr);

/// Syntax sugar for `ConstString.wrap()`
pub inline fn string(str: []const u8) ConstString {
    return ConstString.wrap(str);
}