"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug_1 = __importDefault(require("debug"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
/* Module */
const debug = debug_1.default('module:upload-file');
const byteToKByteConv = 1024;
class FileUpload {
    constructor(config, uploadConfig) {
        this.config = config;
        this.uploadConfig = uploadConfig;
    }
    async init(req) {
        if (req.files) {
            debug('Parsing uploaded file...');
            const file = req.files[this.uploadConfig.name] ? req.files[this.uploadConfig.name] : undefined;
            this.file = Array.isArray(file) ? file[0] : file;
            if (this.file) {
                this.ext = path_1.default.extname(this.file.name).toLowerCase();
            }
        }
        return Promise.resolve();
    }
    hasFile() {
        return !!this.file;
    }
    getFile() {
        return this.file;
    }
    md5() {
        return this.file.md5;
    }
    validate() {
        const sizeInKBytes = this.getSizeInKBytes();
        const ext = this.getExt();
        if (!this.file || !this.file.name) {
            debug('File file not received');
            return 'EMPTY_FILE';
        }
        else if (sizeInKBytes && this.file.data.length > sizeInKBytes * byteToKByteConv) {
            debug('The file size exceeds the allowed limits');
            return 'FILE_TOO_LARGE';
        }
        else if (ext.indexOf(this.ext) === -1) {
            debug('The file has an invalid extension');
            return 'INVALID_EXTENSION';
        }
        debug('File accepted');
        return undefined;
    }
    async upload(ref) {
        const json = {};
        const uploadPath = this.config.path + this.uploadConfig.dir;
        const uploadUrl = this.config.url + this.uploadConfig.dir;
        debug('Uploading file...');
        if (!await fs_extra_1.default.pathExists(uploadPath + ref)) {
            debug('Creating upload directory...');
            await fs_extra_1.default.mkdirs(uploadPath + ref);
        }
        debug('Saving file');
        let name = this.uploadConfig.prefix.replace(/\//ig, '_');
        name = `${ref}/${name}${this.ext}`;
        await this.file.mv(uploadPath + name);
        json.original = uploadUrl + name;
        json.filename = `${this.uploadConfig.dir}/${name}`;
        json.ext = this.ext;
        return Promise.resolve(json);
    }
    getExt() {
        if (this.uploadConfig && this.uploadConfig.rules && this.uploadConfig.rules.ext) {
            return this.uploadConfig.rules.ext;
        }
        return [this.ext];
    }
    getSizeInKBytes() {
        if (this.uploadConfig && this.uploadConfig.rules && this.uploadConfig.rules.sizeInKBytes) {
            return this.uploadConfig.rules.sizeInKBytes;
        }
        return this.file.data.length;
    }
}
exports.default = FileUpload;
