"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = __importDefault(require("fs-extra"));
/* Module */
class FileDownload {
    constructor(debug) {
        this.debug = debug;
    }
    async download(path) {
        this.debug('Downloading file...');
        return fs_extra_1.default.promises.readFile(path);
    }
}
exports.default = FileDownload;
