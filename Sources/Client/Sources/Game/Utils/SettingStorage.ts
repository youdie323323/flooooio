export default class SettingStorage {
    private static readonly prefix: string = "flooooio_";

    private static getFullKey(key: string): string {
        return this.prefix + key;
    }

    private static boolToSettingValue(value: boolean): string {
        return value ? "Y" : "N";
    }

    private static settingValueToBool(value: string | null): boolean {
        return value === "Y";
    }

    public static get(key: string): boolean {
        const fullKey = this.getFullKey(key);
        const value = localStorage.getItem(fullKey);
        
        if (value === null) {
            this.set(key, false);

            return false;
        }
        
        return this.settingValueToBool(value);
    }

    public static set(key: string, value: boolean): void {
        const fullKey = this.getFullKey(key);
        localStorage.setItem(fullKey, this.boolToSettingValue(value));
    }

    public static remove(key: string): void {
        const fullKey = this.getFullKey(key);
        localStorage.removeItem(fullKey);
    }

    public static clear(): void {
        Object.keys(localStorage)
            .filter(key => key.startsWith(this.prefix))
            .forEach(key => localStorage.removeItem(key));
    }

    public static getAllSettings(): Record<string, boolean> {
        return Object.keys(localStorage)
            .filter(key => key.startsWith(this.prefix))
            .reduce((acc, key) => ({
                ...acc,
                [key.replace(this.prefix, "")]: this.settingValueToBool(localStorage.getItem(key)),
            }), {});
    }
}