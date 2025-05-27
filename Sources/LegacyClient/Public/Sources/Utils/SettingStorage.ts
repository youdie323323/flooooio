export type FlooooIoDefaultSettingKeys =
    | "keyboard_control"
    | "movement_helper";

export default class SettingStorage {
    private static readonly PREFIX = "flooooio_" as const;
    private static readonly DEFAULT_SETTINGS = {
        keyboard_control: false,
        movement_helper: false,
    } as const satisfies Record<FlooooIoDefaultSettingKeys, boolean>;

    private static getFullKey(key: FlooooIoDefaultSettingKeys): string {
        return this.PREFIX + key;
    }

    private static boolToSettingValue(value: boolean): string {
        return value ? "Y" : "N";
    }

    private static settingValueToBool(value: string): boolean {
        return value === "Y";
    }

    public static get(key: FlooooIoDefaultSettingKeys): boolean {
        const fullKey = this.getFullKey(key);
        const value = localStorage.getItem(fullKey);

        if (value === null) {
            this.set(key, false);

            return false;
        }

        return this.settingValueToBool(value);
    }

    public static set(key: FlooooIoDefaultSettingKeys, value: boolean): void {
        const fullKey = this.getFullKey(key);

        localStorage.setItem(fullKey, this.boolToSettingValue(value));
    }

    public static remove(key: FlooooIoDefaultSettingKeys): void {
        const fullKey = this.getFullKey(key);

        localStorage.removeItem(fullKey);
    }

    public static clear(): void {
        Object.keys(localStorage)
            .filter(key => key.startsWith(this.PREFIX))
            .forEach(key => localStorage.removeItem(key));
    }

    public static getAllSettings(): Record<FlooooIoDefaultSettingKeys, boolean> {
        return Object.keys(localStorage)
            .filter(key => key.startsWith(this.PREFIX))
            .reduce((acc, key) => ({
                ...acc,

                [key.replace(this.PREFIX, "")]: this.settingValueToBool(localStorage.getItem(key)),
            }), SettingStorage.DEFAULT_SETTINGS);
    }
}