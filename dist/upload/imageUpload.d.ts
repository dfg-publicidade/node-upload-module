import appDebugger from 'debug';
import { Request } from 'express';
import { Sharp } from 'sharp';
import ImageUploadError from '../enums/imageUploadError';
import ImageUploadConfig from '../interfaces/imageUploadConfig';
import Upload from '../interfaces/upload';
import FileUpload from './fileUpload';
declare class ImageUpload extends FileUpload implements Upload {
    image: Sharp;
    metadata: any;
    protected uploadConfig: ImageUploadConfig;
    constructor(config: any, uploadConfig: ImageUploadConfig, debug: appDebugger.IDebugger);
    init(req: Request): Promise<void>;
    hasImage(): boolean;
    getImage(): Sharp;
    imgValidate(): ImageUploadError;
    upload(ref: string): Promise<any>;
    protected getExt(): string[];
    protected getWidth(): number;
    protected getHeight(): number;
}
export default ImageUpload;
