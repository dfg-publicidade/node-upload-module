import AWS, { S3 } from 'aws-sdk';
import appDebugger from 'debug';
import { UploadedFile } from 'express-fileupload';
import CloudUploadConfig from '../interfaces/cloudUploadConfig';
import Upload from '../interfaces/upload';
import S3Uploader from '../s3/s3Uploader';
import FileUpload from './fileUpload';

/* Module */
const debug: appDebugger.IDebugger = appDebugger('module:upload-s3');

class S3Upload extends FileUpload implements Upload {
    protected uploadConfig: CloudUploadConfig;
    protected file: UploadedFile;
    protected ext: string;
    private s3: S3;

    public constructor(config: any, uploadConfig: CloudUploadConfig) {
        super(config, uploadConfig);

        this.s3 = new AWS.S3({
            accessKeyId: this.config.aws.key,
            secretAccessKey: this.config.aws.secret
        });
    }

    public async upload(ref: string): Promise<any> {
        debug('Uploading file...');

        const env: string = (process.env.NODE_ENV !== 'production' ? `${process.env.NODE_ENV}/` : '');

        let name: string = this.uploadConfig.prefix.replace(/\//ig, '_');
        name = `${ref}/${name}${this.ext}`;

        const filepath: string = `${env}${this.uploadConfig.dir}${name}`;

        const data: any = await S3Uploader.upload(this.s3, {
            Bucket: this.uploadConfig.bucket,
            Key: filepath,
            Body: this.file.data
        });

        return Promise.resolve({
            path: filepath,
            filename: name,
            original: data.Location,
            ext: this.ext
        });
    }

    public async save(ref: string, ext: string, buffer: Buffer): Promise<any> {
        debug('Uploading file...');

        const env: string = (process.env.NODE_ENV !== 'production' ? `${process.env.NODE_ENV}/` : '');

        let name: string = this.uploadConfig.prefix.replace(/\//ig, '_');
        name = `${ref}/${name}${ext}`;

        const filepath: string = `${env}${this.uploadConfig.dir}${name}`;

        const data: any = await S3Uploader.upload(this.s3, {
            Bucket: this.uploadConfig.bucket,
            Key: filepath,
            Body: buffer
        });

        return Promise.resolve({
            path: filepath,
            filename: name,
            original: data.Location,
            ext
        });
    }
}

export default S3Upload;
