const std = @import("std");
const meta = std.meta;
const mem = std.mem;

/// An ID representing a object. This is an opaque identifier which effectively encodes:
///
/// * An array index that can be used to O(1) lookup the actual data / struct fields of the object.
/// * The generation (or 'version') of the object, enabling detecting use-after-object-delete in
///   many (but not all) cases.
///
pub const ObjectId = u48;

pub fn Objects(comptime T: type, comptime search_field: meta.FieldEnum(T)) type {
    const SearchFieldType = meta.FieldType(T, search_field);

    return struct {
        internal: struct {
            allocator: mem.Allocator,

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

            /// Hashmap for searching and get object id from search field value.
            object_lut: std.AutoHashMapUnmanaged(SearchFieldType, ObjectId) = .{},
        },

        const Generation = u16;
        const Index = u32;

        const PackedId = packed struct(ObjectId) {
            generation: Generation,
            index: Index,
        };

        pub const Slice = struct {
            index: Index,
            objs: *Objects(T, search_field),

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

        pub fn init(objs: *@This(), allocator: mem.Allocator) void {
            objs.internal = .{
                .allocator = allocator,
            };
        }

        pub fn deinit(objs: *@This()) void {
            const allocator = objs.internal.allocator;
            const data = &objs.internal.data;
            const dead = &objs.internal.dead;
            const generation = &objs.internal.generation;
            const object_lut = &objs.internal.object_lut;

            data.deinit(allocator);
            dead.deinit(allocator);
            generation.deinit(allocator);
            object_lut.deinit(allocator);
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
            const object_lut = &objs.internal.object_lut;

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

            try object_lut.put(allocator, @field(value, @tagName(search_field)), obj_id);

            return obj_id;
        }

        /// Sets a single field of the given object to the given value.
        ///
        /// Unlike set(), this method does not respect any mach.Objects tracking
        /// options, so changes made to an object through this method will not be tracked.
        pub fn set(objs: *@This(), id: ObjectId, comptime field: meta.FieldEnum(T), value: meta.FieldType(T, field)) void {
            const data = &objs.internal.data;

            const unpacked = objs.validateAndUnpack(id, @src());

            data.items(field)[unpacked.index] = value;
        }

        /// Sets all fields of the given object to the given value.
        ///
        /// Unlike setAll(), this method does not respect any mach.Objects tracking
        /// options, so changes made to an object through this method will not be tracked.
        pub fn setValue(objs: *@This(), id: ObjectId, value: T) void {
            const data = &objs.internal.data;

            const unpacked = objs.validateAndUnpack(id, @src());

            data.set(unpacked.index, value);
        }

        /// Get a single field.
        pub fn get(objs: *@This(), id: ObjectId, comptime field: meta.FieldEnum(T)) meta.FieldType(T, field) {
            const data = &objs.internal.data;

            const unpacked = objs.validateAndUnpack(id, @src());

            return data.items(field)[unpacked.index];
        }

        /// Gets all fields.
        pub fn getValue(objs: *@This(), id: ObjectId) T {
            const data = &objs.internal.data;

            const unpacked = objs.validateAndUnpack(id, @src());

            return data.get(unpacked.index);
        }

        pub fn delete(objs: *@This(), id: ObjectId) void {
            const dead = &objs.internal.dead;
            const data = &objs.internal.data;
            const object_lut = &objs.internal.object_lut;

            const unpacked = objs.validateAndUnpack(id, @src());

            _ = object_lut.remove(data.items(search_field)[unpacked.index]);

            dead.set(unpacked.index);
        }

        /// Search for an object by matching a specific field value.
        pub fn search(objs: *@This(), id: SearchFieldType) ?ObjectId {
            return objs.internal.object_lut.get(id);
        }

        pub fn slice(objs: *@This()) Slice {
            return .{
                .index = 0,
                .objs = objs,
            };
        }

        /// Validates the given object is from this list (type check) and alive (not a use after delete
        /// situation).
        inline fn validateAndUnpack(objs: *const @This(), id: ObjectId, comptime src: std.builtin.SourceLocation) PackedId {
            const dead = &objs.internal.dead;
            const generation = &objs.internal.generation;

            const fn_name = comptime src.fn_name;

            // TODO(object): decide whether to disable safety checks like this in some conditions,
            // e.g. in release builds
            const unpacked: PackedId = @bitCast(id);

            if (unpacked.generation != generation.items[unpacked.index])
                @panic(comptime (fn_name ++ "() called with a dead object (use after delete, recycled slot)"));

            if (dead.isSet(unpacked.index))
                @panic(comptime (fn_name ++ "() called with a dead object (use after delete)"));

            return unpacked;
        }
    };
}
