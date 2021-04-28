/// <reference types="node" />
import CloudUploadConfig from '../interfaces/cloudUploadConfig';
import Upload from '../interfaces/upload';
import FileUpload from './fileUpload';
declare class S3Upload extends FileUpload implements Upload {
    protected uploadConfig: CloudUploadConfig;
    private s3;
    constructor(config: any, uploadConfig: CloudUploadConfig);
    save(ref: string, ext: string, buffer: Buffer): Promise<any>;
    protected mv(root: string, path: string, file: string): Promise<any>;
    protected getUploadData(mvData: any, relativePath: string, name: string): any;
}
export default S3Upload;
