pub fn WebSocket(comptime Context: type) type {
    return struct {
        var websocket_instances: std.AutoHashMap(Id, *@This()) =
            .init(allocator);

        const OnMessageHandler = *const fn (*@This(), []const u8) void;
        const NoDataHandler = *const fn (*@This()) void;

        const Id = u16;

        const EventType = enum(u8) {
            message = 1,
            open = 2,
            @"error" = 3,
            close = 4,
        };

        const MessageEvent = packed struct {
            type: EventType,
            data_ptr: ?Mem.MemoryPtr,
            data_size: usize,
        };

        id: Id,
        ctx: Context,

        on_message: ?OnMessageHandler = null,
        on_open: ?NoDataHandler = null,
        on_error: ?NoDataHandler = null,
        on_close: ?NoDataHandler = null,

        /// Returns whether page protocol is secure.
        pub fn isSecure() bool {
            return @"0"();
        }

        /// Creates a new WebSocket connection.
        pub fn init(
            ctx: Context,
            url: []const u8,
        ) !*@This() {
            const str = Mem.allocCString(url);

            const id = @"1"(str);

            Mem.freeCString(str);

            const ws = try allocator.create(@This());
            errdefer allocator.destroy(ws);

            ws.* = .{
                .id = id,
                .ctx = ctx,
            };

            try websocket_instances.putNoClobber(ws.id, ws);

            return ws;
        }

        /// Close and destroys a connection.
        pub fn deinit(self: *@This()) void {
            @"2"(self.id);

            _ = websocket_instances.remove(self.id);

            allocator.destroy(self);

            self.* = undefined;
        }

        /// Returns whether ready for interact.
        pub fn isReady(self: *const @This()) bool {
            return @"3"(self.id);
        }

        /// Sends a binary data.
        pub fn send(self: *const @This(), data: []const u8) bool {
            // This would slow the code
            // if (!self.isReady())
            //     return error.WebSocketNotReady;

            return @"4"(self.id, data.ptr, data.len) != 0;
        }

        /// Polls for the next WebSocket event.
        pub fn poll(id: Id) ?MessageEvent {
            var data_ptr: Mem.MemoryPtr = undefined;
            var data_size: usize = undefined;

            const type_raw = @"5"(id, &data_ptr, &data_size);
            if (type_raw == 0) return null;

            return .{
                .type = @enumFromInt(type_raw),
                .data_ptr = if (@intFromPtr(data_ptr) == 0 or data_size == 0)
                    null
                else
                    data_ptr,
                .data_size = data_size,
            };
        }

        export fn pollHandle(id: Id) void {
            if (websocket_instances.get(id)) |ws| {
                if (poll(id)) |*event| {
                    switch (event.type) {
                        inline .message => {
                            if (ws.on_message) |handler| {
                                if (event.data_ptr) |ptr| {
                                    const data = @as([*]const u8, @ptrCast(ptr))[0..event.data_size];

                                    handler(ws, data);

                                    Mem.free(ptr);
                                }
                            }
                        },
                        inline .open => if (ws.on_open) |handler| handler(ws),
                        inline .@"error" => if (ws.on_error) |handler| handler(ws),
                        inline .close => if (ws.on_close) |handler| handler(ws),
                    }
                }
            }
        }

        /// Checks if current protocol is secure.
        extern "3" fn @"0"() bool;
        /// Creates WebSocket connection.
        extern "3" fn @"1"(ptr: Mem.CStringPtr) Id;
        /// Destroys WebSocket connection.
        extern "3" fn @"2"(id: Id) void;
        /// Checks if WebSocket is ready.
        extern "3" fn @"3"(id: Id) bool;
        /// Sends data through WebSocket.
        extern "3" fn @"4"(id: Id, ptr: [*]const u8, size: usize) u8;
        /// Polls for WebSocket events.
        extern "3" fn @"5"(id: Id, ptr_addr: *Mem.MemoryPtr, size_addr: *usize) u8;
    };
}

const std = @import("std");

const Mem = @import("../../../../Mem.zig");
const allocator = Mem.allocator;
