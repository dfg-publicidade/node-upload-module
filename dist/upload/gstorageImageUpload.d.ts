import CloudImageUploadConfig from '../interfaces/cloudImageUploadConfig';
import Upload from '../interfaces/upload';
import ImageUpload from './imageUpload';
declare class GStorageImageUpload extends ImageUpload implements Upload {
    protected uploadConfig: CloudImageUploadConfig;
    constructor(config: any, uploadConfig: CloudImageUploadConfig);
    upload(ref: string): Promise<any>;
}
export default GStorageImageUpload;
