"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const storage_1 = require("@google-cloud/storage");
const debug_1 = __importDefault(require("debug"));
const with_db_1 = __importDefault(require("mime-type/with-db"));
const sharp_1 = __importDefault(require("sharp"));
const imageUpload_1 = __importDefault(require("./imageUpload"));
/* Module */
const debug = debug_1.default('module:upload-gstorage-image');
class GStorageImageUpload extends imageUpload_1.default {
    async save(ref, ext, buffer) {
        debug('Saving file...');
        this.file = {
            data: buffer
        };
        this.image = sharp_1.default(buffer);
        this.metadata = await this.image.metadata();
        this.ext = ext;
        return this.upload(ref);
    }
    async mv(root, path, file) {
        try {
            debug(`Storing file: ${path + file}`);
            const storage = new storage_1.Storage();
            let bucketFile = storage.bucket(this.uploadConfig.bucket).file(path + file);
            await bucketFile.delete({ ignoreNotFound: true });
            bucketFile = storage.bucket(this.uploadConfig.bucket).file(path + file);
            const stream = bucketFile.createWriteStream({
                metadata: {
                    contentType: with_db_1.default.lookup(file)
                },
                resumable: false,
                gzip: true
            });
            await stream.write(await this.image.toBuffer());
            await stream.end();
            return new Promise((resolve) => {
                stream.on('finish', () => {
                    resolve(bucketFile.getMetadata());
                });
            });
        }
        catch (error) {
            return Promise.reject(error);
        }
    }
    getUploadData(mvData, relativePath, name) {
        const data = mvData[0];
        const json = super.getUploadData(mvData, relativePath, name);
        json.original = `https://${data.bucket}/${data.name}`;
        return json;
    }
}
exports.default = GStorageImageUpload;
