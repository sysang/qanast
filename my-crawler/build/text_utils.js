"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashText = exports.removeBreaklineCharacters = void 0;
// @ts-nocheck
const xxhash_1 = __importDefault(require("xxhash"));
const removeBreaklineCharacters = (text) => {
    let splits = text.split('\n');
    let merged = splits.filter(s => !!s);
    return merged.join(' ');
};
exports.removeBreaklineCharacters = removeBreaklineCharacters;
const hashText = (text) => {
    return xxhash_1.default.hash64(Buffer.from(text, 'utf8'), 0xCAFEBABE, 'hex');
};
exports.hashText = hashText;
//# sourceMappingURL=text_utils.js.map