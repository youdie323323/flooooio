import { TWO_PI } from "../constants";

const EASING_FUNCTIONS: {
    [key: string]: (...args: number[]) => number
} = {};
const F = 3 / 40 * (3 + Math.cbrt(1187 - Math.sqrt(110) * 80) + Math.cbrt(1187 + Math.sqrt(110) * 80));
function r(elapsed: number, p: number, B: number, u: number) {
    return B * (elapsed / u) + p;
}
EASING_FUNCTIONS.easeLinear = r;
function P(elapsed: number, p: number, B: number, u: number) {
    return B * (elapsed /= u) * elapsed + p;
}
EASING_FUNCTIONS.easeInQuad = P;
function M(elapsed: number, p: number, B: number, u: number) {
    return -B * (elapsed /= u) * (elapsed - 2) + p;
}
EASING_FUNCTIONS.easeOutQuad = M;
function I(elapsed: number, p: number, B: number, u: number) {
    if ((elapsed /= u / 2) < 1) {
        return B / 2 * elapsed * elapsed + p;
    }
    return -B / 2 * (--elapsed * (elapsed - 2) - 1) + p;
}
EASING_FUNCTIONS.easeInOutQuad = I;
function Q(elapsed: number, p: number, B: number, u: number) {
    return B * (elapsed /= u) * elapsed * elapsed + p;
}
EASING_FUNCTIONS.easeInCubic = Q;
function D(elapsed: number, p: number, B: number, u: number) {
    return B * ((elapsed = elapsed / u - 1) * elapsed * elapsed + 1) + p;
}
EASING_FUNCTIONS.easeOutCubic = D;
function H(elapsed: number, p: number, B: number, u: number) {
    if ((elapsed /= u / 2) < 1) {
        return B / 2 * elapsed * elapsed * elapsed + p;
    }
    return B / 2 * ((elapsed -= 2) * elapsed * elapsed + 2) + p;
}
EASING_FUNCTIONS.easeInOutCubic = H;
function g(elapsed: number, p: number, B: number, u: number) {
    return B * (elapsed /= u) * elapsed * elapsed * elapsed + p;
}
EASING_FUNCTIONS.easeInQuart = g;
function o(elapsed: number, p: number, B: number, u: number) {
    return -B * ((elapsed = elapsed / u - 1) * elapsed * elapsed * elapsed - 1) + p;
}
EASING_FUNCTIONS.easeOutQuart = o;
function l(elapsed: number, p: number, B: number, u: number) {
    if ((elapsed /= u / 2) < 1) {
        return B / 2 * elapsed * elapsed * elapsed * elapsed + p;
    }
    return -B / 2 * ((elapsed -= 2) * elapsed * elapsed * elapsed - 2) + p;
}
EASING_FUNCTIONS.easeInOutQuart = l;
function G(elapsed: number, p: number, B: number, u: number) {
    return B * (elapsed /= u) * elapsed * elapsed * elapsed * elapsed + p;
}
EASING_FUNCTIONS.easeInQuint = G;
function c(elapsed: number, p: number, B: number, u: number) {
    return B * ((elapsed = elapsed / u - 1) * elapsed * elapsed * elapsed * elapsed + 1) + p;
}
EASING_FUNCTIONS.easeOutQuint = c;
function N(elapsed: number, p: number, B: number, u: number) {
    if ((elapsed /= u / 2) < 1) {
        return B / 2 * elapsed * elapsed * elapsed * elapsed * elapsed + p;
    }
    return B / 2 * ((elapsed -= 2) * elapsed * elapsed * elapsed * elapsed + 2) + p;
}
EASING_FUNCTIONS.easeInOutQuint = N;
function E(elapsed: number, p: any, B: number, u: number) {
    return -B * Math.cos(elapsed / u * (Math.PI / 2)) + B + p;
}
EASING_FUNCTIONS.easeInSine = E;
function W(elapsed: number, p: number, B: number, u: number) {
    return B * Math.sin(elapsed / u * (Math.PI / 2)) + p;
}
EASING_FUNCTIONS.easeOutSine = W;
function S(elapsed: number, p: number, B: number, u: number) {
    return -B / 2 * (Math.cos(Math.PI * elapsed / u) - 1) + p;
}
EASING_FUNCTIONS.easeInOutSine = S;
function b(elapsed: number, p: number, B: number, u: number) {
    if (elapsed === 0) {
        return p;
    }
    return B * 2 ** ((elapsed / u - 1) * 10) + p;
}
EASING_FUNCTIONS.easeInExpo = b;
function easeOutExpo(elapsed: number, p: number, B: number, u: number) {
    if (elapsed === u) {
        return p + B;
    }
    return B * (-(2 ** (elapsed * -10 / u)) + 1) + p;
}
EASING_FUNCTIONS.easeOutExpo = easeOutExpo;
function m(elapsed: number, p: number, B: number, u: number) {
    if (elapsed === 0) {
        return p;
    }
    if (elapsed === u) {
        return p + B;
    }
    if ((elapsed /= u / 2) < 1) {
        return B / 2 * 2 ** ((elapsed - 1) * 10) + p;
    }
    return B / 2 * (-(2 ** (--elapsed * -10)) + 2) + p;
}
EASING_FUNCTIONS.easeInOutExpo = m;
function O(elapsed: number, p: number, B: number, u: number) {
    return -B * (Math.sqrt(1 - (elapsed /= u) * elapsed) - 1) + p;
}
EASING_FUNCTIONS.easeInCirc = O;
function k(elapsed: number, p: number, B: number, u: number) {
    return B * Math.sqrt(1 - (elapsed = elapsed / u - 1) * elapsed) + p;
}
EASING_FUNCTIONS.easeOutCirc = k;
function j(elapsed: number, p: number, B: number, u: number) {
    if ((elapsed /= u / 2) < 1) {
        return -B / 2 * (Math.sqrt(1 - elapsed * elapsed) - 1) + p;
    }
    return B / 2 * (Math.sqrt(1 - (elapsed -= 2) * elapsed) + 1) + p;
}
EASING_FUNCTIONS.easeInOutCirc = j;
function v(elapsed: number, B: number, u: number, z: number) {
    let _a = F;
    let V = 0;
    if (elapsed === 0) {
        return B;
    }
    if ((elapsed /= z) === 1) {
        return B + u;
    }
    if (!V) {
        V = z * 0.3;
    }
    if (u < Math.abs(u)) {
        u = u;
        _a = V / 4;
    } else {
        _a = V / TWO_PI * Math.asin(u / u);
    }
    return -(u * 2 ** ((elapsed -= 1) * 10) * Math.sin((elapsed * z - _a) * TWO_PI / V)) + B;
}
EASING_FUNCTIONS.easeInElastic = v;
function K(elapsed: number, B: any, u: number, z: number) {
    let U = F;
    let a = 0;
    if (elapsed === 0) {
        return B;
    }
    if ((elapsed /= z) === 1) {
        return B + u;
    }
    if (!a) {
        a = z * 0.3;
    }
    if (u < Math.abs(u)) {
        u = u;
        U = a / 4;
    } else {
        U = a / TWO_PI * Math.asin(u / u);
    }
    return u * 2 ** (elapsed * -10) * Math.sin((elapsed * z - U) * TWO_PI / a) + u + B;
}
EASING_FUNCTIONS.easeOutElastic = K;
function Y(elapsed: number, B: number, u: number, z: number) {
    let U = F;
    let a = 0;
    if (elapsed === 0) {
        return B;
    }
    if ((elapsed /= z / 2) === 2) {
        return B + u;
    }
    if (!a) {
        a = z * 0.44999999999999996;
    }
    if (u < Math.abs(u)) {
        u = u;
        U = a / 4;
    } else {
        U = a / TWO_PI * Math.asin(u / u);
    }
    if (elapsed < 1) {
        return u * 2 ** ((elapsed -= 1) * 10) * Math.sin((elapsed * z - U) * TWO_PI / a) * -0.5 + B;
    }
    return u * 2 ** ((elapsed -= 1) * -10) * Math.sin((elapsed * z - U) * TWO_PI / a) * 0.5 + u + B;
}
EASING_FUNCTIONS.easeInOutElastic = Y;
function T(elapsed: number, p: number, B: number, u: number, z = F) {
    return B * (elapsed /= u) * elapsed * ((z + 1) * elapsed - z) + p;
}
EASING_FUNCTIONS.easeInBack = T;
function J(elapsed: number, p: number, B: number, u: number, z = F) {
    return B * ((elapsed = elapsed / u - 1) * elapsed * ((z + 1) * elapsed + z) + 1) + p;
}
EASING_FUNCTIONS.easeOutBack = J;
function e(elapsed: number, p: number, B: number, u: number, z = F) {
    if ((elapsed /= u / 2) < 1) {
        return B / 2 * (elapsed * elapsed * (((z *= 1.525) + 1) * elapsed - z)) + p;
    }
    return B / 2 * ((elapsed -= 2) * elapsed * (((z *= 1.525) + 1) * elapsed + z) + 2) + p;
}
EASING_FUNCTIONS.easeInOutBack = e;
function q(elapsed: number, p: number, B: number, u: number) {
    return B - h(u - elapsed, 0, B, u) + p;
}
EASING_FUNCTIONS.easeInBounce = q;
function h(elapsed: number, p: number, B: number, u: number) {
    if ((elapsed /= u) < 1 / 2.75) {
        return B * (elapsed ** 2 * 7.5625) + p;
    } else if (elapsed < 2 / 2.75) {
        return B * ((elapsed -= 1.5 / 2.75) * 7.5625 * elapsed + 0.75) + p;
    } else if (elapsed < 2.5 / 2.75) {
        return B * ((elapsed -= 2.25 / 2.75) * 7.5625 * elapsed + 0.9375) + p;
    } else {
        return B * ((elapsed -= 2.625 / 2.75) * 7.5625 * elapsed + 0.984375) + p;
    }
}
EASING_FUNCTIONS.easeOutBounce = h;
function w(elapsed: number, p: number, B: number, u: number) {
    if (elapsed < u / 2) {
        return q(elapsed * 2, 0, B, u) * 0.5 + p;
    }
    return h(elapsed * 2 - u, 0, B, u) * 0.5 + B * 0.5 + p;
}
EASING_FUNCTIONS.easeInOutBounce = w;
export default EASING_FUNCTIONS;