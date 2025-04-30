const std = @import("std");

pub fn build(b: *std.Build) void {
    const target = b.standardTargetOptions(.{
        .default_target = .{
            .cpu_arch = .wasm32,
            .os_tag = .wasi,
        },
    });

    const exe = b.addExecutable(.{
        .name = "client",
        .root_source_file = b.path("src/main.zig"),
        .target = target,
        .optimize = .ReleaseFast,
        .strip = true,
    });

    exe.import_table = true;
    exe.entry = .disabled;
    exe.rdynamic = true;

    b.installArtifact(exe);
}
