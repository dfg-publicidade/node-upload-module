"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const debug_1 = __importDefault(require("debug"));
const fileDownload_1 = __importDefault(require("./fileDownload"));
/* Module */
const debug = (0, debug_1.default)('module:download-s3');
class S3Download extends fileDownload_1.default {
    constructor(config, cloudConfig) {
        var _a;
        super();
        this.cloudConfig = cloudConfig;
        if (!config) {
            throw new Error('Application config. was not provided.');
        }
        if (!((_a = config.aws) === null || _a === void 0 ? void 0 : _a.key) || !config.aws.secret) {
            throw new Error('Cloud authentication data was not provided.');
        }
        if (!(cloudConfig === null || cloudConfig === void 0 ? void 0 : cloudConfig.bucket)) {
            throw new Error('Cloud config. was not provided.');
        }
        this.s3 = new aws_sdk_1.default.S3({
            accessKeyId: config.aws.key,
            secretAccessKey: config.aws.secret
        });
    }
    async download(path) {
        debug('Downloading file...');
        const stream = this.s3.getObject({
            Bucket: this.cloudConfig.bucket,
            Key: path
        }).createReadStream();
        return new Promise((resolve, reject) => {
            const buffer = [];
            stream.on('data', (chunk) => {
                buffer.push(chunk);
            });
            stream.on('end', () => {
                resolve(Buffer.concat(buffer));
            });
            stream.on('error', (err) => {
                reject(err);
            });
        });
    }
}
exports.default = S3Download;
