import { Request } from 'express';
import { UploadedFile } from 'express-fileupload';
import UploadError from '../enums/uploadError';
interface Upload {
    init(req: Request): Promise<void>;
    hasFile(): boolean;
    getFile(): UploadedFile;
    md5(): string;
    validate(): UploadError;
    upload(config: any, ref: string): Promise<any>;
}
export default Upload;
