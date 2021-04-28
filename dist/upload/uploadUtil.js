"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = __importDefault(require("fs-extra"));
class UploadUtil {
    static getEnv() {
        return (process.env.NODE_ENV !== 'production' ? `${process.env.NODE_ENV}/` : '');
    }
    static async mkdirs(path) {
        if (!await fs_extra_1.default.pathExists(path)) {
            await fs_extra_1.default.mkdirs(path);
        }
    }
    static getFileName(prefix, ext, suffix) {
        return prefix.replace(/\//ig, '_') + (suffix ? `_${suffix}` : '') + ext;
    }
}
exports.default = UploadUtil;
