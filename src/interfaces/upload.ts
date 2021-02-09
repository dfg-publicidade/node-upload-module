import { Request } from 'express';
import { UploadedFile } from 'express-fileupload';
import UploadError from '../enums/uploadError';

/* Module */
interface Upload {
    init(req: Request): Promise<void>;

    hasFile(): boolean;

    getFile(): UploadedFile;

    md5(): string;

    validate(): UploadError;

    upload(ref: string): Promise<any>;
}

export default Upload;
