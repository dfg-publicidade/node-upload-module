"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GStorageImageUpload = exports.GStorageUpload = exports.ImageUpload = exports.FileUpload = void 0;
const fileUpload_1 = __importDefault(require("./upload/fileUpload"));
exports.FileUpload = fileUpload_1.default;
const gstorageImageUpload_1 = __importDefault(require("./upload/gstorageImageUpload"));
exports.GStorageImageUpload = gstorageImageUpload_1.default;
const gstorageUpload_1 = __importDefault(require("./upload/gstorageUpload"));
exports.GStorageUpload = gstorageUpload_1.default;
const imageUpload_1 = __importDefault(require("./upload/imageUpload"));
exports.ImageUpload = imageUpload_1.default;
