import { Storage } from '@google-cloud/storage';
import appDebugger from 'debug';
import fs from 'fs-extra';
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
        debug('Uploading file and doing resizes...');

        const storage: Storage = new Storage();

        const env: string = (process.env.NODE_ENV !== 'production' ? `${process.env.NODE_ENV}/` : '');

        const name: string = this.uploadConfig.prefix.replace(/\//ig, '_');
        const filename: string = `${ref}/${name}${this.ext}`;

        const width: number = this.getWidth();
        const height: number = this.getHeight();

        debug(`Saving original (${width}x${height})`);

        const filepath: string = `${env}${this.uploadConfig.dir}${filename}`;

        let data: any = await storage.bucket(this.uploadConfig.bucket).upload(this.file.tempFilePath, {
            destination: filepath,
            gzip: true,
            contentType: mime.lookup(this.file.tempFilePath)
        });

        const json: any = {};
        json.path = filepath;
        json.filename = filename;
        json.original = `https://${data[0].metadata.bucket}/${data[0].metadata.name}`;
        json.ext = this.ext;

        if (this.uploadConfig.sizes) {
            for (const size of this.uploadConfig.sizes) {
                debug(`Resizing to: ${size.tag} (${size.width ? size.width : 'auto'}x${size.height ? size.height : 'auto'})`);

                const resizedName: string = `${ref}/${name}_${size.tag}${this.ext}`;
                const resizedPath: string = `/tmp/${resizedName}`;

                if (!await fs.pathExists(`/tmp/${ref}`)) {
                    debug('Creating upload directory...');
                    await fs.mkdirs(`/tmp/${ref}`);
                }

                await this.image.resize(size.width, size.height).toFile(resizedPath);

                data = await storage.bucket(this.uploadConfig.bucket).upload(resizedPath, {
                    destination: `${env}/${this.uploadConfig.dir}${resizedName}`,
                    gzip: true
                });

                json[size.tag] = `https://${data[0].metadata.bucket}/${data[0].metadata.name}`;
            }
        }

        return Promise.resolve(json);
    }
}

export default GStorageImageUpload;
