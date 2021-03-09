import appDebugger from 'debug';
import { Request } from 'express';
import { UploadedFile } from 'express-fileupload';
import fs from 'fs-extra';
import path from 'path';
import UploadError from '../enums/uploadError';
import Upload from '../interfaces/upload';
import UploadConfig from '../interfaces/uploadConfig';

/* Module */
const debug: appDebugger.IDebugger = appDebugger('module:upload-file');

const byteToKByteConv: number = 1024;

class FileUpload implements Upload {
    protected config: any;
    protected uploadConfig: UploadConfig;
    protected file: UploadedFile;
    protected ext: string;

    public constructor(config: any, uploadConfig: UploadConfig) {
        this.config = config;
        this.uploadConfig = uploadConfig;
    }

    public async init(req: Request): Promise<void> {
        if (req.files) {
            debug('Parsing uploaded file...');

            const file: UploadedFile | UploadedFile[] = req.files[this.uploadConfig.name] ? req.files[this.uploadConfig.name] : undefined;

            this.file = Array.isArray(file) ? file[0] : file;

            if (this.file) {
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
        return this.file.md5;
    }

    public validate(): UploadError {
        const sizeInKBytes: number = this.getSizeInKBytes();
        const ext: string[] = this.getExt();

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

    public async upload(ref: string): Promise<any> {
        const uploadPath: string = this.config.path + this.uploadConfig.dir;

        debug('Uploading file...');

        await this.mkdirs(uploadPath + ref);

        debug('Saving file');

        const name: string = this.uploadConfig.prefix.replace(/\//ig, '_');
        const path: string = `${ref}/${name}${this.ext}`;

        return this.mv(uploadPath + path);
    }

    protected getExt(): string[] {
        if (this.uploadConfig && this.uploadConfig.rules && this.uploadConfig.rules.ext) {
            return this.uploadConfig.rules.ext;
        }

        return [this.ext];
    }

    protected getSizeInKBytes(): number {
        if (this.uploadConfig && this.uploadConfig.rules && this.uploadConfig.rules.sizeInKBytes) {
            return this.uploadConfig.rules.sizeInKBytes;
        }

        return this.file.data.length;
    }

    protected async mkdirs(path: string): Promise<void> {
        if (!await fs.pathExists(path)) {
            debug('Creating upload directory...');
            await fs.mkdirs(path);
        }
    }

    protected async mv(path: string): Promise<any> {
        await this.file.mv(path);

        return Promise.resolve({
            original: this.config.url + this.uploadConfig.dir + path,
            filename: this.uploadConfig.dir + path,
            ext: this.ext
        });
    }
}

export default FileUpload;
