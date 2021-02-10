"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug_1 = __importDefault(require("debug"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const sharp_1 = __importDefault(require("sharp"));
const fileUpload_1 = __importDefault(require("./fileUpload"));
/* Module */
const debug = debug_1.default('module:upload-image');
class ImageUpload extends fileUpload_1.default {
    constructor(config, uploadConfig) {
        super(config, uploadConfig);
    }
    async init(req) {
        await super.init(req);
        if (this.file) {
            this.image = sharp_1.default(this.file.data);
            this.metadata = await this.image.metadata();
        }
        return Promise.resolve();
    }
    hasImage() {
        return !!this.file && !!this.image;
    }
    getImage() {
        return this.image;
    }
    imgValidate() {
        const width = this.getWidth();
        const height = this.getHeight();
        const uploadError = this.validate();
        if (uploadError) {
            return uploadError;
        }
        if (!this.image || !this.metadata) {
            debug('File file not received');
            return 'EMPTY_FILE';
        }
        else if (width && this.metadata.width !== width) {
            debug('The file sizes are not correct');
            return 'OUT_OF_DIMENSION';
        }
        else if (height && this.metadata.height !== height) {
            debug('The file sizes are not correct');
            return 'OUT_OF_DIMENSION';
        }
        else if (this.metadata.space !== 'rgb' && this.metadata.space !== 'srgb') {
            debug('The color mode is not correct');
            return 'INVALID_MODE';
        }
        debug('Image accepted');
        return undefined;
    }
    async upload(ref) {
        const json = {};
        const uploadPath = this.config.path + this.uploadConfig.dir;
        const uploadUrl = this.config.url + this.uploadConfig.dir;
        const name = this.uploadConfig.name;
        const width = this.getWidth();
        const height = this.getHeight();
        debug('Uploading file and doing resizes...');
        if (!await fs_extra_1.default.pathExists(uploadPath + ref)) {
            debug('Creating upload directory...');
            await fs_extra_1.default.mkdirs(uploadPath + ref);
        }
        debug(`Saving original (${width}x${height})`);
        await this.image.toFile(uploadPath + ref + '/' + name + this.ext);
        json.original = uploadUrl + ref + '/' + name + this.ext;
        json.filename = this.uploadConfig.dir + '/' + ref + '/' + name + this.ext;
        if (this.uploadConfig.sizes) {
            for (const size of this.uploadConfig.sizes) {
                debug(`Resizing to: ${size.tag} (${size.width}x${size.height})`);
                await this.image.resize(size.width, size.height).toFile(uploadPath + ref + '/' + name + '_' + size.tag + this.ext);
                json[size.tag] = uploadUrl + ref + '/' + name + '_' + size.tag + this.ext;
            }
        }
        json.ext = this.ext;
        return Promise.resolve(json);
    }
    getExt() {
        if (this.uploadConfig && this.uploadConfig.rules && this.uploadConfig.rules.ext) {
            return this.uploadConfig.rules.ext;
        }
        return ['.jpg', '.jpeg', '.png'];
    }
    getWidth() {
        if (this.uploadConfig && this.uploadConfig.rules && this.uploadConfig.rules.width) {
            return this.uploadConfig.rules.width;
        }
        return this.metadata.width;
    }
    getHeight() {
        if (this.uploadConfig && this.uploadConfig.rules && this.uploadConfig.rules.height) {
            return this.uploadConfig.rules.height;
        }
        return this.metadata.height;
    }
}
exports.default = ImageUpload;
