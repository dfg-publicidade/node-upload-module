import appDebugger from 'debug';
import { Request } from 'express';
import fs from 'fs-extra';
import sharp, { Sharp } from 'sharp';
import ImageUploadError from '../enums/imageUploadError';
import UploadError from '../enums/uploadError';
import ImageUploadConfig from '../interfaces/imageUploadConfig';
import Upload from '../interfaces/upload';
import FileUpload from './fileUpload';

/* Module */
const debug: appDebugger.IDebugger = appDebugger('module:upload-image');

class ImageUpload extends FileUpload implements Upload {
    public image: Sharp;
    public metadata: any;

    protected uploadConfig: ImageUploadConfig;

    public constructor(config: any, uploadConfig: ImageUploadConfig) {
        super(config, uploadConfig);
    }

    public async init(req: Request): Promise<void> {
        await super.init(req);

        if (this.file) {
            this.image = sharp(this.file.data);
            this.metadata = await this.image.metadata();
        }

        return Promise.resolve();
    }

    public hasImage(): boolean {
        return !!this.file && !!this.image;
    }

    public getImage(): Sharp {
        return this.image;
    }

    public imgValidate(): ImageUploadError {
        const width: number = this.getWidth();
        const height: number = this.getHeight();

        const uploadError: UploadError = this.validate();

        if (uploadError) {
            return uploadError;
        }

        if (!this.image || !this.metadata) {
            debug('File file not received');
            return 'EMPTY_FILE';
        }
        else if (width && this.metadata.width !== width) {
            debug('The file sizes are not correct');
            return 'OUT_OF_DIMENSION';
        }
        else if (height && this.metadata.height !== height) {
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
        const json: any = {};

        const uploadPath: string = this.config.path + this.uploadConfig.dir;
        const uploadUrl: string = this.config.url + this.uploadConfig.dir;

        debug('Uploading file and doing resizes...');

        if (!await fs.pathExists(uploadPath + ref)) {
            debug('Creating upload directory...');
            await fs.mkdirs(uploadPath + ref);
        }

        const width: number = this.getWidth();
        const height: number = this.getHeight();

        debug(`Saving original (${width}x${height})`);

        const name: string = this.uploadConfig.prefix.replace(/\//ig, '_');
        const filename: string = `${ref}/${name}${this.ext}`;

        await this.image.toFile(uploadPath + filename);
        json.original = uploadUrl + filename;
        json.filename = `${this.uploadConfig.dir}/${filename}`;

        if (this.uploadConfig.sizes) {
            for (const size of this.uploadConfig.sizes) {
                debug(`Resizing to: ${size.tag} (${size.width}x${size.height})`);

                const resizedName: string = `${ref}/${name}_${size.tag}${this.ext}`;

                await this.image.resize(size.width, size.height).toFile(uploadPath + resizedName);
                json[size.tag] = uploadUrl + resizedName;
            }
        }

        json.ext = this.ext;

        return Promise.resolve(json);
    }

    protected getExt(): string[] {
        if (this.uploadConfig && this.uploadConfig.rules && this.uploadConfig.rules.ext) {
            return this.uploadConfig.rules.ext;
        }

        return ['.jpg', '.jpeg', '.png'];
    }

    protected getWidth(): number {
        if (this.uploadConfig && this.uploadConfig.rules && this.uploadConfig.rules.width) {
            return this.uploadConfig.rules.width;
        }

        return this.metadata.width;
    }

    protected getHeight(): number {
        if (this.uploadConfig && this.uploadConfig.rules && this.uploadConfig.rules.height) {
            return this.uploadConfig.rules.height;
        }

        return this.metadata.height;
    }
}

export default ImageUpload;
