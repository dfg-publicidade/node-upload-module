"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = __importDefault(require("fs-extra"));
const sharp_1 = __importDefault(require("sharp"));
const upload_1 = __importDefault(require("./upload"));
class ImageUpload extends upload_1.default {
    constructor(config, debug) {
        super(config, debug);
    }
    init(req) {
        const _super = Object.create(null, {
            init: { get: () => super.init }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.init.call(this, req);
            if (this.file) {
                this.image = sharp_1.default(this.file.data);
                this.metadata = yield this.image.metadata();
            }
            return Promise.resolve();
        });
    }
    hasImage() {
        return !!this.file && !!this.image;
    }
    imgValidate() {
        const width = this.getWidth();
        const height = this.getHeight();
        const uploadError = this.validate();
        if (uploadError) {
            return uploadError;
        }
        if (!this.image || !this.metadata) {
            this.debug('File file not received');
            return 'EMPTY_FILE';
        }
        else if (width && this.metadata.width !== width) {
            this.debug('The file sizes are not correct');
            return 'OUT_OF_DIMENSION';
        }
        else if (height && this.metadata.height !== height) {
            this.debug('The file sizes are not correct');
            return 'OUT_OF_DIMENSION';
        }
        else if (this.metadata.space !== 'rgb' && this.metadata.space !== 'srgb') {
            this.debug('The color mode is not correct');
            return 'INVALID_MODE';
        }
        this.debug('Image accepted');
        return undefined;
    }
    upload(config, ref) {
        return __awaiter(this, void 0, void 0, function* () {
            const json = {};
            const uploadPath = config.path + this.dir;
            const uploadUrl = config.url + this.dir;
            const name = this.config.name;
            const width = this.getWidth();
            const height = this.getHeight();
            this.debug('Uploading file and doing resizes...');
            if (!(yield fs_extra_1.default.pathExists(uploadPath + ref))) {
                this.debug('Creating upload directory...');
                yield fs_extra_1.default.mkdirs(uploadPath + ref);
            }
            this.debug(`Saving original (${width}x${height})`);
            yield this.image.toFile(uploadPath + ref + '/' + name + this.ext);
            json.original = uploadUrl + ref + '/' + name + this.ext;
            json.filename = this.dir + '/' + ref + '/' + name + this.ext;
            if (this.config.sizes) {
                for (const size of this.config.sizes) {
                    this.debug(`Resizing to: ${size.tag} (${size.width}x${size.height})`);
                    yield this.image.resize(size.width, size.height).toFile(uploadPath + ref + '/' + name + '_' + size.tag + this.ext);
                    json[size.tag] = uploadUrl + ref + '/' + name + '_' + size.tag + this.ext;
                }
            }
            json.ext = this.ext;
            return Promise.resolve(json);
        });
    }
    getExt() {
        if (this.config && this.config.rules && this.config.rules.ext) {
            return this.config.rules.ext;
        }
        return ['.jpg', '.jpeg', '.png'];
    }
    getWidth() {
        if (this.config && this.config.rules && this.config.rules.width) {
            return this.config.rules.width;
        }
        return this.metadata.width;
    }
    getHeight() {
        if (this.config && this.config.rules && this.config.rules.height) {
            return this.config.rules.height;
        }
        return this.metadata.height;
    }
}
exports.default = ImageUpload;
