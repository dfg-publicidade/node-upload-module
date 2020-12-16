"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
/* Module */
const byteToKByteConv = 1024;
class FileUpload {
    constructor(config, debug) {
        this.dir = config && config.dir ? config.dir : undefined;
        this.config = config;
        this.debug = debug;
    }
    async init(req) {
        if (req.files) {
            this.debug('Parsing uploaded file...');
            const file = req.files[this.config.name] ? req.files[this.config.name] : undefined;
            this.file = Array.isArray(file) ? file[0] : file;
            if (this.file) {
                this.ext = path_1.default.extname(file.name).toLowerCase();
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
            this.debug('File file not received');
            return 'EMPTY_FILE';
        }
        else if (sizeInKBytes && this.file.data.length > sizeInKBytes * byteToKByteConv) {
            this.debug('The file size exceeds the allowed limits');
            return 'FILE_TOO_LARGE';
        }
        else if (ext.indexOf(this.ext) === -1) {
            this.debug('The file has an invalid extension');
            return 'INVALID_EXTENSION';
        }
        this.debug('File accepted');
        return undefined;
    }
    async upload(config, ref) {
        const json = {};
        const uploadPath = config.path + this.dir;
        const uploadUrl = config.url + this.dir;
        const name = this.config.name;
        this.debug('Uploading file...');
        if (!await fs_extra_1.default.pathExists(uploadPath + ref)) {
            this.debug('Creating upload directory...');
            await fs_extra_1.default.mkdirs(uploadPath + ref);
        }
        this.debug('Saving file');
        await this.file.mv(uploadPath + ref + '/' + name + this.ext);
        json.original = uploadUrl + ref + '/' + name + this.ext;
        json.filename = this.dir + '/' + ref + '/' + name + this.ext;
        json.ext = this.ext;
        return Promise.resolve(json);
    }
    getExt() {
        if (this.config && this.config.rules && this.config.rules.ext) {
            return this.config.rules.ext;
        }
        return [this.ext];
    }
    getSizeInKBytes() {
        if (this.config && this.config.rules && this.config.rules.sizeInKBytes) {
            return this.config.rules.sizeInKBytes;
        }
        return this.file.data.length;
    }
}
exports.default = FileUpload;