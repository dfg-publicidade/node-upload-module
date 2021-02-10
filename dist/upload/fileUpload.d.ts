import { Request } from 'express';
import { UploadedFile } from 'express-fileupload';
import UploadError from '../enums/uploadError';
import Upload from '../interfaces/upload';
import UploadConfig from '../interfaces/uploadConfig';
declare class FileUpload implements Upload {
    protected config: any;
    protected uploadConfig: UploadConfig;
    protected file: UploadedFile;
    protected ext: string;
    constructor(config: any, uploadConfig: UploadConfig);
    init(req: Request): Promise<void>;
    hasFile(): boolean;
    getFile(): UploadedFile;
    md5(): string;
    validate(): UploadError;
    upload(ref: string): Promise<any>;
    protected getExt(): string[];
    protected getSizeInKBytes(): number;
}
export default FileUpload;
