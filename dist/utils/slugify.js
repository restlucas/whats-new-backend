"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSlug = createSlug;
const slugify_1 = __importDefault(require("slugify"));
function createSlug(title) {
    return (0, slugify_1.default)(title, {
        lower: true,
        strict: true,
        trim: true,
    });
}
