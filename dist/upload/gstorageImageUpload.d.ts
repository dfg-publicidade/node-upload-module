/// <reference types="node" />
import CloudImageUploadConfig from '../interfaces/cloudImageUploadConfig';
import Upload from '../interfaces/upload';
import ImageUpload from './imageUpload';
declare class GStorageImageUpload extends ImageUpload implements Upload {
    protected uploadConfig: CloudImageUploadConfig;
    save(ref: string, ext: string, buffer: Buffer): Promise<any>;
    protected mv(root: string, path: string, file: string): Promise<any>;
    protected getUploadData(mvData: any, relativePath: string, name: string): any;
}
export default GStorageImageUpload;
