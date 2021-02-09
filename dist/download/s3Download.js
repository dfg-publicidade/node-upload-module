"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const fileDownload_1 = __importDefault(require("./fileDownload"));
/* Module */
class S3Download extends fileDownload_1.default {
    constructor(config, cloudConfig, debug) {
        super(debug);
        this.config = config;
        this.cloudConfig = cloudConfig;
    }
    async download(path) {
        this.debug('Downloading file...');
        const s3 = new aws_sdk_1.default.S3({
            accessKeyId: this.config.aws.key,
            secretAccessKey: this.config.aws.secret
        });
        return s3.getObject({
            Bucket: this.cloudConfig.bucket,
            Key: path
        });
    }
}
exports.default = S3Download;
