import swapEndian32 from "../BinaryReadWriterSwapEndian32";

const sharedBuffer = new ArrayBuffer(8);
const byteArray = new Uint8Array(sharedBuffer);
const uint32Array = new Uint32Array(sharedBuffer);
const float32Array = new Float32Array(sharedBuffer);
const float64Array = new Float64Array(sharedBuffer);

const textEncoder = new TextEncoder();

export default class BinaryWriter {
    private _buffer: Array<number>;

    constructor() {
        this._buffer = new Array();
    }

    set buffer(buffer: Uint8Array) {
        this._buffer = Array.from(buffer);
    }

    get buffer(): Uint8Array {
        return new Uint8Array(this._buffer);
    }

    public writeBytes(bytes: Uint8Array): this {
        bytes.forEach(byte => this.writeUInt8(byte));

        return this;
    }

    public writeUInt8(value: number): this {
        this._buffer.push(value);

        return this;
    }

    public writeInt8(value: number): this {
        if (value >= 0) {
            this.writeUInt8(value);
        } else {
            this.writeUInt8(255 + value + 1);
        }

        return this;
    }

    public writeUInt16(value: number): this {
        this.writeUInt8((value & 255) >>> 0);
        this.writeUInt8((value & 65280) >>> 8);

        return this;
    }

    public writeInt16(value: number): this {
        if (value >= 0) {
            this.writeUInt16(value);
        } else {
            this.writeUInt16(65535 + value + 1);
        }

        return this;
    }

    public writeUInt24(value: number): this {
        this.writeUInt8((value & 255) >>> 0);
        this.writeUInt8((value & 65280) >>> 8);
        this.writeUInt8((value & 16711680) >>> 16);

        return this;
    }

    public writeInt24(value: number): this {
        if (value >= 0) {
            this.writeUInt24(value);
        } else {
            this.writeUInt24(16777215 + value + 1);
        }

        return this;
    }

    public writeUInt32(value: number): this {
        this.writeUInt8((value & 255) >>> 0);
        this.writeUInt8((value & 65280) >>> 8);
        this.writeUInt8((value & 16711680) >>> 16);
        this.writeUInt8((value & 4278190080) >>> 24);

        return this;
    }

    public writeInt32(value: number): this {
        if (value >= 0) {
            this.writeUInt32(value);
        } else {
            this.writeUInt32(4294967295 + value + 1);
        }

        return this;
    }

    public writeFloat32(value: number): this {
        float32Array[0] = value;

        const bytes = byteArray.slice(0, 4);
        this._buffer = this._buffer.concat(Array.from(bytes));

        return this;
    }

    public writeFloat64(value: number): this {
        float64Array[0] = value;

        const bytes = byteArray.slice(0, 8);
        this._buffer = this._buffer.concat(Array.from(bytes));

        return this;
    }

    public writeVarUInt32(value: number): this {
        this.writeVarUInt64(BigInt(value));

        return this;
    }

    public writeVarInt32(value: number): this {
        this.writeVarInt64(BigInt(value));

        return this;
    }

    public writeVarUInt64(value: bigint): this {
        do {
            let byte = 0x7fn & value;
            
            if (0x0n < (value >>= 0x7n)) {
                byte |= 0x80n;
            }

            this.writeUInt8(Number(byte));
        } while (0x0n < value);

        return this;
    }

    public writeVarInt64(value: bigint): this {
        let encodedValue = 0x2n * value;

        if (value < 0) {
            encodedValue = -(0x2n * value + 0x1n);
        }

        this.writeVarUInt64(encodedValue);

        return this;
    }

    public writeVarFloat32(value: number): this {
        float32Array[0] = value;

        this.writeVarInt32(swapEndian32(uint32Array[0]));

        return this;
    }

    public writeBoolean(value: boolean): this {
        this.writeUInt8(Number(value));

        return this;
    }

    public writeString(str: string): this {
        if (str.length > 0) {
            const encoded = textEncoder.encode(str);

            this.writeBytes(encoded);
        }

        this.writeUInt8(0);

        return this;
    }
}