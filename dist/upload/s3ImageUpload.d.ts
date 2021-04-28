/// <reference types="node" />
import CloudImageUploadConfig from '../interfaces/cloudImageUploadConfig';
import CloudUploadConfig from '../interfaces/cloudUploadConfig';
import Upload from '../interfaces/upload';
import ImageUpload from './imageUpload';
declare class S3ImageUpload extends ImageUpload implements Upload {
    protected uploadConfig: CloudImageUploadConfig;
    private s3;
    constructor(config: any, uploadConfig: CloudUploadConfig);
    save(ref: string, ext: string, buffer: Buffer): Promise<any>;
    protected mv(root: string, path: string, file: string): Promise<any>;
    protected getUploadData(mvData: any, relativePath: string, name: string): any;
}
export default S3ImageUpload;
