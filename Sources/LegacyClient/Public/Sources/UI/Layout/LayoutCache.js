"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const LRUMap = require("mnemonist/lru-map");
class LayoutCache {
    constructor() {
        this.cache = new LRUMap(64);
    }
    get(key) {
        return this.cache.get(key);
    }
    set(key, value) {
        this.cache.set(key, value);
    }
    invalidate() {
        this.cache.clear();
    }
}
exports.default = LayoutCache;
