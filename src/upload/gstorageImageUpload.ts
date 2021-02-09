import { Storage } from '@google-cloud/storage';
import appDebugger from 'debug';
import mime from 'mime';
import CloudImageUploadConfig from '../interfaces/cloudImageUploadConfig';
import Upload from '../interfaces/upload';
import ImageUpload from './imageUpload';

/* Module */
class GStorageImageUpload extends ImageUpload implements Upload {
    protected uploadConfig: CloudImageUploadConfig;

    public constructor(config: any, uploadConfig: CloudImageUploadConfig, debug: appDebugger.IDebugger) {
        super(config, uploadConfig, debug);
    }

    public async upload(ref: string): Promise<any> {
        const json: any = {};

        const name: string = this.uploadConfig.prefix;
        const width: number = this.getWidth();
        const height: number = this.getHeight();

        this.debug('Uploading file and doing resizes...');

        const storage: Storage = new Storage();

        this.debug(`Saving original (${width}x${height})`);

        json.ext = this.ext;

        let data: any = await storage.bucket(this.uploadConfig.bucket).upload(this.file.tempFilePath, {
            destination: (process.env.NODE_ENV !== 'production' ? process.env.NODE_ENV + '/' : '') + name + '/' + ref + this.ext,
            gzip: true,
            contentType: mime.lookup(this.file.tempFilePath)
        });

        json.path = (process.env.NODE_ENV !== 'production' ? process.env.NODE_ENV + '/' : '') + name + '/' + ref + this.ext;
        json.filename = name + this.ext;
        json.original = 'https://' + data[0].metadata.bucket + '/' + data[0].metadata.name;

        if (this.uploadConfig.sizes) {
            for (const size of this.uploadConfig.sizes) {
                this.debug(`Resizing to: ${size.tag} (${size.width ? size.width : 'auto'}x${size.height ? size.height : 'auto'})`);

                await this.image.resize(size.width, size.height).toFile('/tmp/' + size.tag + this.ext);

                data = await storage.bucket(this.uploadConfig.bucket).upload('/tmp/' + size.tag + this.ext, {
                    destination: (process.env.NODE_ENV !== 'production' ? process.env.NODE_ENV + '/' : '') + name + '/' + ref + '_' + size.tag + this.ext,
                    gzip: true
                });

                json[size.tag] = 'https://' + data[0].metadata.bucket + '/' + data[0].metadata.name;
            }
        }

        return Promise.resolve(json);
    }
}

export default GStorageImageUpload;
