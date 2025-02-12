export type WaveRoomCode = string & { __brand: "WaveRoomCode" };

/**
 * Returns a random hexadecimal string.
 *
 * @example getRandomHexString(6) "ca96bf"
 * @param length - Length of random hex string.
 * @returns Random hex string.
 */
function getRandomHexString(length: number) {
    return [...Array(length)]
        .map(() => Math.floor(Math.random() * 16).toString(16))
        .join("");
}

function getRandomLowercaseAlphabet(length: number) {
    return [...Array(length)]
        .map(() => String.fromCharCode(97 + Math.floor(26 * Math.random())))
        .join("");
}

export function generateRandomWaveRoomCode(): WaveRoomCode {
    // XXX-XXXXXX
    // First three character is uid of server
    return (getRandomHexString(3) + "-" + getRandomLowercaseAlphabet(6)) as WaveRoomCode;
}

export function isWaveRoomCode(maybeCode: string): maybeCode is WaveRoomCode {
    if (maybeCode.length !== 10) return false;
    if (maybeCode[3] !== '-') return false;

    const [prefix, suffix] = maybeCode.split('-');
    
    // Check if prefix is valid hex (3 characters)
    if (prefix.length !== 3 || !/^[0-9a-f]{3}$/.test(prefix)) return false;
    
    // Check if suffix is valid lowercase letters (6 characters)
    if (suffix.length !== 6 || !/^[a-z]{6}$/.test(suffix)) return false;
    
    return true;
}