import type { LayoutResult } from "./Layout";
const LRUMap = require("mnemonist/lru-map");

export default class LayoutCache {
    private cache = new LRUMap(64);

    public get(key: string): LayoutResult | null {
        return this.cache.get(key);
    }

    public set(key: string, value: LayoutResult) {
        this.cache.set(key, value);
    }

    public invalidate() {
        this.cache.clear();
    }
}