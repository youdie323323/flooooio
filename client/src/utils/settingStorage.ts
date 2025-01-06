const LOCAL_STORAGE_HEAD_ID = "floooio_"

export function isSettingTrue(key: string): boolean {
    const item = localStorage.getItem(LOCAL_STORAGE_HEAD_ID + key);
    if (item) {
        return item === "Y";
    } else {
        localStorage.setItem(LOCAL_STORAGE_HEAD_ID + key, "N");
        return false;
    }
}

export function setSetting(key: string, value: boolean) {
    localStorage.setItem(LOCAL_STORAGE_HEAD_ID + key, boolToSettingBool(value));
}

function boolToSettingBool(bool: boolean) {
    return bool ? "Y" : "N";
}