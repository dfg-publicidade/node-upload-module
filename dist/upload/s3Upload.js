"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const debug_1 = __importDefault(require("debug"));
const s3Uploader_1 = __importDefault(require("../s3/s3Uploader"));
const fileUpload_1 = __importDefault(require("./fileUpload"));
/* Module */
const debug = debug_1.default('module:upload-s3');
class S3Upload extends fileUpload_1.default {
    constructor(config, uploadConfig) {
        super(config, uploadConfig);
        this.s3 = new aws_sdk_1.default.S3({
            accessKeyId: this.config.aws.key,
            secretAccessKey: this.config.aws.secret
        });
    }
    async upload(ref) {
        const json = {};
        const name = this.uploadConfig.prefix.replace(/\//ig, '_');
        debug('Uploading file...');
        json.ext = this.ext;
        const env = (process.env.NODE_ENV !== 'production' ? `${process.env.NODE_ENV}/` : '');
        const filename = `${env}${this.uploadConfig.dir}${ref}/${name}${this.ext}`;
        const data = await s3Uploader_1.default.upload(this.s3, {
            Bucket: this.uploadConfig.bucket,
            Key: filename,
            Body: this.file.data
        });
        return Promise.resolve({
            path: filename,
            filename: name + this.ext,
            original: data.Location
        });
    }
}
exports.default = S3Upload;
