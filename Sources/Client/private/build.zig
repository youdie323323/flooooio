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
                .single_threaded = true,
            },
        ),
    });

    wasm.rdynamic = true;

    wasm.export_memory = true;

    wasm.export_table = true;

    wasm.initial_memory = wasm_memory;
    wasm.max_memory = wasm_memory;

    wasm.link_function_sections = true; // -ffunction-sections
    wasm.link_data_sections = true; // -fdata-sections
    wasm.link_gc_sections = true; // --gc-sections

    wasm.entry = .disabled;

    wasm.want_lto = true;

    { // Add bounded array
        const bounded_array = b.dependency("bounded_array", .{});

        wasm.root_module.addImport("bounded_array", bounded_array.module("bounded_array"));
    }

    b.installArtifact(wasm);
}
