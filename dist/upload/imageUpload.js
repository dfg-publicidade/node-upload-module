"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug_1 = __importDefault(require("debug"));
const sharp_1 = __importDefault(require("sharp"));
const fileUpload_1 = __importDefault(require("./fileUpload"));
const uploadUtil_1 = __importDefault(require("./uploadUtil"));
/* Module */
const debug = debug_1.default('module:upload-image');
class ImageUpload extends fileUpload_1.default {
    constructor(config, uploadConfig) {
        super(config, uploadConfig);
    }
    async init(req) {
        await super.init(req);
        if (this.hasFile()) {
            try {
                this.image = sharp_1.default(this.getFile().data, { failOnError: false });
                this.metadata = await this.image.metadata();
            }
            catch (err) {
                throw new Error(`Cannot upload image. ${err}`);
            }
        }
        return Promise.resolve();
    }
    getImage() {
        return this.image;
    }
    getMetadata() {
        return this.metadata;
    }
    imgValidate() {
        const uploadError = this.validate();
        if (uploadError) {
            return uploadError;
        }
        const defaultWidth = this.getDefaultWidth();
        const defaultHeight = this.getDefaultHeight();
        if (defaultWidth && this.metadata.width !== defaultWidth) {
            debug('The file sizes are not correct');
            return 'OUT_OF_DIMENSION';
        }
        else if (defaultHeight && this.metadata.height !== defaultHeight) {
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
        debug('Uploading file and doing resizes...');
        const width = this.metadata.width;
        const height = this.metadata.height;
        debug(`Saving original (${width}x${height})`);
        const json = await super.upload(ref);
        if (this.uploadConfig.convertTo) {
            this.ext = `.${this.uploadConfig.convertTo}`;
            this.image = this.image.toFormat(this.uploadConfig.convertTo, this.uploadConfig.webp);
            debug(`Saving ${this.uploadConfig.convertTo} (${width}x${height})`);
            json[this.uploadConfig.convertTo] = await super.upload(ref);
        }
        if (this.uploadConfig.sizes) {
            for (const size of this.uploadConfig.sizes) {
                const sizeWidth = size.width ? size.width : 'auto';
                const sizeHeight = size.height ? size.height : 'auto';
                debug(`Resizing to: ${size.tag} (${sizeWidth}x${sizeHeight})`);
                this.defaultImage = this.image;
                this.suffix = size.tag;
                this.image = this.image.resize(size.width, size.height);
                json[size.tag] = await super.upload(ref);
                this.image = this.defaultImage;
                this.suffix = undefined;
            }
        }
        return Promise.resolve(json);
    }
    getDefaultWidth() {
        if (this.uploadConfig && this.uploadConfig.rules && this.uploadConfig.rules.width) {
            return this.uploadConfig.rules.width;
        }
        return this.metadata.width;
    }
    getDefaultHeight() {
        if (this.uploadConfig && this.uploadConfig.rules && this.uploadConfig.rules.height) {
            return this.uploadConfig.rules.height;
        }
        return this.metadata.height;
    }
    getAcceptedExt() {
        if (this.uploadConfig && this.uploadConfig.rules && this.uploadConfig.rules.ext) {
            return this.uploadConfig.rules.ext;
        }
        return ['.jpg', '.jpeg', '.png', '.webp'];
    }
    async mv(root, path, file) {
        debug(`Storing file: ${root + path + file}`);
        await uploadUtil_1.default.mkdirs(root + path);
        return this.image.toFile(root + path + file);
    }
}
exports.default = ImageUpload;
