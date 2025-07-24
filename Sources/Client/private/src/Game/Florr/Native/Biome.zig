pub const Biome = enum(u8) {
    garden,
    desert,
    ocean,

    const names: std.EnumMap(Biome, []const u8) = .init(.{
        .garden = "Garden",
        .desert = "Desert",
        .ocean = "Ocean",
    });

    const colors: std.EnumMap(Biome, Color) = .init(.{
        .garden = .comptimeFromHex(0x1EA761),
        .desert = .comptimeFromHex(0xECDCb8),
        .ocean = .comptimeFromHex(0x4E77A7),
    });

    var tilesets: std.EnumMap(Biome, TileRenderer.Tileset) = .init(.{});

    /// Resolution of tile.
    pub const tile_resoltion = 4;

    /// Size of tile.
    pub const tile_size = 256 * tile_resoltion;

    /// Statically-initializes biome tilesets.
    /// This function using allocator.alloc for UAF.
    pub fn initTilesets(allocator: mem.Allocator) !void {
        const garden_tile_1: TileRenderer.Tile = CanvasContext.createCanvasContext(allocator, tile_size, tile_size, false);
        const garden_tile_2: TileRenderer.Tile = CanvasContext.createCanvasContext(allocator, tile_size, tile_size, false);
        const garden_tile_3: TileRenderer.Tile = CanvasContext.createCanvasContext(allocator, tile_size, tile_size, false);
        const garden_tile_4: TileRenderer.Tile = CanvasContext.createCanvasContext(allocator, tile_size, tile_size, false);

        garden_tile_1.drawSvg(@embedFile("../../UI/Shared/Tile/Tiles/grass_c_0.svg"));
        garden_tile_2.drawSvg(@embedFile("../../UI/Shared/Tile/Tiles/grass_c_1.svg"));
        garden_tile_3.drawSvg(@embedFile("../../UI/Shared/Tile/Tiles/grass_c_2.svg"));
        garden_tile_4.drawSvg(@embedFile("../../UI/Shared/Tile/Tiles/grass_c_3.svg"));

        const desert_tile_1: TileRenderer.Tile = CanvasContext.createCanvasContext(allocator, tile_size, tile_size, false);
        const desert_tile_2: TileRenderer.Tile = CanvasContext.createCanvasContext(allocator, tile_size, tile_size, false);
        const desert_tile_3: TileRenderer.Tile = CanvasContext.createCanvasContext(allocator, tile_size, tile_size, false);
        const desert_tile_4: TileRenderer.Tile = CanvasContext.createCanvasContext(allocator, tile_size, tile_size, false);
        const desert_tile_5: TileRenderer.Tile = CanvasContext.createCanvasContext(allocator, tile_size, tile_size, false);

        desert_tile_1.drawSvg(@embedFile("../../UI/Shared/Tile/Tiles/desert_c_0.svg"));
        desert_tile_2.drawSvg(@embedFile("../../UI/Shared/Tile/Tiles/desert_c_1.svg"));
        desert_tile_3.drawSvg(@embedFile("../../UI/Shared/Tile/Tiles/desert_c_2.svg"));
        desert_tile_4.drawSvg(@embedFile("../../UI/Shared/Tile/Tiles/desert_c_3.svg"));
        desert_tile_5.drawSvg(@embedFile("../../UI/Shared/Tile/Tiles/desert_c_4.svg"));

        const ocean_tile_1: TileRenderer.Tile = CanvasContext.createCanvasContext(allocator, tile_size, tile_size, false);
        const ocean_tile_2: TileRenderer.Tile = CanvasContext.createCanvasContext(allocator, tile_size, tile_size, false);
        const ocean_tile_3: TileRenderer.Tile = CanvasContext.createCanvasContext(allocator, tile_size, tile_size, false);
        const ocean_tile_4: TileRenderer.Tile = CanvasContext.createCanvasContext(allocator, tile_size, tile_size, false);

        ocean_tile_1.drawSvg(@embedFile("../../UI/Shared/Tile/Tiles/ocean_c_0.svg"));
        ocean_tile_2.drawSvg(@embedFile("../../UI/Shared/Tile/Tiles/ocean_c_1.svg"));
        ocean_tile_3.drawSvg(@embedFile("../../UI/Shared/Tile/Tiles/ocean_c_2.svg"));
        ocean_tile_4.drawSvg(@embedFile("../../UI/Shared/Tile/Tiles/ocean_c_3.svg"));

        { // Put garden tiles
            const garden_tiles = try allocator.alloc(TileRenderer.Tile, 4);

            garden_tiles[0] = garden_tile_1;
            garden_tiles[1] = garden_tile_2;
            garden_tiles[2] = garden_tile_3;
            garden_tiles[3] = garden_tile_4;

            tilesets.put(.garden, garden_tiles);
        }

        { // Put desert tiles
            const desert_tiles = try allocator.alloc(TileRenderer.Tile, 5);

            desert_tiles[0] = desert_tile_1;
            desert_tiles[1] = desert_tile_2;
            desert_tiles[2] = desert_tile_3;
            desert_tiles[3] = desert_tile_4;
            desert_tiles[4] = desert_tile_5;

            tilesets.put(.desert, desert_tiles);
        }

        { // Put ocean tiles
            const ocean_tiles = try allocator.alloc(TileRenderer.Tile, 4);

            ocean_tiles[0] = ocean_tile_1;
            ocean_tiles[1] = ocean_tile_2;
            ocean_tiles[2] = ocean_tile_3;
            ocean_tiles[3] = ocean_tile_4;

            tilesets.put(.ocean, ocean_tiles);
        }
    }

    pub fn name(biome: Biome) ?[]const u8 {
        return names.get(biome);
    }

    pub fn color(biome: Biome) ?Color {
        return colors.get(biome);
    }

    pub fn tileset(biome: Biome) ?TileRenderer.Tileset {
        return tilesets.get(biome);
    }
};

const std = @import("std");
const mem = std.mem;
const meta = std.meta;

const CanvasContext = @import("../../Kernel/WebAssembly/Interop/Canvas2D/CanvasContext.zig");
const Color = @import("../../Kernel/WebAssembly/Interop/Canvas2D/Color.zig");

const Timer = @import("../../Kernel/WebAssembly/Interop/Timer.zig");

const TileRenderer = @import("../../UI/Shared/Tile/TileRenderer.zig");
