import AWS, { S3 } from 'aws-sdk';
import appDebugger from 'debug';
import fs from 'fs-extra';
import sharp, { Sharp } from 'sharp';
import CloudImageUploadConfig from '../interfaces/cloudImageUploadConfig';
import Upload from '../interfaces/upload';
import S3Uploader from '../s3/s3Uploader';
import ImageUpload from './imageUpload';

/* Module */
const debug: appDebugger.IDebugger = appDebugger('module:upload-image-s3');

class S3ImageUpload extends ImageUpload implements Upload {
    protected uploadConfig: CloudImageUploadConfig;
    private s3: S3;

    public constructor(config: any, uploadConfig: CloudImageUploadConfig) {
        super(config, uploadConfig);

        this.s3 = new AWS.S3({
            accessKeyId: this.config.aws.key,
            secretAccessKey: this.config.aws.secret
        });
    }

    public async upload(ref: string): Promise<any> {
        debug('Uploading file and doing resizes...');

        const env: string = (process.env.NODE_ENV !== 'production' ? `${process.env.NODE_ENV}/` : '');

        const name: string = this.uploadConfig.prefix.replace(/\//ig, '_');
        const filename: string = `${ref}/${name}${this.ext}`;

        const width: number = this.getWidth();
        const height: number = this.getHeight();

        debug(`Saving original (${width}x${height})`);

        const filepath: string = `${env}${this.uploadConfig.dir}${filename}`;

        let data: any = await S3Uploader.upload(this.s3, {
            Bucket: this.uploadConfig.bucket,
            Key: filepath,
            Body: this.file.data
        });

        const json: any = {};
        json.path = filepath;
        json.filename = filename;
        json.original = data.Location;
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

                data = await S3Uploader.upload(this.s3, {
                    Bucket: this.uploadConfig.bucket,
                    Key: `${env}/${this.uploadConfig.dir}${resizedName}`,
                    Body: fs.readFileSync(resizedPath)
                });

                json[size.tag] = data.Location;
            }
        }

        return Promise.resolve(json);
    }

    public async save(ref: string, ext: string, buffer: Buffer): Promise<any> {
        debug('Uploading file and doing resizes...');

        const env: string = (process.env.NODE_ENV !== 'production' ? `${process.env.NODE_ENV}/` : '');

        const name: string = this.uploadConfig.prefix.replace(/\//ig, '_');
        const filename: string = `${ref}/${name}${ext}`;

        const image: Sharp = sharp(buffer);
        const meta: any = await this.image.metadata();

        this.image = image;
        this.metadata = meta;

        const width: number = this.getWidth();
        const height: number = this.getHeight();

        debug(`Saving original (${width}x${height})`);

        const filepath: string = `${env}${this.uploadConfig.dir}${filename}`;

        let data: any = await S3Uploader.upload(this.s3, {
            Bucket: this.uploadConfig.bucket,
            Key: filepath,
            Body: buffer
        });

        const json: any = {};
        json.path = filepath;
        json.filename = filename;
        json.original = data.Location;
        json.ext = ext;

        if (this.uploadConfig.sizes) {
            for (const size of this.uploadConfig.sizes) {
                debug(`Resizing to: ${size.tag} (${size.width ? size.width : 'auto'}x${size.height ? size.height : 'auto'})`);

                const resizedName: string = `${ref}/${name}_${size.tag}${ext}`;
                const resizedPath: string = `/tmp/${resizedName}`;

                if (!await fs.pathExists(`/tmp/${ref}`)) {
                    debug('Creating upload directory...');
                    await fs.mkdirs(`/tmp/${ref}`);
                }

                await image.resize(size.width, size.height).toFile(resizedPath);

                data = await S3Uploader.upload(this.s3, {
                    Bucket: this.uploadConfig.bucket,
                    Key: `${env}/${this.uploadConfig.dir}${resizedName}`,
                    Body: fs.readFileSync(resizedPath)
                });

                json[size.tag] = data.Location;
            }
        }

        return Promise.resolve(json);
    }
}

export default S3ImageUpload;
