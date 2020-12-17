"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const imageUpload_1 = __importDefault(require("./imageUpload"));
/* Module */
class S3ImageUpload extends imageUpload_1.default {
    constructor(config, debug) {
        super(config, debug);
    }
    async upload(config, ref) {
        const json = {};
        const name = this.config.prefix;
        const width = this.getWidth();
        const height = this.getHeight();
        this.debug('Uploading file and doing resizes...');
        const s3 = new aws_sdk_1.default.S3({
            accessKeyId: config.aws.key,
            secretAccessKey: config.aws.secret
        });
        this.debug(`Saving original (${width}x${height})`);
        json.ext = this.ext;
        let data = await s3.upload({
            Bucket: 'bucket',
            Key: (process.env.NODE_ENV !== 'production' ? process.env.NODE_ENV + '/' : '') + name + '/' + ref + this.ext,
            Body: this.file
        });
        json.path = (process.env.NODE_ENV !== 'production' ? process.env.NODE_ENV + '/' : '') + name + '/' + ref + this.ext;
        json.filename = name + this.ext;
        json.original = data.Location;
        if (this.config.sizes) {
            for (const size of this.config.sizes) {
                this.debug(`Resizing to: ${size.tag} (${size.width ? size.width : 'auto'}x${size.height ? size.height : 'auto'})`);
                await this.image.resize(size.width, size.height).toFile('/tmp/' + size.tag + this.ext);
                data = await s3.upload({
                    Bucket: 'bucket',
                    Key: (process.env.NODE_ENV !== 'production' ? process.env.NODE_ENV + '/' : '') + name + '/' + ref + '_' + size.tag + this.ext,
                    Body: '/tmp/' + size.tag + this.ext
                });
                json[size.tag] = data.Location;
            }
        }
        return Promise.resolve(json);
    }
}
exports.default = S3ImageUpload;
