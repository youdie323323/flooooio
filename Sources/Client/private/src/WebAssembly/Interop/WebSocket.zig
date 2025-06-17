const std = @import("std");
const mem = @import("../../mem.zig");
const allocator = mem.allocator;

/// WebSocket provides basic WebSocket operations callable by webassembly internaly.
pub fn WebSocket(comptime Context: type) type {
    return struct {
        const Self = @This();

        var websocket_instances =
            std.AutoHashMap(Self.WebSocketId, *Self).init(allocator);

        const OnMessageHandler = *const fn (*Self, []const u8) void;
        const NoDataHandler = *const fn (*Self) void;

        pub const WebSocketId = u16;

        id: WebSocketId,
        ctx: Context,

        on_message: ?OnMessageHandler = null,
        on_open: ?NoDataHandler = null,
        on_error: ?NoDataHandler = null,
        on_close: ?NoDataHandler = null,

        const EventType = enum(u8) {
            message = 1,
            open = 2,
            @"error" = 3,
            close = 4,
        };

        /// Describes if current protocol is secure.
        pub inline fn isSecure() bool {
            return @"0"();
        }

        /// Creates a new WebSocket connection.
        pub fn init(
            ctx: Context,
            url: []const u8,
        ) !*Self {
            const str = mem.allocCString(url);

            const id = @"1"(str);

            mem.freeCString(str);

            const ws = try allocator.create(Self);
            errdefer allocator.destroy(ws);

            ws.* = .{
                .id = id,
                .ctx = ctx,
            };

            try websocket_instances.putNoClobber(ws.id, ws);

            return ws;
        }

        /// Closes and destroys the WebSocket connection.
        pub inline fn deinit(self: *Self) void {
            @"2"(self.id);

            _ = websocket_instances.remove(self.id);

            allocator.destroy(self);

            self.* = undefined;
        }

        /// Returns true if the WebSocket is ready for communication.
        pub inline fn isReady(self: Self) bool {
            return @"3"(self.id);
        }

        /// Sends binary data through the WebSocket.
        pub inline fn send(self: Self, data: []const u8) bool {
            // This would slow the code
            // if (!self.isReady()) {
            //     return error.WebSocketNotReady;
            // }

            return @"4"(self.id, data.ptr, data.len) != 0;
        }

        pub const MessageEvent = packed struct {
            event_type: EventType,
            data_ptr: ?mem.MemoryPtr,
            data_size: usize,
        };

        /// Polls for the next WebSocket event.
        pub inline fn poll(id: WebSocketId) ?MessageEvent {
            var data_ptr: mem.MemoryPtr = undefined;
            var data_size: usize = undefined;

            const event_type_raw = @"5"(id, &data_ptr, &data_size);
            if (event_type_raw == 0) return null;

            return .{
                .event_type = @enumFromInt(event_type_raw),
                .data_ptr = if (@intFromPtr(data_ptr) == 0 or data_size == 0)
                    null
                else
                    data_ptr,
                .data_size = data_size,
            };
        }

        export fn pollHandle(id: WebSocketId) void {
            if (websocket_instances.get(id)) |ws| {
                if (poll(id)) |event| {
                    switch (event.event_type) {
                        .message => {
                            if (ws.on_message) |handler| {
                                if (event.data_ptr) |ptr| {
                                    const data = @as([*]const u8, @ptrCast(ptr))[0..event.data_size];

                                    handler(ws, data);

                                    mem.free(ptr);
                                }
                            }
                        },
                        .open => if (ws.on_open) |handler| handler(ws),
                        .@"error" => if (ws.on_error) |handler| handler(ws),
                        .close => if (ws.on_close) |handler| handler(ws),
                    }
                }
            }
        }

        /// Checks if current protocol is secure.
        extern "3" fn @"0"() bool;
        /// Creates WebSocket connection.
        extern "3" fn @"1"(ptr: mem.CStringPointer) WebSocketId;
        /// Destroys WebSocket connection.
        extern "3" fn @"2"(id: WebSocketId) void;
        /// Checks if WebSocket is ready.
        extern "3" fn @"3"(id: WebSocketId) bool;
        /// Sends data through WebSocket.
        extern "3" fn @"4"(id: WebSocketId, ptr: [*]const u8, size: u32) u8;
        /// Polls for WebSocket events.
        extern "3" fn @"5"(id: WebSocketId, ptr_addr: *mem.MemoryPtr, size_addr: *usize) u8;
    };
}
