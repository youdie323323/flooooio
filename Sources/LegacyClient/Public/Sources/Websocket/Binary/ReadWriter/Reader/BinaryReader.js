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
const textDecoder = new TextDecoder();
class BinaryReader {
    constructor(buffer) {
        this.set(buffer);
    }
    set(buffer) {
        this.at = 0;
        this.buffer = new Uint8Array(buffer);
        return this;
    }
    isEOF() {
        return this.at >= this.buffer.byteLength;
    }
    readBytes(length) {
        const slice = this.buffer.slice(this.at, this.at + length);
        this.at += length;
        return slice;
    }
    readUInt8() {
        return this.buffer[this.at++];
    }
    readInt8() {
        const value = this.readUInt8();
        return value >> 0 ^ 0 - (value & 1);
    }
    readUInt16() {
        let value = 0;
        return (value |= this.readUInt8() << 0) | this.readUInt8() << 8;
    }
    readInt16() {
        const value = this.readUInt16();
        return value >> 0 ^ 0 - (value & 1);
    }
    readUInt24() {
        let value = 0;
        return (value = (value |= this.readUInt8() << 0) | this.readUInt8() << 8) | this.readUInt8() << 16;
    }
    readInt24() {
        const value = this.readUInt24();
        return value >> 0 ^ 0 - (value & 1);
    }
    readUInt32() {
        let value = 0;
        return (value = (value = (value |= this.readUInt8() << 0) | this.readUInt8() << 8) | this.readUInt8() << 16) | this.readUInt8() << 24;
    }
    readInt32() {
        const value = this.readUInt32();
        return value >> 0 ^ 0 - (value & 1);
    }
    readFloat32() {
        byteArray.set(this.buffer.subarray(this.at, this.at += 4));
        return float32Array[0];
    }
    readFloat64() {
        byteArray.set(this.buffer.subarray(this.at, this.at += 8));
        return float64Array[0];
    }
    readVarUInt32() {
        return Number(this.readVarUInt64());
    }
    readVarInt32() {
        return Number(this.readVarInt64());
    }
    readVarUInt64() {
        let result = 0n;
        for (let shift = 0; shift < 64; shift += 7) {
            const byte = BigInt(this.readUInt8());
            result |= (0x7fn & byte) << BigInt(shift);
            if (0x0n === (0x80n & byte)) {
                break;
            }
        }
        return result;
    }
    readVarInt64() {
        let value = this.readVarUInt64();
        if (0x1n & value) {
            value = -(value + 0x1n) / 0x2n;
        }
        else {
            value /= 0x2n;
        }
        return value;
    }
    readVarFloat32() {
        uint32Array[0] = (0, BinaryReadWriterSwapEndian32_1.default)(this.readVarInt32());
        return float32Array[0];
    }
    readBoolean() {
        return Boolean(this.readUInt8());
    }
    readString() {
        const startPos = this.at;
        let length = 0;
        while (true) {
            const pos = startPos + length;
            if (pos >= this.buffer.byteLength) {
                throw new Error("Invalid string: Out of range");
            }
            if (this.buffer[pos] === 0) {
                break;
            }
            length++;
        }
        const bytes = this.readBytes(length);
        this.readUInt8(); // Skip null terminator
        return textDecoder.decode(bytes);
    }
}
exports.default = BinaryReader;
