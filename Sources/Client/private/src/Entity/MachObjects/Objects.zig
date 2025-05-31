const std = @import("std");
const mach = @import("main.zig");
const StringTable = @import("StringTable.zig");

/// An ID representing a object. This is an opaque identifier which effectively encodes:
///
/// * An array index that can be used to O(1) lookup the actual data / struct fields of the object.
/// * The generation (or 'version') of the object, enabling detecting use-after-object-delete in
///   many (but not all) cases.
///
pub const ObjectID = u48;

pub const ObjectsOptions = struct {
    /// If set to true, Mach will track when fields are set using the setField/setAll
    /// methods using a bitset with one bit per field to indicate 'the field was set'.
    /// You can get this information by calling `.updated(.field_name)`
    /// Note that calling `.updated(.field_name) will also set the flag back to false.
    track_fields: bool = false,
};

pub fn Objects(options: ObjectsOptions, comptime T: type) type {
    return struct {
        internal: struct {
            allocator: std.mem.Allocator,

            /// Mutex to be held when operating on these objects.
            /// TODO(object): replace with RwLock and update website docs to indicate this
            mu: std.Thread.Mutex = .{},

            /// The actual object data.
            data: std.MultiArrayList(T) = .{},

            /// Whether a given slot in data[i] is dead or not.
            dead: std.bit_set.DynamicBitSetUnmanaged = .{},

            /// The current generation number of data[i], when data[i] becomes dead and then alive
            /// again, this number is incremented by one.
            generation: std.ArrayListUnmanaged(Generation) = .{},

            /// The recycling bin which tells which data indices are dead and can be reused.
            recycling_bin: std.ArrayListUnmanaged(Index) = .{},

            /// The number of objects that could not fit in the recycling bin and hence were thrown
            /// on the floor and forgotten about. This means there are dead items recorded by dead.set(index)
            /// which aren't in the recycling_bin, and the next call to new() may consider cleaning up.
            thrown_on_the_floor: u32 = 0,

            /// A bitset used to track per-field changes. Only used if options.track_fields == true.
            updated: ?std.bit_set.DynamicBitSetUnmanaged = if (options.track_fields) .{} else null,

            /// Tags storage.
            tags: std.AutoHashMapUnmanaged(TaggedObject, ?ObjectID) = .{},
        },

        const Generation = u16;
        const Index = u32;

        const TaggedObject = struct {
            object_id: ObjectID,
            tag_hash: u64,
        };

        const PackedID = packed struct(u48) {
            generation: Generation,
            index: Index,
        };

        pub const Slice = struct {
            index: Index,
            objs: *Objects(options, T),

            pub fn next(s: *Slice) ?ObjectID {
                const dead = &s.objs.internal.dead;
                const generation = &s.objs.internal.generation;
                const num_objects = generation.items.len;

                while (true) {
                    if (s.index == num_objects) {
                        s.index = 0;

                        return null;
                    }

                    defer s.index += 1;

                    if (!dead.isSet(s.index)) return @bitCast(PackedID{
                        .generation = generation.items[s.index],
                        .index = s.index,
                    });
                }
            }
        };

        pub fn init(objs: *@This(), allocator: std.mem.Allocator) void {
            objs.internal = .{
                .allocator = allocator,
            };
        }

        /// Tries to acquire the mutex without blocking the caller's thread.
        /// Returns `false` if the calling thread would have to block to acquire it.
        /// Otherwise, returns `true` and the caller should `unlock()` the Mutex to release it.
        pub fn tryLock(objs: *@This()) bool {
            return objs.internal.mu.tryLock();
        }

        /// Acquires the mutex, blocking the caller's thread until it can.
        /// It is undefined behavior if the mutex is already held by the caller's thread.
        /// Once acquired, call `unlock()` on the Mutex to release it.
        pub fn lock(objs: *@This()) void {
            objs.internal.mu.lock();
        }

        /// Releases the mutex which was previously acquired with `lock()` or `tryLock()`.
        /// It is undefined behavior if the mutex is unlocked from a different thread that it was locked from.
        pub fn unlock(objs: *@This()) void {
            objs.internal.mu.unlock();
        }

        pub fn new(objs: *@This(), value: T) std.mem.Allocator.Error!ObjectID {
            const allocator = objs.internal.allocator;
            const data = &objs.internal.data;
            const dead = &objs.internal.dead;
            const generation = &objs.internal.generation;
            const recycling_bin = &objs.internal.recycling_bin;

            // The recycling bin should always be big enough, but we check at this point if 10% of
            // all objects have been thrown on the floor. If they have, we find them and grow the
            // recycling bin to fit them
            if (objs.internal.thrown_on_the_floor >= (data.len / 10)) {
                var iter = dead.iterator(.{ .kind = .set });

                dead_object_loop: while (iter.next()) |index| {
                    // We need to check if this index is already in the recycling bin since
                    // if it is, it could get recycled a second time while still
                    // in use
                    for (recycling_bin.items) |recycled_index| {
                        if (index == recycled_index) continue :dead_object_loop;
                    }

                    // Dead bitset contains data.capacity number of entries, we only care about ones that are in data.len range
                    if (index > data.len - 1) break;

                    try recycling_bin.append(allocator, @intCast(index));
                }

                objs.internal.thrown_on_the_floor = 0;
            }

            if (recycling_bin.pop()) |index| {
                // Reuse a free slot from the recycling bin
                dead.unset(index);

                const gen = generation.items[index] + 1;

                generation.items[index] = gen;

                data.set(index, value);

                return @bitCast(PackedID{
                    .generation = gen,
                    .index = index,
                });
            }

            // Ensure we have space for the new object
            try data.ensureUnusedCapacity(allocator, 1);
            try dead.resize(allocator, data.capacity, false);
            try generation.ensureUnusedCapacity(allocator, 1);

            // If we are tracking fields, we need to resize the bitset to hold another object's fields
            if (objs.internal.updated) |*updated_fields| {
                try updated_fields.resize(allocator, data.capacity * @typeInfo(T).@"struct".fields.len, true);
            }

            const index = data.len;
            data.appendAssumeCapacity(value);

            dead.unset(index);

            generation.appendAssumeCapacity(0);

            return @bitCast(PackedID{
                .generation = 0,
                .index = @intCast(index),
            });
        }

        /// Sets all fields of the given object to the given value.
        ///
        /// Unlike setAll(), this method does not respect any mach.Objects tracking
        /// options, so changes made to an object through this method will not be tracked.
        pub fn setValueRaw(objs: *@This(), id: ObjectID, value: T) void {
            const data = &objs.internal.data;

            const unpacked = objs.validateAndUnpack(id, "setValueRaw");

            data.set(unpacked.index, value);
        }

        /// Sets all fields of the given object to the given value.
        ///
        /// Unlike setAllRaw, this method respects mach.Objects tracking
        /// and changes made to an object through this method will be tracked.
        pub fn setValue(objs: *@This(), id: ObjectID, value: T) void {
            const data = &objs.internal.data;

            const unpacked = objs.validateAndUnpack(id, "setValue");

            data.set(unpacked.index, value);

            if (objs.internal.updated) |*updated_fields| {
                const updated_start = unpacked.index * @typeInfo(T).@"struct".fields.len;
                const updated_end = updated_start + @typeInfo(T).@"struct".fields.len;

                updated_fields.setRangeValue(.{ .start = @intCast(updated_start), .end = @intCast(updated_end) }, true);
            }
        }

        /// Sets a single field of the given object to the given value.
        ///
        /// Unlike set(), this method does not respect any mach.Objects tracking
        /// options, so changes made to an object through this method will not be tracked.
        pub fn setRaw(objs: *@This(), id: ObjectID, comptime field_name: std.meta.FieldEnum(T), value: std.meta.FieldType(T, field_name)) void {
            const data = &objs.internal.data;

            const unpacked = objs.validateAndUnpack(id, "setRaw");

            data.items(field_name)[unpacked.index] = value;
        }

        /// Sets a single field of the given object to the given value.
        ///
        /// Unlike setAllRaw, this method respects mach.Objects tracking
        /// and changes made to an object through this method will be tracked.
        pub fn set(objs: *@This(), id: ObjectID, comptime field_name: std.meta.FieldEnum(T), value: std.meta.FieldType(T, field_name)) void {
            const data = &objs.internal.data;

            const unpacked = objs.validateAndUnpack(id, "set");

            data.items(field_name)[unpacked.index] = value;

            if (options.track_fields)
                if (std.meta.fieldIndex(T, @tagName(field_name))) |field_index|
                    if (objs.internal.updated) |*updated_fields|
                        updated_fields.set(unpacked.index * @typeInfo(T).@"struct".fields.len + field_index);
        }

        /// Get a single field.
        pub fn get(objs: *@This(), id: ObjectID, comptime field_name: std.meta.FieldEnum(T)) std.meta.FieldType(T, field_name) {
            const data = &objs.internal.data;

            const unpacked = objs.validateAndUnpack(id, "get");

            return data.items(field_name)[unpacked.index];
        }

        /// Get all fields.
        pub fn getValue(objs: *@This(), id: ObjectID) T {
            const data = &objs.internal.data;

            const unpacked = objs.validateAndUnpack(id, "getValue");

            return data.get(unpacked.index);
        }

        pub fn delete(objs: *@This(), id: ObjectID) void {
            const data = &objs.internal.data;
            const dead = &objs.internal.dead;

            const recycling_bin = &objs.internal.recycling_bin;

            const unpacked = objs.validateAndUnpack(id, "delete");

            if (recycling_bin.items.len < recycling_bin.capacity) {
                recycling_bin.appendAssumeCapacity(unpacked.index);
            } else objs.internal.thrown_on_the_floor += 1;

            dead.set(unpacked.index);

            if (mach.is_debug) data.set(unpacked.index, undefined);
        }

        pub fn slice(objs: *@This()) Slice {
            return .{
                .index = 0,
                .objs = objs,
            };
        }

        /// Validates the given object is from this list (type check) and alive (not a use after delete
        /// situation.)
        fn validateAndUnpack(objs: *const @This(), id: ObjectID, comptime fn_name: []const u8) PackedID {
            const dead = &objs.internal.dead;
            const generation = &objs.internal.generation;

            // TODO(object): decide whether to disable safety checks like this in some conditions,
            // e.g. in release builds
            const unpacked: PackedID = @bitCast(id);

            if (unpacked.generation != generation.items[unpacked.index]) {
                @panic("mach: " ++ fn_name ++ "() called with a dead object (use after delete, recycled slot)");
            }

            if (dead.isSet(unpacked.index)) {
                @panic("mach: " ++ fn_name ++ "() called with a dead object (use after delete)");
            }

            return unpacked;
        }

        /// If options have tracking enabled, this returns true when the given field has been set
        /// using the set() or setAll() methods. A subsequent call to .updated(), .anyUpdated(), etc.
        /// will return false until another set() or setAll() call is made.
        pub fn updated(objs: *@This(), id: ObjectID, field_name: anytype) bool {
            return objs.updatedOptions(id, field_name, false);
        }

        /// Same as updated(), but doesn't alter the behavior of subsequent .updated(), .anyUpdated(),
        /// etc. calls.
        pub fn peekUpdated(objs: *@This(), id: ObjectID, field_name: anytype) bool {
            return objs.updatedOptions(id, field_name, true);
        }

        inline fn updatedOptions(objs: *@This(), id: ObjectID, field_name: anytype, comptime peek: bool) bool {
            if (!options.track_fields) return false;

            const unpacked = objs.validateAndUnpack(id, "updated");
            const field_index = std.meta.fieldIndex(T, @tagName(field_name)).?;

            const updated_fields = &(objs.internal.updated orelse return false);
            const updated_index = unpacked.index * @typeInfo(T).@"struct".fields.len + field_index;

            const updated_value = updated_fields.isSet(updated_index);
            if (!peek) updated_fields.unset(updated_index);

            return updated_value;
        }

        /// If options have tracking enabled, this returns true when any field has been set using
        /// the set() or setAll() methods. A subsequent call to .updated(), .anyUpdated(), etc. will
        /// return false until another set() or setAll() call is made.
        pub fn anyUpdated(objs: *@This(), id: ObjectID) bool {
            return objs.anyUpdatedOptions(id, false);
        }

        /// Same as anyUpdated(), but doesn't alter the behavior of subsequent .updated(), .anyUpdated(),
        /// etc. calls
        pub fn peekAnyUpdated(objs: *@This(), id: ObjectID) bool {
            return objs.anyUpdatedOptions(id, true);
        }

        inline fn anyUpdatedOptions(objs: *@This(), id: ObjectID, comptime peek: bool) bool {
            if (!options.track_fields) return false;

            const unpacked = objs.validateAndUnpack(id, "updated");
            const updated_fields = &(objs.internal.updated orelse return false);

            var any_updated = false;

            inline for (0..@typeInfo(T).@"struct".fields.len) |field_index| {
                const updated_index = unpacked.index * @typeInfo(T).@"struct".fields.len + field_index;
                const updated_value = updated_fields.isSet(updated_index);

                if (!peek) updated_fields.unset(updated_index);

                if (updated_value) any_updated = true;
            }

            return any_updated;
        }
    };
}
