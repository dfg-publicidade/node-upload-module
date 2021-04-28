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
const debug = debug_1.default('module:upload-s3-file');
class S3Upload extends fileUpload_1.default {
    constructor(config, uploadConfig) {
        var _a;
        super(config, uploadConfig);
        if (!((_a = config.aws) === null || _a === void 0 ? void 0 : _a.key) || !config.aws.secret) {
            throw new Error('Cloud authentication data was not provided.');
        }
        if (!uploadConfig.bucket) {
            throw new Error('Cloud config. was not provided.');
        }
        this.s3 = new aws_sdk_1.default.S3({
            accessKeyId: config.aws.key,
            secretAccessKey: config.aws.secret
        });
    }
    async save(ref, ext, buffer) {
        debug('Saving file...');
        this.file = {
            data: buffer
        };
        this.ext = ext;
        return this.upload(ref);
    }
    async mv(root, path, file) {
        debug(`Storing file: ${path + file}`);
        return s3Uploader_1.default.upload(this.s3, {
            Bucket: this.uploadConfig.bucket,
            Key: path + file,
            Body: this.file.data
        });
    }
    getUploadData(mvData, relativePath, name) {
        const json = super.getUploadData(mvData, relativePath, name);
        json.original = mvData.Location;
        return json;
    }
}
exports.default = S3Upload;
