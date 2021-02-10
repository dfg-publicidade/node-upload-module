"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const storage_1 = require("@google-cloud/storage");
const debug_1 = __importDefault(require("debug"));
const fileDownload_1 = __importDefault(require("./fileDownload"));
/* Module */
const debug = debug_1.default('module:download-gstorage');
class GStorageDownload extends fileDownload_1.default {
    constructor(cloudConfig) {
        super();
        this.cloudConfig = cloudConfig;
    }
    async download(path) {
        debug('Downloading file...');
        const storage = new storage_1.Storage();
        debug('Saving file');
        return storage.bucket(this.cloudConfig.bucket).file(path).download();
    }
}
exports.default = GStorageDownload;
