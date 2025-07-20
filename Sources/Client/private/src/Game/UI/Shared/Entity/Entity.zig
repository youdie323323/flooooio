pub const EntityId = u16;

pub fn Entity(comptime Impl: type) type {
    return struct {
        pub const Vector2 = @Vector(2, f32);

        impl: Impl,

        id: EntityId,

        t: f32 = 0,
        update_t: f32 = 0,

        hurt_t: f32 = 0,
        dead_t: f32 = 0,

        pos: Vector2,
        old_pos: Vector2,
        next_pos: Vector2,

        eye_pos: Vector2 = .{ 1, 0 },

        size: f32,
        next_size: f32,
        old_size: f32,

        angle: f32,
        next_angle: f32,
        old_angle: f32,

        health: f32,
        next_health: f32,
        old_health: f32,

        is_poisoned: bool = false,
        poison_t: f32 = 0,

        red_health: f32,
        red_health_timer: f32 = 0,

        is_dead: bool = false,
        move_counter: f32 = 0,
        hp_alpha: f32 = 1,

        pub fn init(
            impl: Impl,
            id: EntityId,
            pos: Vector2,
            angle: f32,
            size: f32,
            health: f32,
        ) @This() {
            return .{
                .impl = impl,

                .id = id,

                .pos = pos,
                .old_pos = pos,
                .next_pos = pos,

                .angle = angle,
                .next_angle = angle,
                .old_angle = angle,

                .size = size,
                .next_size = size,
                .old_size = size,

                .health = health,
                .next_health = health,
                .old_health = health,

                .red_health = health,
            };
        }

        pub fn deinit(self: *@This(), allocator: mem.Allocator) void {
            if (comptime @hasDecl(Impl, "deinit")) // Call implementation deinit
                self.impl.deinit(allocator, self);

            self.* = undefined;
        }

        /// Updates entity components depends on Δt.
        pub fn update(self: *@This(), delta_time: f32) void {
            const delta_time_100 = delta_time * 0.01;
            const delta_time_150 = delta_time_100 * comptime (2.0 / 3.0);
            const delta_time_200 = delta_time_100 * 0.5;

            const delta_time_200_safelerp = @min(1, delta_time_200);

            self.update_t += delta_time_100;

            // Limit in the 1 to safely use for lerp
            self.t = @min(1, self.update_t);

            if (self.hurt_t > 0) {
                self.hurt_t -= delta_time_150;

                if (self.hurt_t < 0) self.hurt_t = 0;
            }

            if (self.is_dead) self.dead_t += delta_time_150;

            const t_vector: Vector2 = @splat(self.t);

            { // Interpolate common properties and its related properties
                // Position
                self.pos = math.lerp(self.old_pos, self.next_pos, t_vector);

                // Size
                self.size = math.lerp(self.old_size, self.next_size, self.t);

                { // Angle
                    self.angle = interpolateAngle(self.old_angle, self.next_angle, self.t);

                    { // Eye pos
                        const next_eye_pos: Vector2 = .{ @cos(self.next_angle), @sin(self.next_angle) };

                        self.eye_pos = math.lerp(self.eye_pos, next_eye_pos, t_vector);
                    }

                    {
                        const diff_x, const diff_y = self.pos - self.next_pos;
                        const dist = math.hypot(diff_x, diff_y);

                        self.move_counter += (delta_time * dist) / 900;
                    }
                }

                { // Health
                    self.health = math.lerp(self.old_health, self.next_health, self.t);

                    // Hp alpha
                    if (self.health < 1) self.hp_alpha = math.lerp(self.hp_alpha, 1, delta_time_200_safelerp);

                    { // Red health
                        if (self.red_health_timer > 0) {
                            self.red_health_timer -= delta_time / 600;

                            if (0 > self.red_health_timer) self.red_health_timer = 0;
                        }

                        if (self.red_health_timer == 0)
                            self.red_health = math.lerp(self.red_health, self.health, delta_time_200_safelerp);
                    }
                }
            }

            { // Poison
                const poison_t_dir: f32 =
                    if (self.is_poisoned)
                        1
                    else
                        -1;

                self.poison_t = @mulAdd(f32, delta_time_200, poison_t_dir, self.poison_t);
                self.poison_t = math.clamp(self.poison_t, 0, 1);
            }

            if (comptime @hasDecl(Impl, "update")) // Call update of implementation
                self.impl.update(self, delta_time);
        }

        fn calculateAngleDistance(start_angle: f32, end_angle: f32) f32 {
            const angle_diff = @mod(end_angle - start_angle, math.tau);

            return @mod(angle_diff * 2, math.tau) - angle_diff;
        }

        fn interpolateAngle(start_angle: f32, end_angle: f32, progress: f32) f32 {
            return @mulAdd(f32, calculateAngleDistance(start_angle, end_angle), progress, start_angle);
        }
    };
}

const std = @import("std");
const math = std.math;
const heap = std.heap;
const mem = std.mem;
