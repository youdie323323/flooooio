const std = @import("std");

pub fn build(b: *std.Build) !void {
    const target = b.standardTargetOptions(.{
        .default_target = .{
            .cpu_arch = .wasm32,
            .os_tag = .wasi,
            .abi = .musl,
        },
    });

    const exe = b.addExecutable(.{
        .name = "client",
        .root_module = b.createModule(.{
            .root_source_file = b.path("src/main.zig"),
            .target = target,
            .optimize = .ReleaseFast,
            .strip = true,
        }),
    });

    exe.export_memory = true;
    exe.export_table = true;
    exe.entry = .disabled;
    exe.rdynamic = true;

    exe.linkLibCpp();
    exe.addIncludePath(b.path("c-src"));
    exe.addCSourceFile(.{
        .file = b.path("c-src/hello.cpp"),
        .flags = &.{
            "-fno-exceptions",
        },
    });

    {
        const optimize = b.standardOptimizeOption(.{});

        const boost_dep = b.dependency("boost", .{
            .target = target,
            .optimize = optimize,
        });
        const boost_artifact = boost_dep.artifact("boost");

        for (boost_artifact.root_module.include_dirs.items) |include_dir| {
            try exe.root_module.include_dirs.append(b.allocator, include_dir);
        }

        // If not header-only, link library
        exe.linkLibrary(boost_artifact);
    }

    b.installArtifact(exe);
}
