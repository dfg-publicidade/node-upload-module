import AWS, { S3 } from 'aws-sdk';
import appDebugger from 'debug';
import fs from 'fs-extra';
import CloudImageUploadConfig from '../interfaces/cloudImageUploadConfig';
import Upload from '../interfaces/upload';
import S3Uploader from '../s3/s3Uploader';
import ImageUpload from './imageUpload';

/* Module */
const debug: appDebugger.IDebugger = appDebugger('module:upload-image-s3');

class S3ImageUpload extends ImageUpload implements Upload {
    private s3: S3;

    public constructor(config: any, uploadConfig: CloudImageUploadConfig) {
        super(config, uploadConfig);

        this.s3 = new AWS.S3({
            accessKeyId: this.config.aws.key,
            secretAccessKey: this.config.aws.secret
        });
    }

    public async upload(ref: string): Promise<any> {
        const json: any = {};

        const name: string = this.uploadConfig.prefix.replace(/\//ig, '_');
        const width: number = this.getWidth();
        const height: number = this.getHeight();

        debug('Uploading file and doing resizes...');

        debug(`Saving original (${width}x${height})`);

        json.ext = this.ext;

        const env: string = (process.env.NODE_ENV !== 'production' ? `${process.env.NODE_ENV}/` : '');
        const filename: string = `${env}${this.uploadConfig.dir}${ref}/${name}${this.ext}`;

        let data: any = await S3Uploader.upload(this.s3, {
            Bucket: this.config.aws.bucket,
            Key: filename,
            Body: this.file.data
        });

        json.path = filename;
        json.filename = name + this.ext;
        json.original = data.Location;

        if (this.uploadConfig.sizes) {
            for (const size of this.uploadConfig.sizes) {
                debug(`Resizing to: ${size.tag} (${size.width ? size.width : 'auto'}x${size.height ? size.height : 'auto'})`);

                const resizedImagePath: string = `/tmp/${size.tag}${this.ext}`;

                await this.image.resize(size.width, size.height).toFile(resizedImagePath);

                data = await S3Uploader.upload(this.s3, {
                    Bucket: this.config.aws.bucket,
                    Key: `${env}${this.uploadConfig.dir}${ref}/${name}${size.tag}${this.ext}`,
                    Body: fs.readFileSync(resizedImagePath)
                });

                json[size.tag] = data.Location;
            }
        }

        return Promise.resolve(json);
    }
}

export default S3ImageUpload;
