"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const storage_1 = require("@google-cloud/storage");
const mime_1 = __importDefault(require("mime"));
const imageUpload_1 = __importDefault(require("./imageUpload"));
/* Module */
class GStorageImageUpload extends imageUpload_1.default {
    constructor(config, uploadConfig, debug) {
        super(config, uploadConfig, debug);
    }
    async upload(ref) {
        const json = {};
        const name = this.uploadConfig.prefix;
        const width = this.getWidth();
        const height = this.getHeight();
        this.debug('Uploading file and doing resizes...');
        const storage = new storage_1.Storage();
        this.debug(`Saving original (${width}x${height})`);
        json.ext = this.ext;
        let data = await storage.bucket(this.uploadConfig.bucket).upload(this.file.tempFilePath, {
            destination: (process.env.NODE_ENV !== 'production' ? process.env.NODE_ENV + '/' : '') + name + '/' + ref + this.ext,
            gzip: true,
            contentType: mime_1.default.lookup(this.file.tempFilePath)
        });
        json.path = (process.env.NODE_ENV !== 'production' ? process.env.NODE_ENV + '/' : '') + name + '/' + ref + this.ext;
        json.filename = name + this.ext;
        json.original = 'https://' + data[0].metadata.bucket + '/' + data[0].metadata.name;
        if (this.uploadConfig.sizes) {
            for (const size of this.uploadConfig.sizes) {
                this.debug(`Resizing to: ${size.tag} (${size.width ? size.width : 'auto'}x${size.height ? size.height : 'auto'})`);
                await this.image.resize(size.width, size.height).toFile('/tmp/' + size.tag + this.ext);
                data = await storage.bucket(this.uploadConfig.bucket).upload('/tmp/' + size.tag + this.ext, {
                    destination: (process.env.NODE_ENV !== 'production' ? process.env.NODE_ENV + '/' : '') + name + '/' + ref + '_' + size.tag + this.ext,
                    gzip: true
                });
                json[size.tag] = 'https://' + data[0].metadata.bucket + '/' + data[0].metadata.name;
            }
        }
        return Promise.resolve(json);
    }
}
exports.default = GStorageImageUpload;
