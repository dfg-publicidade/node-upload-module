import appDebugger from 'debug';
import CloudImageUploadConfig from '../interfaces/cloudImageUploadConfig';
import Upload from '../interfaces/upload';
import ImageUpload from './imageUpload';
declare class S3ImageUpload extends ImageUpload implements Upload {
    private s3;
    constructor(config: any, uploadConfig: CloudImageUploadConfig, debug: appDebugger.IDebugger);
    upload(ref: string): Promise<any>;
}
export default S3ImageUpload;
