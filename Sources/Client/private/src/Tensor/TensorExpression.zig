//! Provides Expression Parsing for Einsum style string expressions.
//!
//! Currently, the expression parser does not tolerate
//! whitespace in expressions. This will be reviewed
//! at a later date, but currently is not required to
//! create well-formed strings.
//!
//! parser utility functions. These functions are intended
//! to be executed at comptime.

const std = @import("std");
const testing = std.testing;
const ascii = std.ascii;
const mem = std.mem;
const math = std.math;

const Sizes = @import("TensorLayout.zig").Sizes;
const Rank = @import("TensorLayout.zig").Rank;

/// String notation for tensor expressions.
pub const Expression = []const u8;

pub fn isStringFullyAlphabetic(comptime str: []const u8) bool {
    comptime {
        return for (str) |c| {
            if (!ascii.isAlphabetic(c))
                break false;
        } else true;
    }
}

pub fn containsChar(comptime char: u8, comptime str: []const u8) bool {
    comptime {
        return mem.indexOfScalar(u8, str, char) != null;
    }
}

/// Check that a permutation is both full and accounted for.
pub fn isPermutation(comptime src: []const u8, comptime target: []const u8) bool {
    comptime {
        if (src.len != target.len)
            return false;

        if (src.len == 0) // The empty set is a permutation of itself
            return true;

        // Create mask for proper permutation
        const full: comptime_int = (1 << src.len) - 1;

        var i_mask: comptime_int = 0;
        var j_mask: comptime_int = 0;

        for (src, 0..) |c, i| {
            for (target, 0..) |c_inner, j| {
                if (c == c_inner) {
                    i_mask |= (1 << i);
                    j_mask |= (1 << j);
                }
            }
        }

        return i_mask == j_mask and i_mask == full;
    }
}

pub fn countUniqueAlphabetics(comptime str: []const u8) comptime_int {
    comptime {
        var n: usize = 0;

        for (str) |c| {
            if (ascii.isAlphabetic(c))
                n |= (1 << (c - 'A'));
        }

        return @popCount(n);
    }
}

pub fn uniqueAlphabetics(comptime str: []const u8) [countUniqueAlphabetics(str)]u8 {
    comptime {
        const n = countUniqueAlphabetics(str);

        var chars: [n]u8 = @splat(0);

        var i: comptime_int = 0;

        for (str) |c| {
            if (ascii.isAlphabetic(c) and !containsChar(c, &chars)) {
                chars[i] = c;

                i += 1;
            }
        }

        return chars;
    }
}

/// Template arrow operation for index.
const arrow_op: []const u8 = "->";

pub fn indexOfArrowOp(comptime expr: Expression) comptime_int {
    return comptime std.mem.indexOf(u8, expr, arrow_op) orelse
        @compileError("Arrow must be used as infix operator: " ++ expr);
}

/// Template comma operation for index.
const comma_op: []const u8 = ",";

pub fn indexOfCommaOp(comptime expr: Expression) comptime_int {
    return comptime std.mem.indexOfScalar(u8, expr, comma_op[0]) orelse
        @compileError("Comma must be used as infix operator: " ++ expr);
}

pub fn parsePermutateExpession(
    comptime rank: Rank,
    comptime expr: Expression,
) Sizes(rank) {
    comptime {
        const i_arrow = indexOfArrowOp(expr);

        const lhs = expr[0..i_arrow];
        const rhs = expr[i_arrow + arrow_op.len ..];

        if (lhs.len != rank)
            @compileError("Left operand is not equal to the rank: " ++ lhs);

        if (rhs.len != rank)
            @compileError("Right operand is not equal to the rank: " ++ rhs);

        if (!isStringFullyAlphabetic(lhs))
            @compileError("Non-alphabetical character found in: " ++ lhs);

        if (!isStringFullyAlphabetic(rhs))
            @compileError("Non-alphabetical character found in: " ++ rhs);

        if (!isPermutation(lhs, rhs))
            @compileError("Permutate requires left and right operands to be permutations of eachother: " ++ expr);

        // Build permutation contraction indices

        var indices: Sizes(rank) = undefined;

        for (0..rank) |i| {
            for (0..rank) |j| {
                if (rhs[i] == lhs[j]) {
                    indices[i] = j;

                    break;
                }
            }
        }

        return indices;
    }
}

// Contraction parsing is expects strings of the form:
//
//     example: ijk->jk
//
// The expressions must be larger on the left-operand than
// the right operand (denoting contracted indices).
//
// The left and right operands must be alpha-characters.

pub fn contractedRank(comptime expr: Expression) comptime_int {
    return comptime ((expr.len - indexOfArrowOp(expr)) - 1);
}

pub fn ContractionPlan(
    comptime l_rank: Rank,
    comptime r_rank: Rank,
) type {
    return struct {
        lhs: [l_rank]comptime_int,
        rhs: [r_rank]comptime_int,
    };
}

pub fn parseContractionExpression(
    comptime l_rank: Rank,
    comptime r_rank: Rank,
    comptime expr: Expression,
) ContractionPlan(l_rank, r_rank) {
    comptime {
        const i_arrow = indexOfArrowOp(expr);

        const lhs = expr[0..i_arrow];
        const rhs = expr[i_arrow + arrow_op.len ..];

        if (lhs.len == 0)
            @compileError("Empty left-side operand: " ++ expr);

        if (rhs.len == 0)
            @compileError("Empty right-side operand: " ++ expr);

        if (lhs.len != l_rank)
            @compileError("Provided indices do not match left-side operand rank: " ++ lhs);

        if (rhs.len != r_rank)
            @compileError("Provided indices do not match right-side operand rank: " ++ rhs);

        if (!isStringFullyAlphabetic(lhs))
            @compileError("Non-alphabetical character found in: " ++ lhs);

        if (!isStringFullyAlphabetic(rhs))
            @compileError("Non-alphabetical character found in: " ++ rhs);

        // Build permutation contraction indices

        var x_indices: [lhs.len]comptime_int = undefined;
        var y_indices: [rhs.len]comptime_int = undefined;

        var remainder: [lhs.len + rhs.len]comptime_int = undefined;

        var match: comptime_int = 0;

        var i_rem: comptime_int = 0;

        var found: bool = false;

        for (lhs, 0..) |c, i| {
            // matched + unmatched = total
            if (match == rhs.len and i_rem == remainder.len)
                break;

            found = false;

            // Try to match the current char
            // in both rhs and lhs operands

            for (rhs, 0..) |c_inner, j| {
                if (c_inner == c) {
                    x_indices[match] = i;
                    y_indices[match] = j;

                    found = true;

                    match += 1;

                    break;
                }
            }

            // If no match, add to remainder

            if (!found) {
                remainder[i_rem] = i;

                i_rem += 1;
            }
        }

        if (match != rhs.len)
            @compileError("Unmatched dimensions between operands: " ++ expr);

        i_rem = 0;

        for (rhs.len..lhs.len) |i| {
            x_indices[i] = remainder[i_rem];

            i_rem += 1;
        }

        return .{ .lhs = x_indices, .rhs = y_indices };
    }
}

/// Placeholder value that notify value in array has not modified.
/// This should not collide with other values.
pub const pass_flag = 0xDEADBEEF;

pub fn InnerProductPlan(comptime n: comptime_int) type {
    return struct {
        comptime total: comptime_int = n,

        x_perm: [n]comptime_int = @splat(pass_flag),
        y_perm: [n]comptime_int = @splat(pass_flag),
        z_perm: [n]comptime_int = @splat(pass_flag),
        s_ctrl: [n]comptime_int = @splat(pass_flag),
    };
}

pub fn parseInnerProductExpression(
    comptime x_rank: Rank,
    comptime y_rank: Rank,
    comptime z_rank: Rank,
    comptime expr: Expression,
) InnerProductPlan(countUniqueAlphabetics(expr)) {
    comptime {
        const i_arrow = indexOfArrowOp(expr);
        const i_comma = indexOfCommaOp(expr);

        if (i_comma >= (i_arrow - 1))
            @compileError("Comma operator must come before left operand: " ++ expr);

        const lhs = expr[0..i_comma];
        const rhs = expr[i_comma + comma_op.len .. i_arrow];
        const out = expr[i_arrow + arrow_op.len ..];

        if (lhs.len == 0)
            @compileError("Empty left-side operand: " ++ expr);

        if (rhs.len == 0)
            @compileError("Empty right-side operand: " ++ expr);

        if (out.len == 0)
            @compileError("Empty expression result: " ++ expr);

        if (lhs.len != x_rank)
            @compileError("Provided indices do not match left-side operand rank: " ++ lhs);

        if (rhs.len != y_rank)
            @compileError("Provided indices do not match right-side operand rank: " ++ rhs);

        if (out.len != z_rank)
            @compileError("Provided indices do not match result rank: " ++ out);

        if (!isStringFullyAlphabetic(lhs))
            @compileError("Non-alphabetical character found in: " ++ lhs);

        if (!isStringFullyAlphabetic(rhs))
            @compileError("Non-alphabetical character found in: " ++ rhs);

        if (!isStringFullyAlphabetic(out))
            @compileError("Non-alphabetical character found in: " ++ out);

        // Build inner product control indices

        var plan: InnerProductPlan(countUniqueAlphabetics(expr)) = .{};

        const chars = uniqueAlphabetics(expr);

        for (chars, 0..) |c, i| {
            for (lhs, 0..) |c_inner, j| {
                if (c_inner == c) {
                    plan.x_perm[i] = j;

                    plan.s_ctrl[i] = 0;
                }
            }

            for (rhs, 0..) |c_inner, j| {
                if (c_inner == c) {
                    plan.y_perm[i] = j;

                    plan.s_ctrl[i] = 1;
                }
            }

            for (out, 0..) |c_inner, j| {
                if (c_inner == c) {
                    plan.z_perm[i] = j;
                }
            }
        }

        return plan;
    }
}

pub fn OuterProductPlan(comptime n: comptime_int) type {
    return struct {
        comptime total: comptime_int = n,

        x_perm: [n]comptime_int = @splat(pass_flag),
        y_perm: [n]comptime_int = @splat(pass_flag),
        z_perm: [n]comptime_int = @splat(pass_flag),
    };
}

pub fn parseOuterProductExpression(
    comptime x_rank: Rank,
    comptime y_rank: Rank,
    comptime z_rank: Rank,
    comptime expr: Expression,
) OuterProductPlan(countUniqueAlphabetics(expr)) {
    comptime {
        const i_arrow = indexOfArrowOp(expr);
        const i_comma = indexOfCommaOp(expr);

        if (i_comma >= (i_arrow - 1))
            @compileError("Comma operator must come before left operand: " ++ expr);

        const lhs = expr[0..i_comma];
        const rhs = expr[i_comma + comma_op.len .. i_arrow];
        const out = expr[i_arrow + arrow_op.len ..];

        if (lhs.len == 0)
            @compileError("Empty left-side operand: " ++ expr);

        if (rhs.len == 0)
            @compileError("Empty right-side operand: " ++ expr);

        if (out.len == 0)
            @compileError("Empty expression result: " ++ expr);

        if (lhs.len != x_rank)
            @compileError("Provided indices do not match left-side operand rank: " ++ lhs);

        if (rhs.len != y_rank)
            @compileError("Provided indices do not match right-side operand rank: " ++ rhs);

        if (out.len != z_rank)
            @compileError("Provided indices do not match result rank: " ++ out);

        if (!isStringFullyAlphabetic(lhs))
            @compileError("Non-alphabetical character found in: " ++ lhs);

        if (!isStringFullyAlphabetic(rhs))
            @compileError("Non-alphabetical character found in: " ++ rhs);

        if (!isStringFullyAlphabetic(out))
            @compileError("Non-alphabetical character found in: " ++ out);

        // Build inner product control indices

        var plan: OuterProductPlan(countUniqueAlphabetics(expr)) = .{};

        const chars = uniqueAlphabetics(expr);

        for (chars, 0..) |c, i| {
            for (lhs, 0..) |c_inner, j| {
                if (c_inner == c) {
                    plan.x_perm[i] = j;
                }
            }

            for (rhs, 0..) |c_inner, j| {
                if (c_inner == c) {
                    plan.y_perm[i] = j;
                }
            }

            for (out, 0..) |c_inner, j| {
                if (c_inner == c) {
                    plan.z_perm[i] = j;
                }
            }
        }

        return plan;
    }
}

test isStringFullyAlphabetic {
    try testing.expect(comptime isStringFullyAlphabetic("abc"));
    try testing.expect(comptime isStringFullyAlphabetic("ABC"));
    try testing.expect(comptime isStringFullyAlphabetic("aAbBcC"));
    try testing.expect(comptime !isStringFullyAlphabetic("abc123"));
    try testing.expect(comptime !isStringFullyAlphabetic("abc!"));
    try testing.expect(comptime !isStringFullyAlphabetic("abc "));
}

test containsChar {
    try testing.expect(comptime containsChar('a', "abc"));
    try testing.expect(comptime containsChar('b', "abc"));
    try testing.expect(comptime !containsChar('x', "abc"));
    try testing.expect(comptime !containsChar('1', "abc"));
}

test isPermutation {
    try testing.expect(comptime isPermutation("abc", "bca"));
    try testing.expect(comptime isPermutation("ABC", "CAB"));
    try testing.expect(comptime !isPermutation("abc", "abd"));
    try testing.expect(comptime !isPermutation("abc", "ab"));
    try testing.expect(comptime isPermutation("", ""));
}

test countUniqueAlphabetics {
    try testing.expectEqual(3, comptime countUniqueAlphabetics("abc"));
    try testing.expectEqual(3, comptime countUniqueAlphabetics("aabbcc"));
    try testing.expectEqual(2, comptime countUniqueAlphabetics("aabb22"));
    try testing.expectEqual(0, comptime countUniqueAlphabetics("123"));
}

test uniqueAlphabetics {
    try testing.expectEqualSlices(u8, "abc", comptime &uniqueAlphabetics("abcabc"));
    try testing.expectEqualSlices(u8, "AB", comptime &uniqueAlphabetics("AABB12"));
}

test parsePermutateExpession {
    const result = comptime parsePermutateExpession(3, "abc->bca");

    try testing.expectEqual(
        @TypeOf(result){ 1, 2, 0 },
        result,
    );
}

test parseContractionExpression {
    const result = comptime parseContractionExpression(3, 2, "abc->bc");

    try testing.expectEqual(
        @TypeOf(result){
            .lhs = .{ 1, 2, 0 },
            .rhs = .{ 0, 1 },
        },
        result,
    );
}

test parseInnerProductExpression {
    const result = comptime parseInnerProductExpression(2, 2, 2, "ij,jk->ik");

    try testing.expect(result.total == 3);

    try testing.expectEqual(0, result.x_perm[0]);
    try testing.expectEqual(pass_flag, result.y_perm[0]);
    try testing.expectEqual(0, result.z_perm[0]);

    try testing.expectEqual(1, result.x_perm[1]);
    try testing.expectEqual(0, result.y_perm[1]);
    try testing.expectEqual(pass_flag, result.z_perm[1]);

    try testing.expectEqual(pass_flag, result.x_perm[2]);
    try testing.expectEqual(1, result.y_perm[2]);
    try testing.expectEqual(1, result.z_perm[2]);
}

test parseOuterProductExpression {
    const result = comptime parseOuterProductExpression(2, 2, 4, "ij,kl->ijkl");

    try testing.expect(result.total == 4);

    try testing.expectEqual(0, result.x_perm[0]);
    try testing.expectEqual(1, result.x_perm[1]);
    try testing.expectEqual(0, result.y_perm[2]);
    try testing.expectEqual(1, result.y_perm[3]);
}
