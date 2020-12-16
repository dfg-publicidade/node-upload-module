import appDebugger from 'debug';
import { UploadedFile } from 'express-fileupload';
import Upload from '../interfaces/upload';
import UploadConfig from '../interfaces/uploadConfig';
import FileUpload from './fileUpload';
declare class GStorageUpload extends FileUpload implements Upload {
    protected config: UploadConfig;
    protected debug: appDebugger.IDebugger;
    protected file: UploadedFile;
    protected ext: string;
    constructor(config: UploadConfig, debug: appDebugger.IDebugger);
    upload(config: any, ref: string): Promise<any>;
}
export default GStorageUpload;
