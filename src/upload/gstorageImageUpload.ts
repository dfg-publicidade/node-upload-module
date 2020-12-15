import { Storage } from '@google-cloud/storage';
import appDebugger from 'debug';
import mime from 'mime';
import ImageUploadConfig from '../interfaces/imageUploadConfig';
import Upload from '../interfaces/upload';
import ImageUpload from './imageUpload';

/* Module */
class GStorageImageUpload extends ImageUpload implements Upload {
    public constructor(config: ImageUploadConfig, debug: appDebugger.IDebugger) {
        super(config, debug);
    }

    public async upload(config: any, ref: string): Promise<any> {
        const json: any = {};

        const name: string = this.config.prefix;
        const width: number = this.getWidth();
        const height: number = this.getHeight();

        this.debug('Uploading file and doing resizes...');

        const storage: Storage = new Storage();

        this.debug(`Saving original (${width}x${height})`);

        json.ext = this.ext;

        let data: any = await storage.bucket(config.storage.uploadBucket).upload(this.file.tempFilePath, {
            destination: (process.env.NODE_ENV !== 'production' ? process.env.NODE_ENV + '/' : '') + name + '/' + ref + this.ext,
            gzip: true,
            contentType: mime.getType(this.file.tempFilePath)
        });

        json.path = (process.env.NODE_ENV !== 'production' ? process.env.NODE_ENV + '/' : '') + name + '/' + ref + this.ext;
        json.filename = name + this.ext;
        json.original = 'https://' + data[0].metadata.bucket + '/' + data[0].metadata.name;

        if (this.config.sizes) {
            for (const size of this.config.sizes) {
                this.debug(`Resizing to: ${size.tag} (${size.width ? size.width : 'auto'}x${size.height ? size.height : 'auto'})`);

                await this.image.resize(size.width, size.height).toFile('/tmp/' + size.tag + this.ext);

                data = await storage.bucket(config.storage.uploadBucket).upload('/tmp/' + size.tag + this.ext, {
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
