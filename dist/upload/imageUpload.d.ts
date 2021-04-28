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
    private defaultImage;
    constructor(config: any, uploadConfig: ImageUploadConfig);
    init(req: Request): Promise<void>;
    getImage(): Sharp;
    getMetadata(): any;
    imgValidate(): ImageUploadError;
    upload(ref: string): Promise<any>;
    protected getDefaultWidth(): number;
    protected getDefaultHeight(): number;
    protected getAcceptedExt(): string[];
    protected mv(root: string, path: string, file: string): Promise<any>;
}
export default ImageUpload;
