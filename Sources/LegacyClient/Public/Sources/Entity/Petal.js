"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPetal = void 0;
const petal_profiles_json_1 = __importDefault(require("../../../../Shared/Florr/Native/ProfileData/petal_profiles.json"));
const Memoize_1 = require("../Utils/Memoize");
exports.isPetal = (0, Memoize_1.memo)((type) => type in petal_profiles_json_1.default);
