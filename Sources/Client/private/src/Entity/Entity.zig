const std = @import("std");
const math = std.math;

// TODO
var delta_time: f32 = 0.0;

pub fn Entity() type {
    return struct {
        const Self = @This();
        const Vector2 = @Vector(2, f32);

        inline fn calculateAngleDistance(start_angle: f32, end_angle: f32) f32 {
            return @mod(end_angle - start_angle, math.tau) - math.pi;
        }

        inline fn interpolateAngle(start_angle: f32, end_angle: f32, progress: f32) f32 {
            return start_angle + calculateAngleDistance(start_angle, end_angle) * progress;
        }

        inline fn smoothInterpolate(current: f32, target: f32, duration: f32) f32 {
            return current + (target - current) * @min(1, delta_time / duration);
        }

        id: u32,

        t: f32,
        update_t: f32,

        hurt_t: f32,
        dead_t: f32,

        pos: Vector2,
        old_pos: Vector2,
        next_pos: Vector2,

        eye_pos: Vector2,

        size: f32,
        next_size: f32,
        old_size: f32,

        angle: f32,
        next_angle: f32,
        old_angle: f32,

        health: f32,
        next_health: f32,
        old_health: f32,

        red_health: f32,
        red_health_timer: f32,

        is_dead: bool,
        move_counter: f32,
        hp_alpha: f32,

        pub fn init(id: u32, x: f32, y: f32, angle: f32, size: f32, health: f32) Self {
            const initial_pos: Vector2 = .{ x, y };

            return .{
                .id = id,

                .t = 0,
                .update_t = 0,

                .hurt_t = 0,
                .dead_t = 0,

                .pos = initial_pos,
                .old_pos = initial_pos,
                .next_pos = initial_pos,

                .eye_pos = .{ 1, 0 },

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
                .red_health_timer = 0,

                .is_dead = false,
                .move_counter = 0,
                .hp_alpha = 1,
            };
        }

        pub fn update(self: *Self) void {
            if (self.is_dead) self.dead_t += delta_time / 200;

            if (self.hurt_t > 0) {
                self.hurt_t -= delta_time / 150;

                if (self.hurt_t < 0) self.hurt_t = 0;
            }

            self.update_t += delta_time / 100;
            self.t = @min(1, self.update_t);

            const t_vector: Vector2 = @splat(self.t);
            self.pos = self.old_pos + (self.next_pos - self.old_pos) * t_vector;

            self.health = self.old_health + (self.next_health - self.old_health) * self.t;
            self.size = self.old_size + (self.next_size - self.old_size) * self.t;

            const eye_time_factor = @min(1, delta_time / 100);
            const target_eye: Vector2 = .{ @cos(self.next_angle), @sin(self.next_angle) };
            const eye_factor: Vector2 = @splat(eye_time_factor);

            self.eye_pos += (target_eye - self.eye_pos) * eye_factor;

            self.angle = interpolateAngle(self.old_angle, self.next_angle, self.t);

            {
                const diff_x, const diff_y = self.pos - self.next_pos;
                const dist = math.hypot(diff_x, diff_y);

                self.move_counter += dist / 50 * delta_time / 18;
            }

            if (self.health < 1) self.hp_alpha = smoothInterpolate(self.hp_alpha, 1, 200);

            if (self.red_health_timer > 0) {
                self.red_health_timer -= delta_time / 600;

                if (self.red_health_timer < 0) self.red_health_timer = 0;
            }

            if (self.red_health_timer == 0)
                self.red_health += (self.health - self.red_health) * @min(1, delta_time / 200);
        }
    };
}
