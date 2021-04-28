"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const storage_1 = require("@google-cloud/storage");
const with_db_1 = __importDefault(require("mime-type/with-db"));
const fileUpload_1 = __importDefault(require("./fileUpload"));
/* Module */
class GStorageUpload extends fileUpload_1.default {
    async save(ref, ext, buffer) {
        this.file = {
            data: buffer
        };
        this.ext = ext;
        return this.upload(ref);
    }
    async mv(root, path, file) {
        const storage = new storage_1.Storage();
        const bucketFile = storage.bucket(this.uploadConfig.bucket).file(path + file);
        await bucketFile.delete({ ignoreNotFound: true });
        const stream = bucketFile.createWriteStream({
            metadata: {
                contentType: with_db_1.default.lookup(file)
            },
            resumable: false,
            gzip: true
        });
        await stream.write(this.file.data);
        await stream.end();
        return new Promise((resolve) => {
            stream.on('finish', () => {
                resolve(bucketFile.getMetadata());
            });
        });
    }
    getUploadData(mvData, relativePath, name) {
        const data = mvData[0];
        const json = super.getUploadData(mvData, relativePath, name);
        json.original = `https://${data.bucket}/${data.name}`;
        return json;
    }
}
exports.default = GStorageUpload;
