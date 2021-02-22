/// <reference types="node" />
import CloudImageUploadConfig from '../interfaces/cloudImageUploadConfig';
import Upload from '../interfaces/upload';
import ImageUpload from './imageUpload';
declare class S3ImageUpload extends ImageUpload implements Upload {
    protected uploadConfig: CloudImageUploadConfig;
    private s3;
    constructor(config: any, uploadConfig: CloudImageUploadConfig);
    upload(ref: string): Promise<any>;
    save(ref: string, ext: string, buffer: Buffer): Promise<any>;
}
export default S3ImageUpload;
