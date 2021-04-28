import appDebugger from 'debug';
import { Request } from 'express';
import { UploadedFile } from 'express-fileupload';
import fs from 'fs-extra';
import path from 'path';
import UploadError from '../enums/uploadError';
import Upload from '../interfaces/upload';
import UploadConfig from '../interfaces/uploadConfig';
import UploadUtil from './uploadUtil';

/* Module */
const debug: appDebugger.IDebugger = appDebugger('module:upload-file');

const byteToKByteConv: number = 1024;

class FileUpload implements Upload {
    protected config: any;
    protected uploadConfig: UploadConfig;
    protected file: UploadedFile;
    protected ext: string;
    protected suffix: string;

    public constructor(config: any, uploadConfig: UploadConfig) {
        if (!config) {
            throw new Error('Application config. was not provided.');
        }
        if (!uploadConfig) {
            throw new Error('Upload config. was not provided.');
        }

        this.config = config;
        this.uploadConfig = uploadConfig;
    }

    public async init(req: Request): Promise<void> {
        if (!req) {
            throw new Error('Request was not provided.');
        }

        if (req.files) {
            debug('Parsing uploaded file...');

            const file: UploadedFile | UploadedFile[] = req.files[this.uploadConfig.name] ? req.files[this.uploadConfig.name] : undefined;

            this.file = Array.isArray(file) ? file[0] : file;

            if (this.file) {
                if (this.config.fileUpload.useTempFiles) {
                    this.file.data = await fs.readFileSync(this.file.tempFilePath);
                }

                this.ext = path.extname(this.file.name).toLowerCase();
            }
        }

        return Promise.resolve();
    }

    public hasFile(): boolean {
        return !!this.file;
    }

    public getFile(): UploadedFile {
        return this.file;
    }

    public md5(): string {
        if (!this.file) {
            return undefined;
        }

        return this.file.md5;
    }

    public validate(): UploadError {
        const maxSizeInKBytes: number = this.getMaxSizeInKBytes();
        const ext: string[] = this.getAcceptedExt();

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

    public async upload(ref: string): Promise<any> {
        debug('Uploading file...');

        const relativePath: string = UploadUtil.getEnv() + this.uploadConfig.dir + ref + '/';
        const name: string = UploadUtil.getFileName(this.uploadConfig.prefix, this.ext, this.suffix);

        const mvData: any = await this.mv(this.config.path, relativePath, name);

        return Promise.resolve(this.getUploadData(mvData, relativePath, name));
    }

    protected getMaxSizeInKBytes(): number {
        if (this.uploadConfig && this.uploadConfig.rules && this.uploadConfig.rules.sizeInKBytes) {
            return this.uploadConfig.rules.sizeInKBytes;
        }

        if (!this.file?.data) {
            return 0;
        }

        return this.file.data.length;
    }

    protected getAcceptedExt(): string[] {
        if (this.uploadConfig && this.uploadConfig.rules && this.uploadConfig.rules.ext) {
            return this.uploadConfig.rules.ext;
        }

        return [this.ext];
    }

    protected async mv(root: string, path: string, file: string): Promise<any> {
        await UploadUtil.mkdirs(root + path);

        return this.file.mv(root + path + file);
    }

    protected getUploadData(mvData: any, relativePath: string, name: string): any {
        const url: string = this.config.url + relativePath;

        return {
            original: url + name,
            filename: relativePath + name,
            ext: this.ext
        };
    }
}

export default FileUpload;
