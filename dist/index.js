"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageUpload = exports.Upload = void 0;
const imageUpload_1 = __importDefault(require("./upload/imageUpload"));
exports.ImageUpload = imageUpload_1.default;
const upload_1 = __importDefault(require("./upload/upload"));
exports.Upload = upload_1.default;
