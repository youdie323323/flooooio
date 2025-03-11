const TAU = Math.PI * 2;

function generateSinWaveTable(sampleRate: number) {
    const samples = new Array(sampleRate);

    for (let i = 0; i < sampleRate; i++) {
        const y = Math.sin((i / sampleRate) * TAU);

        samples[i] = y;
    }

    return samples;
}

export default class SinusodialWave {
    private static table: Array<number>;
    static {
        this.table = generateSinWaveTable(100);
    }

    public static at(t: number): number {
        return this.table[t % this.table.length];
    }
}