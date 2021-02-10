"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug_1 = __importDefault(require("debug"));
const fs_extra_1 = __importDefault(require("fs-extra"));
/* Module */
const debug = debug_1.default('module:download-file');
class FileDownload {
    async download(path) {
        debug('Downloading file...');
        return fs_extra_1.default.promises.readFile(path);
    }
}
exports.default = FileDownload;
