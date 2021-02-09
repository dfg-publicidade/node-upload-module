"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const s3Uploader_1 = __importDefault(require("../s3/s3Uploader"));
const fileUpload_1 = __importDefault(require("./fileUpload"));
/* Module */
class S3Upload extends fileUpload_1.default {
    constructor(config, uploadConfig, debug) {
        super(config, uploadConfig, debug);
        this.s3 = new aws_sdk_1.default.S3({
            accessKeyId: this.config.aws.key,
            secretAccessKey: this.config.aws.secret
        });
    }
    async upload(ref) {
        const json = {};
        const name = this.uploadConfig.prefix.replace(/\//ig, '_');
        this.debug('Uploading file...');
        json.ext = this.ext;
        const data = await s3Uploader_1.default.upload(this.s3, {
            Bucket: this.uploadConfig.bucket,
            Key: (process.env.NODE_ENV !== 'production' ? process.env.NODE_ENV + '/' : '') + this.uploadConfig.dir + ref + '/' + name + this.ext,
            Body: this.file.data
        });
        return Promise.resolve({
            path: (process.env.NODE_ENV !== 'production' ? process.env.NODE_ENV + '/' : '') + this.uploadConfig.dir + ref + '/' + name + this.ext,
            filename: name + this.ext,
            original: data.Location
        });
    }
}
exports.default = S3Upload;
