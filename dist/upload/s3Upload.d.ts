/// <reference types="node" />
import { UploadedFile } from 'express-fileupload';
import CloudUploadConfig from '../interfaces/cloudUploadConfig';
import Upload from '../interfaces/upload';
import FileUpload from './fileUpload';
declare class S3Upload extends FileUpload implements Upload {
    protected uploadConfig: CloudUploadConfig;
    protected file: UploadedFile;
    protected ext: string;
    private s3;
    constructor(config: any, uploadConfig: CloudUploadConfig);
    upload(ref: string): Promise<any>;
    save(ref: string, ext: string, buffer: Buffer): Promise<any>;
}
export default S3Upload;