import AWS, { S3 } from 'aws-sdk';
import appDebugger from 'debug';
import { UploadedFile } from 'express-fileupload';
import sharp from 'sharp';
import CloudImageUploadConfig from '../interfaces/cloudImageUploadConfig';
import CloudUploadConfig from '../interfaces/cloudUploadConfig';
import Upload from '../interfaces/upload';
import S3Uploader from '../s3/s3Uploader';
import ImageUpload from './imageUpload';

/* Module */
const debug: appDebugger.IDebugger = appDebugger('module:upload-s3-image');

class S3ImageUpload extends ImageUpload implements Upload {
    protected uploadConfig: CloudImageUploadConfig;
    private s3: S3;

    public constructor(config: any, uploadConfig: CloudUploadConfig) {
        super(config, uploadConfig);

        if (!config.aws?.key || !config.aws.secret) {
            throw new Error('Cloud authentication data was not provided.');
        }
        if (!uploadConfig.bucket) {
            throw new Error('Cloud config. was not provided.');
        }

        this.s3 = new AWS.S3({
            accessKeyId: config.aws.key,
            secretAccessKey: config.aws.secret
        });
    }

    public async save(ref: string, ext: string, buffer: Buffer): Promise<any> {
        debug('Saving file...');

        this.file = {
            data: buffer
        } as UploadedFile;

        this.image = sharp(buffer);
        this.metadata = await this.image.metadata();

        this.ext = ext;

        return this.upload(ref);
    }

    protected async mv(root: string, path: string, file: string): Promise<any> {
        debug(`Storing file: ${path + file}`);

        return S3Uploader.upload(this.s3, {
            Bucket: this.uploadConfig.bucket,
            Key: path + file,
            Body: await this.image.toBuffer()
        });
    }

    protected getUploadData(mvData: any, relativePath: string, name: string): any {
        const json: any = super.getUploadData(mvData, relativePath, name);
        json.original = mvData.Location;

        return json;
    }
}

export default S3ImageUpload;
