"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SettingStorage {
    static { this.PREFIX = "flooooio_"; }
    static { this.DEFAULT_SETTINGS = {
        keyboard_control: false,
        movement_helper: false,
    }; }
    static getFullKey(key) {
        return this.PREFIX + key;
    }
    static boolToSettingValue(value) {
        return value ? "Y" : "N";
    }
    static settingValueToBool(value) {
        return value === "Y";
    }
    static get(key) {
        const fullKey = this.getFullKey(key);
        const value = localStorage.getItem(fullKey);
        if (value === null) {
            this.set(key, false);
            return false;
        }
        return this.settingValueToBool(value);
    }
    static set(key, value) {
        const fullKey = this.getFullKey(key);
        localStorage.setItem(fullKey, this.boolToSettingValue(value));
    }
    static remove(key) {
        const fullKey = this.getFullKey(key);
        localStorage.removeItem(fullKey);
    }
    static clear() {
        Object.keys(localStorage)
            .filter(key => key.startsWith(this.PREFIX))
            .forEach(key => localStorage.removeItem(key));
    }
    static getAllSettings() {
        return Object.keys(localStorage)
            .filter(key => key.startsWith(this.PREFIX))
            .reduce((acc, key) => ({
            ...acc,
            [key.replace(this.PREFIX, "")]: this.settingValueToBool(localStorage.getItem(key)),
        }), SettingStorage.DEFAULT_SETTINGS);
    }
}
exports.default = SettingStorage;
