//! Here we find the heart of Zein - Tensors. Before proceeding, please read the following:
//!
//! DESIGN PHILOSOPHY (June 3, 2023)
//!
//! MEMORY, OWNDERSHIP, AND REFERENCING:
//!
//! There is no plan to make a distinction between a tensor and a "view" of a tensor.
//! Tensors here are, by design, a way to view data. As such, a different "tensored" view
//! of the same data is just another tensor that shares underlying memory.
//!
//! THIS STRONGLY IMPLIES THAT TENSORS DO NOT *OWN* DATA, THEY VIEW IT
//!
//! If anything can be said to "own" memory, it is the allocator. Allocators are going
//! to play an important role in this library (as they do in Zig more generally).
//!
//! To create a tensor that has initialized memory is the job of a factory.
//! The design of such a tensor factory, as it were, will be handled in a source
//! file dedicated to that exact job. It is very important that we do not cross
//! responsibilities in this system.
//!
//! TENSORS AS THEY RELATE TO ARRAYS:
//!
//! Because of the design descisions outlined above, users should be able to easily
//! make a tensor with their desired dimensions to wrap existing arrays and manipulate
//! them as if they were tensors themselves. This means that a tensor can act like
//! an adapter to already existing memory.
//!
//! Because of this, there is not a current plan to enforce that tensors must be of
//! one type or another. It is my hope to provide a generic tensor based interface
//! that can be used on a variety of objects at the user's caution.
//!
//! At some point, it may be important to then provide a generic functional interface
//! to provide for further use cases such as generically holding objects that users
//! create themselves. While this is an interesting goal, the scope of V1 is currently
//! focused on integer and floating point numbers. User provided types will have to
//! be reviewed as time goes forward.

const std = @import("std");
const testing = std.testing;
const mem = std.mem;
const debug = std.debug;
const heap = std.heap;
const math = std.math;

const builtin = @import("builtin");

const root = @import("root");

const Size = @import("TensorLayout.zig").Size;
const Rank = @import("TensorLayout.zig").Rank;
const Sizes = @import("TensorLayout.zig").Sizes;
const SizeAndStride = @import("TensorLayout.zig").SizeAndStride;
const TensorLayout = @import("TensorLayout.zig").TensorLayout;
const WiseOrder = @import("TensorLayout.zig").WiseOrder;

const Expression = @import("TensorExpression.zig").Expression;

pub const is_debug = builtin.mode == .Debug;

pub const TensorError = error{
    InvalidTensorLayout,
    InvalidPermutation,
    AllocSizeMismatch,
    CapacityMismatch,
    RankMismatch,
    SingularMatrix,
    NormalizeZeroVector,
};

/// Computes the linear index in the underlying array based on
/// multi-dimensional indices and strides.
pub fn computeTensorIndex(
    comptime Element: type,
    comptime rank: Rank,
    strides: Sizes(rank),
    indices: Sizes(rank),
) Element {
    return switch (rank) {
        inline 1 => indices[0], // Direct index... just an array

        inline 2 => indices[0] * strides[0] + indices[1] * strides[1],

        // Inner product between indices and strides
        inline else => @reduce(.Add, strides * indices),
    };
}

/// Unmanaged tensor implementation.
/// Supports up to 63 rank.
pub fn Tensor(
    comptime Element: type,
    comptime rank: Rank,
    comptime order: WiseOrder,
    comptime sizes: Sizes(rank),
) type {
    comptime { // Checksum
        if (64 <= rank)
            @compileError("Tensors of rank 64 or greater are not supported");

        if (0 == rank)
            @compileError("Tensors of rank zero (scalar) are not supported. Use the value directly");
    }

    return struct {
        const rank_kind: enum {
            // Unused but leave it for consistency
            scalar,
            vector,
            matrix,
            unnamed,
        } = switch (rank) {
            0 => .scalar,
            1 => .vector,
            2 => .matrix,
            else => .unnamed,
        };

        const elems_cap = @reduce(.Mul, sizes);

        pub const Elements = []Element;

        /// Sized version of InternalElements.
        pub const SizedElements = [elems_cap]Element;

        const Layout = TensorLayout(rank, order, sizes);

        /// Continuous function to setup diagonal elements.
        const ElementContinuousFn = *const fn (i: usize) callconv(.@"inline") Element;

        /// Whether check matrix is singular on inverse().
        const inverse_check_singular_matrix =
            is_debug or @hasDecl(root, "inverse_check_singular_matrix");

        /// Whether this tensor is vector.
        const is_vector = rank_kind == .vector;

        /// Whether this tensor is matrix.
        const is_matrix = rank_kind == .matrix;

        /// Whether this matrix is square matrix.
        const is_square_matrix =
            if (is_matrix)
                sizes[0] == sizes[1]
            else
                false;

        /// Whether element type is float.
        const is_element_float = switch (@typeInfo(Element)) {
            .float => true,
            else => false,
        };

        const eps: Element =
            if (is_element_float)
                math.floatEps(Element)
            else
                mem.zeroes(Element);

        elements: Elements,

        layout: Layout,

        pub fn init(elems: Elements, layout: ?Layout) TensorError!@This() {
            var self: @This() = .{
                .elements = elems,
                .layout = layout orelse .init(),
            };

            if (!self.isValid())
                return TensorError.CapacityMismatch;

            return self;
        }

        /// Creates this matrix with diagonal elements present.
        pub fn initDiagonalMatrix(
            elems: []Element,
            comptime elem_fn: ElementContinuousFn,
            layout: ?Layout,
        ) TensorError!@This() {
            if (comptime !(is_matrix and is_square_matrix))
                return TensorError.InvalidTensorLayout;

            if (elems.len != elems_cap)
                return TensorError.CapacityMismatch;

            @memset(elems, 0);

            const m = comptime sizes[0];

            inline for (0..m) |i| {
                elems[comptime (i * (m + 1))] = comptime elem_fn(i);
            }

            return .{
                .elements = elems,

                .layout = layout orelse .init(),
            };
        }

        pub fn destroy(self: *@This(), allocator: mem.Allocator) void {
            allocator.free(self.elements);

            self.* = undefined;
        }

        /// Clones this tensor.
        /// Caller **must** destroy allocated elements using destory().
        pub fn clone(self: @This(), allocator: mem.Allocator) (mem.Allocator.Error || TensorError)!@This() {
            const new_elements = try allocator.alloc(Element, self.elementsSize());

            @memcpy(new_elements, self.elements);

            return try .init(new_elements, self.layout);
        }

        /// Returns the total capacity of the tensor.
        pub fn capacity(self: @This()) usize {
            return @reduce(.Mul, self.layout.sizes);
        }

        /// Checks if the tensor's value capacity matches its actual size.
        pub fn isValid(self: @This()) bool {
            return self.elementsSize() == self.capacity();
        }

        /// Swaps both elements and layout between two tensors.
        pub fn swap(self: *@This(), other: *@This()) void {
            self.swapElements(other);
            self.swapLayout(other);
        }

        /// Swaps elements between two tensors.
        /// Asserts that sizes and capacities are compatible.
        pub fn swapElements(self: *@This(), other: *@This()) void {
            // To assure that sizes and strides are not
            // invalidated, we check size and capacity
            debug.assert(self.elementsSize() == other.elementsSize());
            debug.assert(self.isValid() and other.isValid());

            mem.swap(Elements, &self.elements, &other.elements);
        }

        /// Swaps only the layout between two tensors.
        pub fn swapLayout(self: *@This(), other: *@This()) void {
            mem.swap(Layout, &self.layout, &other.layout);
        }

        /// Creates a new tensor with permuted dimensions based on the expression.
        /// Expression is a string describing the permutation (e.g. "ij->ji" for transpose).
        pub fn permutate(
            self: *@This(),
            comptime expr: Expression,
        ) @This() {
            // Create a permutated tensor that shares the same underlying memory
            debug.assert(self.isValid());

            var tmp = self.*; // Share values

            @import("TensorLayoutPermutate.zig").permutate(rank, order, sizes, expr, &tmp.layout);

            return tmp;
        }

        /// Returns the actual number of values stored in the tensor.
        pub fn elementsSize(self: @This()) usize {
            return self.elements.len;
        }

        /// Returns the element at the specified indices.
        pub fn get(self: @This(), indices: Sizes(rank)) Element {
            const n = computeTensorIndex(Size, rank, self.layout.strides, indices);

            return self.elements[n];
        }

        /// Sets the element at the specified indices.
        pub fn set(self: *@This(), indices: Sizes(rank), elem: Element) void {
            const n = computeTensorIndex(Size, rank, self.layout.strides, indices);

            self.elements[n] = elem;
        }

        /// Returns the size of the specified dimension.
        pub fn size(self: @This(), comptime i: comptime_int) Size {
            return self.layout.sizes[i];
        }

        /// Returns the stride of the specified dimension.
        pub fn stride(self: @This(), comptime i: comptime_int) Size {
            return self.layout.strides[i];
        }

        // Begin utility (unneeded) methods here, as provided all needed methods
        // Methods that checking element is float, is mean that method is mathematical method

        /// Transposes a 2D tensor (matrix), swapping rows and columns.
        pub fn transpose(self: *@This()) TensorError!@This() {
            if (comptime !is_matrix) return TensorError.InvalidTensorLayout;

            return self.permutate("ij->ji");
        }

        /// Calculates the Frobenius norm of a matrix.
        pub fn frobeniusNorm(self: @This()) TensorError!Element {
            if (comptime !(is_element_float and is_matrix)) return TensorError.InvalidTensorLayout;

            var sum: Element = 0;

            const m = self.size(0);
            const n = self.size(1);

            for (0..m) |i| {
                for (0..n) |j| {
                    const component = self.get(.{ i, j });

                    sum += component * component;
                }
            }

            return @sqrt(sum);
        }

        /// Calculates trace within this matrix, which tr X in mathematical notation.
        pub fn trace(self: @This()) TensorError!Element {
            if (comptime !(is_matrix and is_square_matrix)) return TensorError.InvalidTensorLayout;

            // Just get m since square matrix
            const m = comptime sizes[0];

            var acc: Element = 0;

            inline for (0..m) |i| {
                acc += self.get(comptime @splat(i));
            }

            return acc;
        }

        pub fn augmentWithIdentity(self: @This(), allocator: mem.Allocator) (mem.Allocator.Error || TensorError)!Tensor(Element, rank, order, .{ sizes[0], 2 * sizes[1] }) {
            if (comptime !(is_matrix and is_element_float)) return TensorError.InvalidTensorLayout;

            const m, const n = sizes;

            const @"2n" = comptime 2 * n;

            const new_elements = try allocator.alloc(Element, comptime (m * @"2n"));

            @memset(new_elements, 0);

            inline for (0..m) |i| {
                inline for (0..n) |j| {
                    new_elements[comptime (i * @"2n" + j)] = self.get(comptime .{ i, j });
                }
            }

            inline for (0..m) |i| { // Add identity matrix
                new_elements[comptime (i * @"2n" + n + i)] = 1;
            }

            return try .init(new_elements, null);
        }

        /// Do Gauss-Jordan method within this matrix.
        pub fn gaussJordanElimination(self: *@This()) TensorError!void {
            if (comptime !(is_matrix and is_element_float)) return TensorError.InvalidTensorLayout;

            const m = self.size(0);
            const n = self.size(1);

            var h: usize = 0;
            var k: usize = 0;

            while (h < m and k < n) {
                // Pivot selection
                var i_max = h;

                for (h..m) |i| {
                    if (@abs(self.get(.{ i, k })) > @abs(self.get(.{ i_max, k }))) {
                        i_max = i;
                    }
                }

                if (self.get(.{ i_max, k }) == 0) {
                    k += 1;

                    continue;
                }

                if (i_max != h) { // Exchange row
                    for (0..n) |j| {
                        const temp = self.get(.{ h, j });
                        self.set(.{ h, j }, self.get(.{ i_max, j }));
                        self.set(.{ i_max, j }, temp);
                    }
                }

                const pivot = self.get(.{ h, k });
                if (pivot == 0) return TensorError.InvalidTensorLayout; // Avoid division by zero

                for (k..n) |j| {
                    self.set(.{ h, j }, self.get(.{ h, j }) / pivot);
                }

                for (0..m) |i| { // Update other rows
                    if (i == h) continue;

                    const factor = self.get(.{ i, k });

                    for (k..n) |j| {
                        self.set(.{ i, j }, self.get(.{ i, j }) - factor * self.get(.{ h, j }));
                    }
                }

                h += 1;
                k += 1;
            }
        }

        /// Calculate inverse of this matrix.
        pub fn inverse(self: @This(), allocator: mem.Allocator) (mem.Allocator.Error || TensorError)!@This() {
            if (comptime !(is_element_float and is_matrix and is_square_matrix)) return TensorError.InvalidTensorLayout;

            var augmented = try self.augmentWithIdentity(allocator);
            defer augmented.destroy(allocator);

            try augmented.gaussJordanElimination();

            const m, const n = sizes;

            if (comptime inverse_check_singular_matrix) { // Check if the left m x n block is approximately the identity matrix
                inline for (0..m) |i| {
                    inline for (0..n) |j| {
                        const expected: comptime_float =
                            comptime if (i == j)
                                1
                            else
                                0;

                        if (@abs(augmented.get(.{ i, j }) - expected) > eps)
                            return TensorError.SingularMatrix; // Matrix is not invertible
                    }
                }
            }

            // Extract inverse matrix from right-side
            const new_elements = try allocator.alloc(Element, elems_cap);

            inline for (0..m) |i| {
                inline for (0..n) |j| {
                    new_elements[comptime (i * n + j)] = augmented.get(comptime .{ i, n + j });
                }
            }

            return try .init(new_elements, null);
        }

        /// Calculate euclidean norm of this vector.
        pub fn norm(self: @This()) TensorError!Element {
            if (comptime !(is_element_float and is_vector)) return TensorError.InvalidTensorLayout;

            var sum: Element = 0;

            inline for (0..elems_cap) |i| {
                const component = self.elements[i];

                sum += component * component;
            }

            return @sqrt(sum);
        }

        /// Normalizes this vector.
        /// Caller **must** free this vector, as copied this vector in implementation.
        pub fn normalize(self: *@This(), allocator: mem.Allocator) (mem.Allocator.Error || TensorError)!@This() {
            if (comptime !(is_element_float and is_vector)) return TensorError.InvalidTensorLayout;

            const n = try self.norm();
            if (n < eps) return TensorError.NormalizeZeroVector;

            var cloned = try self.clone(allocator);

            inline for (0..elems_cap) |i| {
                const component = self.elements[i];

                cloned.set(.{i}, component / n);
            }

            return cloned;
        }
    };
}

test "Tensor Swapping" {
    const x_elems = try heap.page_allocator.alloc(i8, 100);
    defer heap.page_allocator.free(x_elems);

    const y_elems = try heap.page_allocator.alloc(i8, 100);
    defer heap.page_allocator.free(y_elems);

    var a: Tensor(i8, 2, .row, .{ 10, 10 }) = try .init(x_elems, null);
    var b: Tensor(i8, 2, .row, .{ 10, 10 }) = try .init(y_elems, null);

    a.swap(&b);

    try testing.expectEqual(a.elements.ptr, y_elems.ptr);
    try testing.expectEqual(b.elements.ptr, x_elems.ptr);

    const total = 10 * 10;

    try testing.expectEqual(total, a.capacity());
    try testing.expectEqual(total, b.capacity());
}

test "Tensor Transpose" {
    var elems: [3 * 3]i32 = .{
        1, 2, 3,
        4, 5, 6,
        7, 8, 9,
    };

    var x: Tensor(i32, 2, .row, .{ 3, 3 }) = try .init(&elems, null);

    try testing.expectEqual(1, x.get(.{ 0, 0 }));
    try testing.expectEqual(2, x.get(.{ 0, 1 }));
    try testing.expectEqual(3, x.get(.{ 0, 2 }));
    try testing.expectEqual(4, x.get(.{ 1, 0 }));
    try testing.expectEqual(5, x.get(.{ 1, 1 }));
    try testing.expectEqual(6, x.get(.{ 1, 2 }));
    try testing.expectEqual(7, x.get(.{ 2, 0 }));
    try testing.expectEqual(8, x.get(.{ 2, 1 }));
    try testing.expectEqual(9, x.get(.{ 2, 2 }));

    var y = try x.transpose();

    try testing.expectEqual(1, y.get(.{ 0, 0 }));
    try testing.expectEqual(4, y.get(.{ 0, 1 }));
    try testing.expectEqual(7, y.get(.{ 0, 2 }));
    try testing.expectEqual(2, y.get(.{ 1, 0 }));
    try testing.expectEqual(5, y.get(.{ 1, 1 }));
    try testing.expectEqual(8, y.get(.{ 1, 2 }));
    try testing.expectEqual(3, y.get(.{ 2, 0 }));
    try testing.expectEqual(6, y.get(.{ 2, 1 }));
    try testing.expectEqual(9, y.get(.{ 2, 2 }));
}

test "Tensor Reshaping" {
    var components_or_elems: [9]i32 = .{ 1, 2, 3, 4, 5, 6, 7, 8, 9 };

    // 1D tensor
    _ = try Tensor(i32, 1, .row, .{9}).init(&components_or_elems, null);

    // Reshape to 2D (3×3)
    var t2: Tensor(i32, 2, .row, .{ 3, 3 }) = try .init(&components_or_elems, null);

    // Check element placement
    try testing.expectEqual(1, t2.get(.{ 0, 0 }));
    try testing.expectEqual(2, t2.get(.{ 0, 1 }));
    try testing.expectEqual(3, t2.get(.{ 0, 2 }));
    try testing.expectEqual(4, t2.get(.{ 1, 0 }));
    try testing.expectEqual(5, t2.get(.{ 1, 1 }));
    try testing.expectEqual(6, t2.get(.{ 1, 2 }));
    try testing.expectEqual(7, t2.get(.{ 2, 0 }));
    try testing.expectEqual(8, t2.get(.{ 2, 1 }));
    try testing.expectEqual(9, t2.get(.{ 2, 2 }));

    // Invalid reshape (3×4 requires 12 elements, but data has 9)
    _ = Tensor(i32, 2, .row, .{ 3, 4 }).init(&components_or_elems, null) catch |err|
        try testing.expectEqual(TensorError.CapacityMismatch, err);
}

test "Sum of Elements in 2D Tensor" {
    var elems: [9]i32 = .{ 1, 2, 3, 4, 5, 6, 7, 8, 9 };
    var t: Tensor(i32, 2, .row, .{ 3, 3 }) = try .init(&elems, null);

    var sum: i32 = 0;

    for (0..3) |i| {
        for (0..3) |j| {
            sum += t.get(.{ i, j });
        }
    }

    try testing.expectEqual(1+2+3+4+5+6+7+8+9, sum);
}

test "Sum of Elements in 3D Tensor" {
    var elems: [8]i32 = .{ 1, 2, 3, 4, 5, 6, 7, 8 };
    var t: Tensor(i32, 3, .row, .{ 2, 2, 2 }) = try .init(&elems, null);

    var sum: i32 = 0;

    for (0..2) |i| {
        for (0..2) |j| {
            for (0..2) |k| {
                sum += t.get(.{ i, j, k });
            }
        }
    }

    try testing.expectEqual(sum, 36); // 1+2+3+4+5+6+7+8
}

test "Tensor Transpose with Floats" {
    var elems: [9]f32 = .{ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0 };
    var x: Tensor(f32, 2, .row, .{ 3, 3 }) = try .init(&elems, null);

    // Original tensor
    try testing.expectEqual(x.get(.{ 0, 0 }), 1.0);
    try testing.expectEqual(x.get(.{ 0, 1 }), 2.0);
    try testing.expectEqual(x.get(.{ 0, 2 }), 3.0);
    try testing.expectEqual(x.get(.{ 1, 0 }), 4.0);
    try testing.expectEqual(x.get(.{ 1, 1 }), 5.0);
    try testing.expectEqual(x.get(.{ 1, 2 }), 6.0);
    try testing.expectEqual(x.get(.{ 2, 0 }), 7.0);
    try testing.expectEqual(x.get(.{ 2, 1 }), 8.0);
    try testing.expectEqual(x.get(.{ 2, 2 }), 9.0);

    // Transposed tensor
    var y = try x.transpose();
    try testing.expectEqual(y.get(.{ 0, 0 }), 1.0);
    try testing.expectEqual(y.get(.{ 0, 1 }), 4.0);
    try testing.expectEqual(y.get(.{ 0, 2 }), 7.0);
    try testing.expectEqual(y.get(.{ 1, 0 }), 2.0);
    try testing.expectEqual(y.get(.{ 1, 1 }), 5.0);
    try testing.expectEqual(y.get(.{ 1, 2 }), 8.0);
    try testing.expectEqual(y.get(.{ 2, 0 }), 3.0);
    try testing.expectEqual(y.get(.{ 2, 1 }), 6.0);
    try testing.expectEqual(y.get(.{ 2, 2 }), 9.0);
}

test "Tensor with Zero Dimension" {
    var elems: [0]i32 = .{};

    var t: Tensor(i32, 2, .row, .{ 0, 5 }) = try .init(&elems, null);

    try testing.expectEqual(t.capacity(), 0);

    var t2: Tensor(i32, 2, .row, .{ 3, 0 }) = try .init(&elems, null);

    try testing.expectEqual(t2.capacity(), 0);
}

test "Rank 1 Tensor (Vector)" {
    var components: [5]i32 = .{ 1, 2, 3, 4, 5 };
    var t: Tensor(i32, 1, .row, .{5}) = try .init(&components, null);
    try testing.expect(t.isValid());

    try testing.expectEqual(t.get(.{0}), 1);
    try testing.expectEqual(t.get(.{1}), 2);
    try testing.expectEqual(t.get(.{2}), 3);
    try testing.expectEqual(t.get(.{3}), 4);
    try testing.expectEqual(t.get(.{4}), 5);
}

const SquareMatrix10 = Tensor(f64, 2, .row, @splat(10));

const SquareMatrix2 = Tensor(f64, 2, .row, @splat(2));

test "Inverse tensor" {
    { // Test inverse with diagonal component
        const linear = struct {
            inline fn impl(i: usize) f64 {
                return i + 1;
            }
        }.impl;

        const linear_recp = struct {
            inline fn impl(i: usize) f64 {
                return 1.0 / linear(i);
            }
        }.impl;

        var t_elems: [10 * 10]f64 = undefined;
        var t_inverse_elems: [10 * 10]f64 = undefined;

        var t: SquareMatrix10 = try .initDiagonalMatrix(&t_elems, linear, null);
        try testing.expect(t.isValid());

        var t_inverse = try t.inverse(heap.page_allocator);
        try testing.expect(t_inverse.isValid());

        defer t_inverse.destroy(heap.page_allocator);

        const t_inverse_expected: SquareMatrix10 = try .initDiagonalMatrix(&t_inverse_elems, linear_recp, null);
        try testing.expect(t_inverse_expected.isValid());

        try testing.expectEqualSlices(f64, t_inverse_expected.elements, t_inverse.elements);
    }

    {
        var singular_elems: SquareMatrix2.SizedElements = .{
            1, 2,
            2, 4,
        };

        var t: SquareMatrix2 = try .init(&singular_elems, null);
        try testing.expect(t.isValid());

        _ = t.inverse(heap.page_allocator) catch |err|
            try testing.expectEqual(TensorError.SingularMatrix, err);
    }
}

test "Tensor trace" {
    var elems: SquareMatrix10.SizedElements = .{
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 2, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 3, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 4, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 5, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 6, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 7, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 8, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 9, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 10,
    };

    var t: SquareMatrix10 = try .init(&elems, null);

    try testing.expectEqual(1 + 2 + 3 + 4 + 5 + 6 + 7 + 8 + 9 + 10, try t.trace());
}

const Vector5 = Tensor(f64, 1, .row, .{5});

test "Tensor Norm and Normalize" {
    {
        var components: Vector5.SizedElements = .{ 1, 2, 3, 4, 5 };
        var t: Vector5 = try .init(&components, null);

        const expected_norm = @sqrt(55.0);
        const t_norm = try t.norm();
        try testing.expectApproxEqAbs(expected_norm, t_norm, math.floatEps(f64));

        var normalized = try t.normalize(heap.page_allocator);
        defer normalized.destroy(heap.page_allocator);

        const norm = try t.norm();
        inline for (0..5) |i| {
            const expected = components[i] / norm;

            try testing.expectApproxEqAbs(expected, normalized.get(.{i}), math.floatEps(f64));
        }

        const normalized_norm = try normalized.norm();
        try testing.expectApproxEqAbs(1, normalized_norm, math.floatEps(f64));
    }

    {
        var zero_components: Vector5.SizedElements = .{ 0, 0, 0, 0, 0 };
        var t: Vector5 = try .init(&zero_components, null);

        try testing.expectEqual(0, try t.norm());

        _ = t.normalize(heap.page_allocator) catch |err|
            try testing.expect(err == TensorError.NormalizeZeroVector);
    }
}

test "Diagonal Continuous Matrix" {
    const identity = struct {
        inline fn impl(i: usize) f64 {
            return i;
        }
    }.impl;

    var elems: [9]f64 = undefined;

    var t: Tensor(f64, 2, .row, @splat(3)) = try .initDiagonalMatrix(&elems, identity, null);

    try testing.expectEqual(0, t.get(comptime @splat(0)));
    try testing.expectEqual(1, t.get(comptime @splat(1)));
    try testing.expectEqual(2, t.get(comptime @splat(2)));
}
