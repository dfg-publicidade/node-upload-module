"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const debug_1 = __importDefault(require("debug"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const s3Uploader_1 = __importDefault(require("../s3/s3Uploader"));
const imageUpload_1 = __importDefault(require("./imageUpload"));
/* Module */
const debug = debug_1.default('module:upload-image-s3');
class S3ImageUpload extends imageUpload_1.default {
    constructor(config, uploadConfig) {
        super(config, uploadConfig);
        this.s3 = new aws_sdk_1.default.S3({
            accessKeyId: this.config.aws.key,
            secretAccessKey: this.config.aws.secret
        });
    }
    async upload(ref) {
        debug('Uploading file and doing resizes...');
        const env = (process.env.NODE_ENV !== 'production' ? `${process.env.NODE_ENV}/` : '');
        const name = this.uploadConfig.prefix.replace(/\//ig, '_');
        const filename = `${ref}/${name}${this.ext}`;
        const width = this.getWidth();
        const height = this.getHeight();
        debug(`Saving original (${width}x${height})`);
        const filepath = `${env}${this.uploadConfig.dir}${filename}`;
        let data = await s3Uploader_1.default.upload(this.s3, {
            Bucket: this.uploadConfig.bucket,
            Key: filepath,
            Body: this.file.data
        });
        const json = {};
        json.path = filepath;
        json.filename = filename;
        json.original = data.Location;
        json.ext = this.ext;
        if (this.uploadConfig.sizes) {
            for (const size of this.uploadConfig.sizes) {
                debug(`Resizing to: ${size.tag} (${size.width ? size.width : 'auto'}x${size.height ? size.height : 'auto'})`);
                const resizedName = `${ref}/${name}_${size.tag}${this.ext}`;
                const resizedPath = `/tmp/${resizedName}`;
                await this.image.resize(size.width, size.height).toFile(resizedPath);
                data = await s3Uploader_1.default.upload(this.s3, {
                    Bucket: this.uploadConfig.bucket,
                    Key: `${env}/${this.uploadConfig.dir}${resizedName}`,
                    Body: fs_extra_1.default.readFileSync(resizedPath)
                });
                json[size.tag] = data.Location;
            }
        }
        return Promise.resolve(json);
    }
}
exports.default = S3ImageUpload;
