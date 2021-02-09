"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const storage_1 = require("@google-cloud/storage");
const fileDownload_1 = __importDefault(require("./fileDownload"));
/* Module */
class GStorageDownload extends fileDownload_1.default {
    constructor(config, cloudConfig, debug) {
        super(debug);
        this.config = config;
        this.cloudConfig = cloudConfig;
    }
    async download(path) {
        this.debug('Downloading file...');
        const storage = new storage_1.Storage();
        this.debug('Saving file');
        return storage.bucket(this.cloudConfig.bucket).file(path).download();
    }
}
exports.default = GStorageDownload;
