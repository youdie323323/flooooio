const std = @import("std");

const src_folder = "src";

const c_src_folder = "src-c";

const wasm_memory = 4096 * std.wasm.page_size;

pub fn build(b: *std.Build) !void {
    const is_production = b.option(
        bool,
        "production",
        "Enable production build",
    ) orelse false;

    const target = b.standardTargetOptions(.{
        .default_target = .{
            .cpu_arch = .wasm32,
            .os_tag = .wasi,
            .abi = .musl,
        },
    });

    const wasm = b.addExecutable(.{
        .name = "client",
        .root_module = b.createModule(
            if (is_production) .{
                .root_source_file = b.path(src_folder ++ "/main.zig"),
                .target = target,
                .optimize = .ReleaseFast,
                .single_threaded = true,
                .strip = true,
                .unwind_tables = .none,
                .stack_protector = false,
                .pic = false,
            } else .{
                .root_source_file = b.path(src_folder ++ "/main.zig"),
                .target = target,
                .optimize = .Debug,
            },
        ),
    });

    wasm.export_memory = true;

    wasm.initial_memory = wasm_memory;
    wasm.max_memory = wasm_memory;

    wasm.export_table = true;

    wasm.entry = .disabled;

    wasm.rdynamic = true;

    wasm.want_lto = true;

    // exe.linkLibCpp();
    // exe.addIncludePath(b.path(c_src_folder));
    // exe.addCSourceFile(.{
    //     .file = b.path(c_src_folder ++ "/parse_svg.cpp"),
    //     .flags = &.{
    //         "-s",
    //         "-fno-stack-protector",
    //         "-fno-pie",
    //         "-fno-unwind-tables",
    //         "-fno-asynchronous-unwind-tables",
    //         "-Wl,--gc-sections",
    //         "-Wl,--strip-all",
    //     },
    // });

    const optimize = b.standardOptimizeOption(.{});

    {
        const boost_dep = b.dependency("boost", .{
            .target = target,
            .optimize = optimize,
        });
        const boost_artifact = boost_dep.artifact("boost");

        for (boost_artifact.root_module.include_dirs.items) |include_dir| {
            try wasm.root_module.include_dirs.append(b.allocator, include_dir);
        }

        // If not header-only, link library
        wasm.linkLibrary(boost_artifact);

        // exe.root_module.addCMacro("BOOST_NO_RTTI", "");
        // exe.root_module.addCMacro("BOOST_NO_EXCEPTIONS", "");
        // exe.root_module.addCMacro("BOOST_EXCEPTION_DISABLE", "");
    }

    b.installArtifact(wasm);
}
