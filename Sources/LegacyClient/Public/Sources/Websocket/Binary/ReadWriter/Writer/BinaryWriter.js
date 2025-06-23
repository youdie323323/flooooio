"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BinaryReadWriterSwapEndian32_1 = __importDefault(require("../BinaryReadWriterSwapEndian32"));
const sharedBuffer = new ArrayBuffer(8);
const byteArray = new Uint8Array(sharedBuffer);
const uint32Array = new Uint32Array(sharedBuffer);
const float32Array = new Float32Array(sharedBuffer);
const float64Array = new Float64Array(sharedBuffer);
const textEncoder = new TextEncoder();
class BinaryWriter {
    constructor() {
        this._buffer = new Array();
    }
    set buffer(buffer) {
        this._buffer = Array.from(buffer);
    }
    get buffer() {
        return new Uint8Array(this._buffer);
    }
    writeBytes(bytes) {
        bytes.forEach(byte => this.writeUInt8(byte));
        return this;
    }
    writeUInt8(value) {
        this._buffer.push(value);
        return this;
    }
    writeInt8(value) {
        if (value >= 0) {
            this.writeUInt8(value);
        }
        else {
            this.writeUInt8(255 + value + 1);
        }
        return this;
    }
    writeUInt16(value) {
        this.writeUInt8((value & 255) >>> 0);
        this.writeUInt8((value & 65280) >>> 8);
        return this;
    }
    writeInt16(value) {
        if (value >= 0) {
            this.writeUInt16(value);
        }
        else {
            this.writeUInt16(65535 + value + 1);
        }
        return this;
    }
    writeUInt24(value) {
        this.writeUInt8((value & 255) >>> 0);
        this.writeUInt8((value & 65280) >>> 8);
        this.writeUInt8((value & 16711680) >>> 16);
        return this;
    }
    writeInt24(value) {
        if (value >= 0) {
            this.writeUInt24(value);
        }
        else {
            this.writeUInt24(16777215 + value + 1);
        }
        return this;
    }
    writeUInt32(value) {
        this.writeUInt8((value & 255) >>> 0);
        this.writeUInt8((value & 65280) >>> 8);
        this.writeUInt8((value & 16711680) >>> 16);
        this.writeUInt8((value & 4278190080) >>> 24);
        return this;
    }
    writeInt32(value) {
        if (value >= 0) {
            this.writeUInt32(value);
        }
        else {
            this.writeUInt32(4294967295 + value + 1);
        }
        return this;
    }
    writeFloat32(value) {
        float32Array[0] = value;
        const bytes = byteArray.slice(0, 4);
        this._buffer = this._buffer.concat(Array.from(bytes));
        return this;
    }
    writeFloat64(value) {
        float64Array[0] = value;
        const bytes = byteArray.slice(0, 8);
        this._buffer = this._buffer.concat(Array.from(bytes));
        return this;
    }
    writeVarUInt32(value) {
        this.writeVarUInt64(BigInt(value));
        return this;
    }
    writeVarInt32(value) {
        this.writeVarInt64(BigInt(value));
        return this;
    }
    writeVarUInt64(value) {
        do {
            let byte = 0x7fn & value;
            if (0x0n < (value >>= 0x7n)) {
                byte |= 0x80n;
            }
            this.writeUInt8(Number(byte));
        } while (0x0n < value);
        return this;
    }
    writeVarInt64(value) {
        let encodedValue = 0x2n * value;
        if (value < 0) {
            encodedValue = -(0x2n * value + 0x1n);
        }
        this.writeVarUInt64(encodedValue);
        return this;
    }
    writeVarFloat32(value) {
        float32Array[0] = value;
        this.writeVarInt32((0, BinaryReadWriterSwapEndian32_1.default)(uint32Array[0]));
        return this;
    }
    writeBoolean(value) {
        this.writeUInt8(Number(value));
        return this;
    }
    writeString(str) {
        if (str.length > 0) {
            const encoded = textEncoder.encode(str);
            this.writeBytes(encoded);
        }
        this.writeUInt8(0);
        return this;
    }
}
exports.default = BinaryWriter;
