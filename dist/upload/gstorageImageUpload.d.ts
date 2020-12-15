import appDebugger from 'debug';
import ImageUploadConfig from '../interfaces/imageUploadConfig';
import Upload from '../interfaces/upload';
import ImageUpload from './imageUpload';
declare class GStorageImageUpload extends ImageUpload implements Upload {
    constructor(config: ImageUploadConfig, debug: appDebugger.IDebugger);
    upload(config: any, ref: string): Promise<any>;
}
export default GStorageImageUpload;
