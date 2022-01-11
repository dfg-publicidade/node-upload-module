"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const storage_1 = require("@google-cloud/storage");
const debug_1 = __importDefault(require("debug"));
const fileDownload_1 = __importDefault(require("./fileDownload"));
/* Module */
const debug = (0, debug_1.default)('module:download-gstorage');
class GStorageDownload extends fileDownload_1.default {
    constructor(config, uploadConfig) {
        super();
        if (!config) {
            throw new Error('Application config. was not provided.');
        }
        if (!uploadConfig) {
            throw new Error('Upload config. was not provided.');
        }
        this.config = config;
        this.uploadConfig = uploadConfig;
    }
    async download(path) {
        debug('Downloading file...');
        const storage = new storage_1.Storage();
        const bucketFile = storage.bucket(this.uploadConfig.bucket).file(path);
        const stream = bucketFile.createReadStream();
        return new Promise((resolve, reject) => {
            const buffer = [];
            stream.on('data', (chunk) => {
                buffer.push(chunk);
            });
            stream.on('end', () => {
                resolve(Buffer.concat(buffer));
            });
            stream.on('error', (err) => {
                reject(err);
            });
        });
    }
}
exports.default = GStorageDownload;
