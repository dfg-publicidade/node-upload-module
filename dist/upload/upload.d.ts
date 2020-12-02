import appDebugger from 'debug';
import { Request } from 'express';
import { UploadedFile } from 'express-fileupload';
import UploadError from '../enums/uploadError';
interface UploadConfig {
    dir: string;
    name: string;
    prefix: string;
    rules: {
        sizeInKBytes?: number;
        ext?: string[];
    };
}
declare class Upload {
    protected dir: string;
    protected config: UploadConfig;
    protected debug: appDebugger.IDebugger;
    protected file: UploadedFile;
    protected ext: string;
    constructor(config: UploadConfig, debug: appDebugger.IDebugger);
    init(req: Request): Promise<void>;
    hasFile(): boolean;
    md5(): string;
    validate(): UploadError;
    upload(config: any, ref: string): Promise<any>;
    protected getExt(): string[];
    protected getSizeInKBytes(): number;
}
export default Upload;
export { UploadConfig };
