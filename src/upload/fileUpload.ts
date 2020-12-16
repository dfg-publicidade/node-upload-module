import appDebugger from 'debug';
import { Request } from 'express';
import { UploadedFile } from 'express-fileupload';
import fs from 'fs-extra';
import path from 'path';
import UploadError from '../enums/uploadError';
import Upload from '../interfaces/upload';
import UploadConfig from '../interfaces/uploadConfig';

/* Module */
const byteToKByteConv: number = 1024;

class FileUpload implements Upload {
    protected dir: string;
    protected config: UploadConfig;
    protected debug: appDebugger.IDebugger;
    protected file: UploadedFile;
    protected ext: string;

    public constructor(config: UploadConfig, debug: appDebugger.IDebugger) {
        this.dir = config && config.dir ? config.dir : undefined;
        this.config = config;
        this.debug = debug;
    }

    public async init(req: Request): Promise<void> {
        if (req.files) {
            this.debug('Parsing uploaded file...');

            const file: UploadedFile | UploadedFile[] = req.files[this.config.name] ? req.files[this.config.name] : undefined;

            this.file = Array.isArray(file) ? file[0] : file;

            if (this.file) {
                this.ext = path.extname(file.name).toLowerCase();
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

    public async upload(config: any, ref: string): Promise<any> {
        const json: any = {};

        const uploadPath: string = config.path + this.dir;
        const uploadUrl: string = config.url + this.dir;

        const name: string = this.config.name;

        this.debug('Uploading file...');

        if (!await fs.pathExists(uploadPath + ref)) {
            this.debug('Creating upload directory...');
            await fs.mkdirs(uploadPath + ref);
        }

        this.debug('Saving file');
        await this.file.mv(uploadPath + ref + '/' + name + this.ext);
        json.original = uploadUrl + ref + '/' + name + this.ext;
        json.filename = this.dir + '/' + ref + '/' + name + this.ext;

        json.ext = this.ext;

        return Promise.resolve(json);
    }

    protected getExt(): string[] {
        if (this.config && this.config.rules && this.config.rules.ext) {
            return this.config.rules.ext;
        }

        return [this.ext];
    }

    protected getSizeInKBytes(): number {
        if (this.config && this.config.rules && this.config.rules.sizeInKBytes) {
            return this.config.rules.sizeInKBytes;
        }

        return this.file.data.length;
    }
}

export default FileUpload;