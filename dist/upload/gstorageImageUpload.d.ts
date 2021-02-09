import appDebugger from 'debug';
import CloudImageUploadConfig from '../interfaces/cloudImageUploadConfig';
import Upload from '../interfaces/upload';
import ImageUpload from './imageUpload';
declare class GStorageImageUpload extends ImageUpload implements Upload {
    protected uploadConfig: CloudImageUploadConfig;
    constructor(config: any, uploadConfig: CloudImageUploadConfig, debug: appDebugger.IDebugger);
    upload(ref: string): Promise<any>;
}
export default GStorageImageUpload;
