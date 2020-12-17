import AWS, { S3 } from 'aws-sdk';
import appDebugger from 'debug';
import fs from 'fs-extra';
import ImageUploadConfig from '../interfaces/imageUploadConfig';
import Upload from '../interfaces/upload';
import ImageUpload from './imageUpload';
import S3Uploader from './s3Uploader';

/* Module */
class S3ImageUpload extends ImageUpload implements Upload {
    public constructor(config: ImageUploadConfig, debug: appDebugger.IDebugger) {
        super(config, debug);
    }

    public async upload(config: any, ref: string): Promise<any> {
        const json: any = {};

        const name: string = this.config.prefix.replace(/\//ig, '_');
        const width: number = this.getWidth();
        const height: number = this.getHeight();

        this.debug('Uploading file and doing resizes...');

        const s3: S3 = new AWS.S3({
            accessKeyId: config.aws.key,
            secretAccessKey: config.aws.secret
        });

        this.debug(`Saving original (${width}x${height})`);

        json.ext = this.ext;

        let data: any = await S3Uploader.upload(s3, {
            Bucket: config.aws.bucket,
            Key: (process.env.NODE_ENV !== 'production' ? process.env.NODE_ENV + '_' : '') + name + '_' + ref + this.ext,
            Body: this.file.data
        });

        json.path = ref + this.ext;
        json.filename = name + this.ext;
        json.original = data.Location;

        if (this.config.sizes) {
            for (const size of this.config.sizes) {
                this.debug(`Resizing to: ${size.tag} (${size.width ? size.width : 'auto'}x${size.height ? size.height : 'auto'})`);

                await this.image.resize(size.width, size.height).toFile('/tmp/' + size.tag + this.ext);

                data = await S3Uploader.upload(s3, {
                    Bucket: config.aws.bucket,
                    Key: (process.env.NODE_ENV !== 'production' ? process.env.NODE_ENV + '/' : '') + name + '/' + ref + '_' + size.tag + this.ext,
                    Body: fs.readFileSync('/tmp/' + size.tag + this.ext)
                });

                json[size.tag] = data.Location;
            }
        }

        return Promise.resolve(json);
    }
}

export default S3ImageUpload;
