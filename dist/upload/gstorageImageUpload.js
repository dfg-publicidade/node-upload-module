"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const storage_1 = require("@google-cloud/storage");
const debug_1 = __importDefault(require("debug"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const with_db_1 = __importDefault(require("mime-type/with-db"));
const imageUpload_1 = __importDefault(require("./imageUpload"));
/* Module */
const debug = debug_1.default('module:upload-image-gstorage');
class GStorageImageUpload extends imageUpload_1.default {
    constructor(config, uploadConfig) {
        super(config, uploadConfig);
    }
    async upload(ref) {
        debug('Uploading file and doing resizes...');
        const storage = new storage_1.Storage();
        const env = (process.env.NODE_ENV !== 'production' ? `${process.env.NODE_ENV}/` : '');
        const name = this.uploadConfig.prefix.replace(/\//ig, '_');
        const filename = `${ref}/${name}${this.ext}`;
        const width = this.getWidth();
        const height = this.getHeight();
        debug(`Saving original (${width}x${height})`);
        const filepath = `${env}${this.uploadConfig.dir}${filename}`;
        let tmpPath;
        if (this.file.tempFilePath) {
            tmpPath = this.file.tempFilePath;
        }
        else {
            tmpPath = `/tmp/${ref}`;
            if (!await fs_extra_1.default.pathExists('/tmp')) {
                debug('Creating upload directory...');
                await fs_extra_1.default.mkdirs('/tmp');
            }
            await fs_extra_1.default.writeFile(tmpPath, this.file.data);
        }
        let data = await storage.bucket(this.uploadConfig.bucket).upload(tmpPath, {
            destination: filepath,
            gzip: true,
            contentType: with_db_1.default.lookup(this.ext)
        });
        const json = {};
        json.path = filepath;
        json.filename = filename;
        json.original = `https://${data[0].metadata.bucket}/${data[0].metadata.name}`;
        json.ext = this.ext;
        if (this.uploadConfig.sizes) {
            for (const size of this.uploadConfig.sizes) {
                debug(`Resizing to: ${size.tag} (${size.width ? size.width : 'auto'}x${size.height ? size.height : 'auto'})`);
                const resizedName = `${ref}/${name}_${size.tag}${this.ext}`;
                const resizedPath = `/tmp/${resizedName}`;
                if (!await fs_extra_1.default.pathExists(`/tmp/${ref}`)) {
                    debug('Creating upload directory...');
                    await fs_extra_1.default.mkdirs(`/tmp/${ref}`);
                }
                await this.image.resize(size.width, size.height).toFile(resizedPath);
                data = await storage.bucket(this.uploadConfig.bucket).upload(resizedPath, {
                    destination: `${env}/${this.uploadConfig.dir}${resizedName}`,
                    gzip: true
                });
                json[size.tag] = `https://${data[0].metadata.bucket}/${data[0].metadata.name}`;
            }
        }
        if (!this.file.tempFilePath) {
            await fs_extra_1.default.remove(tmpPath);
        }
        return Promise.resolve(json);
    }
}
exports.default = GStorageImageUpload;
