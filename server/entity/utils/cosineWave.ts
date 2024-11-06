function generateSinWaveTable(sampleRate: number) {
    const samples = [];

    for (let i = 0; i <= sampleRate; i++) {
        const angle = (i / sampleRate) * 2 * Math.PI;
        let value = Math.sin(angle);

        samples.push(Math.round(value * 10000) / 10000);
    }

    return samples;
}

export const SHARED_SINE_WAVE = {
    table: generateSinWaveTable(100),
    get(index: number): number {
        return this.table[index % this.table.length];
    }
};