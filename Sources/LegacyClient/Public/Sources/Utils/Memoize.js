"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultHash = defaultHash;
exports.memo = memo;
function defaultHash(...args) {
    // JSON.stringify ellides `undefined` and function values by default, we do not want that
    return JSON.stringify(args, (_, v) => (typeof v === "object" ? v : String(v)));
}
function memo(fn, opts = {}) {
    const { hash = defaultHash, cache = new Map() } = opts;
    return function (...args) {
        const id = hash.apply(this, args);
        if (cache.has(id))
            return cache.get(id);
        let result = fn.apply(this, args);
        if (result instanceof Promise) {
            result = result.catch(error => {
                cache.delete(id);
                throw error;
            });
        }
        cache.set(id, result);
        return result;
    };
}
