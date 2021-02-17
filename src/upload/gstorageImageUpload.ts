import { Storage } from '@google-cloud/storage';
import appDebugger from 'debug';
import mime from 'mime';
import CloudImageUploadConfig from '../interfaces/cloudImageUploadConfig';
import Upload from '../interfaces/upload';
import ImageUpload from './imageUpload';

/* Module */
const debug: appDebugger.IDebugger = appDebugger('module:upload-image-gstorage');

class GStorageImageUpload extends ImageUpload implements Upload {
    protected uploadConfig: CloudImageUploadConfig;

    public constructor(config: any, uploadConfig: CloudImageUploadConfig) {
        super(config, uploadConfig);
    }

    public async upload(ref: string): Promise<any> {
        const json: any = {};

        const name: string = this.uploadConfig.prefix;
        const width: number = this.getWidth();
        const height: number = this.getHeight();

        debug('Uploading file and doing resizes...');

        const storage: Storage = new Storage();

        debug(`Saving original (${width}x${height})`);

        json.ext = this.ext;

        const env: string = (process.env.NODE_ENV !== 'production' ? `${process.env.NODE_ENV}/` : '');
        const filename: string = `${name}/${ref}${this.ext}`;

        let data: any = await storage.bucket(this.uploadConfig.bucket).upload(this.file.tempFilePath, {
            destination: `${env}${filename}`,
            gzip: true,
            contentType: mime.lookup(this.file.tempFilePath)
        });

        json.path = `${env}${filename}`;
        json.filename = `${name}${this.ext}`;
        json.original = `https://${data[0].metadata.bucket}/${data[0].metadata.name}`;

        if (this.uploadConfig.sizes) {
            for (const size of this.uploadConfig.sizes) {
                debug(`Resizing to: ${size.tag} (${size.width ? size.width : 'auto'}x${size.height ? size.height : 'auto'})`);

                const resizedImagePath: string = `/tmp/${size.tag}${this.ext}`;

                await this.image.resize(size.width, size.height).toFile(resizedImagePath);

                data = await storage.bucket(this.uploadConfig.bucket).upload(resizedImagePath, {
                    destination: `${env}${name}/${ref}_${size.tag}${this.ext}`,
                    gzip: true
                });

                json[size.tag] = `https://${data[0].metadata.bucket}/${data[0].metadata.name}`;
            }
        }

        return Promise.resolve(json);
    }
}

export default GStorageImageUpload;
