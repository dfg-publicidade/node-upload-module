import appDebugger from 'debug';
import { Request } from 'express';
import sharp, { Sharp } from 'sharp';
import ImageUploadError from '../enums/imageUploadError';
import UploadError from '../enums/uploadError';
import ImageUploadConfig from '../interfaces/imageUploadConfig';
import Upload from '../interfaces/upload';
import FileUpload from './fileUpload';
import UploadUtil from './uploadUtil';

/* Module */
const debug: appDebugger.IDebugger = appDebugger('module:upload-image');

class ImageUpload extends FileUpload implements Upload {
    public image: Sharp;
    public metadata: any;

    protected uploadConfig: ImageUploadConfig;

    private defaultImage: Sharp;

    public constructor(config: any, uploadConfig: ImageUploadConfig) {
        super(config, uploadConfig);
    }

    public async init(req: Request): Promise<void> {
        await super.init(req);

        if (this.hasFile()) {
            try {
                this.image = sharp(this.getFile().data);
                this.metadata = await this.image.metadata();
            }
            catch (err: any) {
                throw new Error(`Cannot upload image. ${err}`);
            }
        }

        return Promise.resolve();
    }

    public getImage(): Sharp {
        return this.image;
    }

    public getMetadata(): any {
        return this.metadata;
    }

    public imgValidate(): ImageUploadError {
        const uploadError: UploadError = this.validate();

        if (uploadError) {
            return uploadError;
        }

        const defaultWidth: number = this.getDefaultWidth();
        const defaultHeight: number = this.getDefaultHeight();

        if (defaultWidth && this.metadata.width !== defaultWidth) {
            debug('The file sizes are not correct');
            return 'OUT_OF_DIMENSION';
        }
        else if (defaultHeight && this.metadata.height !== defaultHeight) {
            debug('The file sizes are not correct');
            return 'OUT_OF_DIMENSION';
        }
        else if (this.metadata.space !== 'rgb' && this.metadata.space !== 'srgb') {
            debug('The color mode is not correct');
            return 'INVALID_MODE';
        }

        debug('Image accepted');

        return undefined;
    }

    public async upload(ref: string): Promise<any> {
        debug('Uploading file and doing resizes...');

        const width: number = this.metadata.width;
        const height: number = this.metadata.height;

        debug(`Saving original (${width}x${height})`);

        const json: any = await super.upload(ref);

        if (this.uploadConfig.convertTo) {
            this.ext = `.${this.uploadConfig.convertTo}`;
            this.image = this.image.toFormat(this.uploadConfig.convertTo);
        }

        if (this.uploadConfig.sizes) {
            for (const size of this.uploadConfig.sizes) {
                const sizeWidth: any = size.width ? size.width : 'auto';
                const sizeHeight: any = size.height ? size.height : 'auto';

                debug(`Resizing to: ${size.tag} (${sizeWidth}x${sizeHeight})`);

                this.defaultImage = this.image;
                this.suffix = size.tag;

                this.image = this.image.resize(size.width, size.height);

                json[size.tag] = await super.upload(ref);

                this.image = this.defaultImage;
                this.suffix = undefined;
            }
        }

        return Promise.resolve(json);
    }

    protected getDefaultWidth(): number {
        if (this.uploadConfig && this.uploadConfig.rules && this.uploadConfig.rules.width) {
            return this.uploadConfig.rules.width;
        }

        return this.metadata.width;
    }

    protected getDefaultHeight(): number {
        if (this.uploadConfig && this.uploadConfig.rules && this.uploadConfig.rules.height) {
            return this.uploadConfig.rules.height;
        }

        return this.metadata.height;
    }

    protected getAcceptedExt(): string[] {
        if (this.uploadConfig && this.uploadConfig.rules && this.uploadConfig.rules.ext) {
            return this.uploadConfig.rules.ext;
        }

        return ['.jpg', '.jpeg', '.png', '.webp'];
    }

    protected async mv(root: string, path: string, file: string): Promise<any> {
        debug(`Storing file: ${root + path + file}`);

        await UploadUtil.mkdirs(root + path);

        return this.image.toFile(root + path + file);
    }
}

export default ImageUpload;
