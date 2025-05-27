type ServerIdentifier = string & { length: 3 };
type MeaninglessIdentifier = string & { length: 6 };

// XXX-XXXXXX
export type WaveRoomCode = `${ServerIdentifier}-${MeaninglessIdentifier}`;

function generateRandomServerIdentifier(): ServerIdentifier {
    return [...Array(3)]
        .map(() => Math.floor(Math.random() * 16).toString(16))
        .join("") as ServerIdentifier;
}

function generateRandomMeaninglessIdentifier(): MeaninglessIdentifier {
    return [...Array(6)]
        .map(() => String.fromCharCode(97 + Math.floor(26 * Math.random())))
        .join("") as MeaninglessIdentifier;
}

export function generateRandomWaveRoomCode(): WaveRoomCode {
    const serverPart = generateRandomServerIdentifier();
    const meaninglessPart = generateRandomMeaninglessIdentifier();

    return `${serverPart}-${meaninglessPart}` satisfies WaveRoomCode;
}

export function isWaveRoomCode(maybeCode: string): maybeCode is WaveRoomCode {
    if (maybeCode.length !== 10) return false;
    if (maybeCode[3] !== "-") return false;

    const [prefix, suffix] = maybeCode.split("-");

    // Check if prefix is valid hex (3 characters)
    if (prefix.length !== 3 || !/^[0-9a-f]{3}$/.test(prefix)) return false;

    // Check if suffix is valid lowercase letters (6 characters)
    if (suffix.length !== 6 || !/^[a-z]{6}$/.test(suffix)) return false;

    return true;
}
