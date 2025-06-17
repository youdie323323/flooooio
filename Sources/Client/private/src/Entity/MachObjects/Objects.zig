const std = @import("std");

/// An ID representing a object. This is an opaque identifier which effectively encodes:
///
/// * An array index that can be used to O(1) lookup the actual data / struct fields of the object.
/// * The generation (or 'version') of the object, enabling detecting use-after-object-delete in
///   many (but not all) cases.
///
pub const ObjectId = u48;

pub fn Objects(comptime T: type, comptime search_field_name: std.meta.FieldEnum(T)) type {
    const SearchFieldType = comptime std.meta.FieldType(T, search_field_name);

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

            id_to_obj_id: std.AutoHashMap(SearchFieldType, ObjectId),

            /// The number of objects that could not fit in the recycling bin and hence were thrown
            /// on the floor and forgotten about. This means there are dead items recorded by dead.set(index)
            /// which aren't in the recycling_bin, and the next call to new() may consider cleaning up.
            thrown_on_the_floor: u32 = 0,
        },

        const Generation = u16;
        const Index = u32;

        const PackedId = packed struct(ObjectId) {
            generation: Generation,
            index: Index,
        };

        pub const Slice = struct {
            index: Index,
            objs: *Objects(T, search_field_name),

            pub fn next(self: *Slice) ?ObjectId {
                const dead = &self.objs.internal.dead;
                const generation = &self.objs.internal.generation;
                const num_objects = generation.items.len;

                while (true) {
                    if (self.index == num_objects) {
                        self.index = 0;

                        return null;
                    }

                    defer self.index += 1;

                    if (!dead.isSet(self.index))
                        return @bitCast(PackedId{
                            .generation = generation.items[self.index],
                            .index = self.index,
                        });
                }
            }
        };

        pub fn init(objs: *@This(), allocator: std.mem.Allocator) void {
            objs.internal = .{
                .allocator = allocator,

                .id_to_obj_id = .init(allocator),
            };
        }

        pub fn deinit(objs: *@This()) void {
            const id_to_obj_id = &objs.internal.id_to_obj_id;

            id_to_obj_id.deinit(objs.internal.allocator);
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

        pub fn new(objs: *@This(), value: T) !ObjectId {
            const allocator = objs.internal.allocator;
            const data = &objs.internal.data;
            const dead = &objs.internal.dead;
            const generation = &objs.internal.generation;
            const recycling_bin = &objs.internal.recycling_bin;
            const id_to_obj_id = &objs.internal.id_to_obj_id;

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

                return @bitCast(PackedId{
                    .generation = gen,
                    .index = index,
                });
            }

            // Ensure we have space for the new object
            try data.ensureUnusedCapacity(allocator, 1);
            try dead.resize(allocator, data.capacity, false);
            try generation.ensureUnusedCapacity(allocator, 1);

            const index = data.len;

            data.appendAssumeCapacity(value);

            dead.unset(index);

            generation.appendAssumeCapacity(0);

            const obj_id: ObjectId = @bitCast(PackedId{
                .generation = 0,
                .index = @intCast(index),
            });

            try id_to_obj_id.put(@field(value, @tagName(search_field_name)), obj_id);

            return obj_id;
        }

        /// Sets a single field of the given object to the given value.
        ///
        /// Unlike set(), this method does not respect any mach.Objects tracking
        /// options, so changes made to an object through this method will not be tracked.
        pub fn set(objs: *@This(), id: ObjectId, comptime field_name: std.meta.FieldEnum(T), value: std.meta.FieldType(T, field_name)) void {
            const data = &objs.internal.data;

            const unpacked = objs.validateAndUnpack(id, "set");

            data.items(field_name)[unpacked.index] = value;
        }

        /// Sets all fields of the given object to the given value.
        ///
        /// Unlike setAll(), this method does not respect any mach.Objects tracking
        /// options, so changes made to an object through this method will not be tracked.
        pub fn setValue(objs: *@This(), id: ObjectId, value: T) void {
            const data = &objs.internal.data;

            const unpacked = objs.validateAndUnpack(id, "setValue");

            data.set(unpacked.index, value);
        }

        /// Get a single field.
        pub fn get(objs: *@This(), id: ObjectId, comptime field_name: std.meta.FieldEnum(T)) std.meta.FieldType(T, field_name) {
            const data = &objs.internal.data;

            const unpacked = objs.validateAndUnpack(id, "get");

            return data.items(field_name)[unpacked.index];
        }

        /// Get all fields.
        pub fn getValue(objs: *@This(), id: ObjectId) T {
            const data = &objs.internal.data;

            const unpacked = objs.validateAndUnpack(id, "getValue");

            return data.get(unpacked.index);
        }

        pub fn delete(objs: *@This(), id: ObjectId) void {
            const dead = &objs.internal.dead;
            const data = &objs.internal.data;
            const recycling_bin = &objs.internal.recycling_bin;
            const id_to_obj_id = &objs.internal.id_to_obj_id;

            const unpacked = objs.validateAndUnpack(id, "delete");

            _ = id_to_obj_id.remove(data.items(search_field_name)[unpacked.index]);

            if (recycling_bin.items.len < recycling_bin.capacity) {
                recycling_bin.appendAssumeCapacity(unpacked.index);
            } else objs.internal.thrown_on_the_floor += 1;

            dead.set(unpacked.index);
        }

        /// Search for an object by matching a specific field value.
        pub fn search(objs: *@This(), id: SearchFieldType) ?ObjectId {
            return objs.internal.id_to_obj_id.get(id);
        }

        pub fn slice(objs: *@This()) Slice {
            return .{
                .index = 0,
                .objs = objs,
            };
        }

        /// Validates the given object is from this list (type check) and alive (not a use after delete
        /// situation.)
        fn validateAndUnpack(objs: *const @This(), id: ObjectId, comptime fn_name: []const u8) PackedId {
            const dead = &objs.internal.dead;
            const generation = &objs.internal.generation;

            // TODO(object): decide whether to disable safety checks like this in some conditions,
            // e.g. in release builds
            const unpacked: PackedId = @bitCast(id);

            if (unpacked.generation != generation.items[unpacked.index])
                @panic(fn_name ++ "() called with a dead object (use after delete, recycled slot)");

            if (dead.isSet(unpacked.index))
                @panic(fn_name ++ "() called with a dead object (use after delete)");

            return unpacked;
        }
    };
}
