"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const fileUpload_1 = __importDefault(require("./fileUpload"));
const s3Uploader_1 = __importDefault(require("./s3Uploader"));
/* Module */
class S3Upload extends fileUpload_1.default {
    constructor(config, debug) {
        super(config, debug);
    }
    async upload(config, ref) {
        const json = {};
        const name = this.config.prefix.replace(/\//ig, '_');
        this.debug('Uploading file...');
        const s3 = new aws_sdk_1.default.S3({
            accessKeyId: config.aws.key,
            secretAccessKey: config.aws.secret
        });
        this.debug('Saving file');
        json.ext = this.ext;
        const data = await s3Uploader_1.default.upload(s3, {
            Bucket: config.aws.bucket,
            Key: (process.env.NODE_ENV !== 'production' ? process.env.NODE_ENV + '/' : '') + name + '/' + ref + this.ext,
            Body: this.file.data
        });
        return Promise.resolve({
            path: (process.env.NODE_ENV !== 'production' ? process.env.NODE_ENV + '/' : '') + name + '/' + ref + this.ext,
            filename: name + this.ext,
            original: data.Location
        });
    }
}
exports.default = S3Upload;
