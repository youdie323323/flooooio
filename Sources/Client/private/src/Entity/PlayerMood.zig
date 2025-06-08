const std = @import("std");

/// Mood bit flags.
pub const MoodBitSet = std.bit_set.IntegerBitSet(3);

/// Mood flag positions.
pub const MoodFlags = enum(u8) {
    normal = 0,
    angry = 1 << 0,
    sad = 1 << 1,
};

pub fn initPartial(mask: MoodBitSet.MaskInt) MoodBitSet {
    var bits = MoodBitSet.initEmpty();
    
    bits.mask = mask;

    return bits;
}

/// Decode mood flags into array of booleans.
pub fn decodeMood(flags: MoodBitSet) [2]bool {
    return .{
        flags.isSet(@intFromEnum(MoodFlags.angry)),
        flags.isSet(@intFromEnum(MoodFlags.sad)),
    };
}

test MoodBitSet {
    // Normal mood (no flags set)
    const normal = MoodBitSet.initEmpty();

    try std.testing.expectEqual(decodeMood(normal), .{ false, false });

    // Angry mood
    var angry = MoodBitSet.initEmpty();

    angry.set(@intFromEnum(MoodFlags.angry));

    try std.testing.expectEqual(decodeMood(angry), .{ true, false });

    // Sad mood
    var sad = MoodBitSet.initEmpty();

    sad.set(@intFromEnum(MoodFlags.sad));

    try std.testing.expectEqual(decodeMood(sad), .{ false, true });

    // Both angry and sad
    var both = MoodBitSet.initEmpty();

    both.set(@intFromEnum(MoodFlags.angry));
    both.set(@intFromEnum(MoodFlags.sad));

    try std.testing.expectEqual(decodeMood(both), .{ true, true });
}
