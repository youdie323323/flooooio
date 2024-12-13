import { LayoutResult } from "./Layout";

export default class LayoutCache {
    private cache: Map<string, LayoutResult> = new Map();
    private isDirty: Map<string, boolean> = new Map();

    constructor() {
        this.clear();
    }

    clear() {
        this.cache.clear();
        this.isDirty.clear();
    }

    get(key: string): LayoutResult | undefined {
        return this.cache.get(key);
    }

    set(key: string, value: LayoutResult) {
        this.cache.set(key, value);
        this.isDirty.set(key, false);
    }

    invalidate() {
        this.isDirty.clear();
    }

    isDirtyCache(key: string): boolean {
        if (!this.isDirty.has(key)) {
            this.isDirty.set(key, true);
            return true;
        }

        return this.isDirty.get(key) || false;
    }
}