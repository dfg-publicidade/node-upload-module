"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const storage_1 = require("@google-cloud/storage");
const debug_1 = __importDefault(require("debug"));
const mime_1 = __importDefault(require("mime"));
const fileUpload_1 = __importDefault(require("./fileUpload"));
/* Module */
const debug = debug_1.default('module:upload-gstorage');
class GStorageUpload extends fileUpload_1.default {
    constructor(config, uploadConfig) {
        super(config, uploadConfig);
    }
    async upload(ref) {
        const json = {};
        const name = this.uploadConfig.prefix;
        debug('Uploading file...');
        const storage = new storage_1.Storage();
        debug('Saving file');
        json.ext = this.ext;
        const env = (process.env.NODE_ENV !== 'production' ? `${process.env.NODE_ENV}/` : '');
        const filename = `${env}${this.uploadConfig.dir}${ref}/${name}${this.ext}`;
        const data = await storage.bucket(this.uploadConfig.bucket).upload(this.file.tempFilePath, {
            destination: filename,
            gzip: true,
            contentType: mime_1.default.lookup(this.file.tempFilePath)
        });
        return Promise.resolve({
            path: filename,
            filename: name + this.ext,
            original: `https://${data[0].metadata.bucket}/${data[0].metadata.name}`
        });
    }
}
exports.default = GStorageUpload;
