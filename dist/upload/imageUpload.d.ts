import appDebugger from 'debug';
import { Request } from 'express';
import { Sharp } from 'sharp';
import ImageUploadError from '../enums/imageUploadError';
import Upload, { UploadConfig } from './upload';
interface ImageUploadConfig extends UploadConfig {
    dir: string;
    name: string;
    prefix: string;
    rules: {
        width?: number;
        height?: number;
        sizeInKBytes?: number;
        ext?: string[];
    };
    sizes?: {
        tag: string;
        width?: number;
        height?: number;
    }[];
}
declare class ImageUpload extends Upload {
    image: Sharp;
    metadata: any;
    protected config: ImageUploadConfig;
    constructor(config: ImageUploadConfig, debug: appDebugger.IDebugger);
    init(req: Request): Promise<void>;
    hasImage(): boolean;
    imgValidate(): ImageUploadError;
    upload(config: any, ref: string): Promise<any>;
    protected getExt(): string[];
    protected getWidth(): number;
    protected getHeight(): number;
}
export default ImageUpload;
export { ImageUploadConfig };
