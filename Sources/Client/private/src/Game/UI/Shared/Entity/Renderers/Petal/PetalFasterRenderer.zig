fn render(rctx: *RenderContext(MobSuper)) void {
    drawBasicLike(
        rctx,
        0xfeffc9,
        15,
        4,
    );
}

pub const PetalFasterRenderer = Renderer(MobSuper, false, render, null);

const std = @import("std");
const math = std.math;
const time = std.time;

const Renderer = @import("../Renderer.zig").Renderer;
const skin_darken = @import("../Renderer.zig").skin_darken;
const RenderContext = @import("../Renderer.zig").RenderContext;
const MobSuper = @import("../../Mob.zig").Super;

const drawBasicLike = @import("PetalBasicRenderer.zig").drawBasicLike;
