export default function swapEndian32(value: number) {
    return (value & 255) << 24 | 0 | (value & 65280) << 8 | value >> 8 & 65280 | value >> 24 & 255;
}