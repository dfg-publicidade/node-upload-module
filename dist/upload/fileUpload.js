"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug_1 = __importDefault(require("debug"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const uploadUtil_1 = __importDefault(require("./uploadUtil"));
/* Module */
const debug = (0, debug_1.default)('module:upload-file');
const byteToKByteConv = 1024;
class FileUpload {
    constructor(config, uploadConfig) {
        debug('Creating file upload...');
        if (!config) {
            throw new Error('Application config. was not provided.');
        }
        if (!uploadConfig) {
            throw new Error('Upload config. was not provided.');
        }
        this.config = config;
        this.uploadConfig = uploadConfig;
    }
    async init(req) {
        if (!req) {
            throw new Error('Request was not provided.');
        }
        if (req.files) {
            debug('Parsing uploaded file...');
            const file = req.files[this.uploadConfig.name] ? req.files[this.uploadConfig.name] : undefined;
            this.file = Array.isArray(file) ? file[0] : file;
            if (this.file) {
                if (this.config.fileUpload.useTempFiles) {
                    this.file.data = await fs_extra_1.default.readFileSync(this.file.tempFilePath);
                }
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
        if (!this.file) {
            return undefined;
        }
        return this.file.md5;
    }
    validate() {
        const maxSizeInKBytes = this.getMaxSizeInKBytes();
        const ext = this.getAcceptedExt();
        if (!this.file || !this.file.name) {
            debug('File not received');
            return 'EMPTY_FILE';
        }
        else if (maxSizeInKBytes && this.file.data.length > maxSizeInKBytes * byteToKByteConv) {
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
        debug('Uploading file...');
        const relativePath = uploadUtil_1.default.getEnv() + this.uploadConfig.dir + ref + '/';
        const name = uploadUtil_1.default.getFileName(this.uploadConfig.prefix, this.ext, this.suffix);
        const mvData = await this.mv(this.config.path, relativePath, name);
        return Promise.resolve(this.getUploadData(mvData, relativePath, name));
    }
    getMaxSizeInKBytes() {
        var _a;
        if (this.uploadConfig && this.uploadConfig.rules && this.uploadConfig.rules.sizeInKBytes) {
            return this.uploadConfig.rules.sizeInKBytes;
        }
        if (!((_a = this.file) === null || _a === void 0 ? void 0 : _a.data)) {
            return 0;
        }
        return this.file.data.length;
    }
    getAcceptedExt() {
        if (this.uploadConfig && this.uploadConfig.rules && this.uploadConfig.rules.ext) {
            return this.uploadConfig.rules.ext;
        }
        return [this.ext];
    }
    async mv(root, path, file) {
        debug(`Storing file: ${root + path + file}`);
        await uploadUtil_1.default.mkdirs(root + path);
        return this.file.mv(root + path + file);
    }
    getUploadData(mvData, relativePath, name) {
        const url = this.config.url + relativePath;
        return {
            original: url + name,
            filename: relativePath + name,
            ext: this.ext
        };
    }
}
exports.default = FileUpload;
