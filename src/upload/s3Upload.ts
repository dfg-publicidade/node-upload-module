import AWS, { S3 } from 'aws-sdk';
import appDebugger from 'debug';
import { UploadedFile } from 'express-fileupload';
import CloudUploadConfig from '../interfaces/cloudUploadConfig';
import Upload from '../interfaces/upload';
import S3Uploader from '../s3/s3Uploader';
import FileUpload from './fileUpload';

/* Module */
class S3Upload extends FileUpload implements Upload {
    protected uploadConfig: CloudUploadConfig;
    protected file: UploadedFile;
    protected ext: string;
    private s3: S3;

    public constructor(config: any, uploadConfig: CloudUploadConfig, debug: appDebugger.IDebugger) {
        super(config, uploadConfig, debug);

        this.s3 = new AWS.S3({
            accessKeyId: this.config.aws.key,
            secretAccessKey: this.config.aws.secret
        });
    }

    public async upload(ref: string): Promise<any> {
        const json: any = {};

        const name: string = this.uploadConfig.prefix.replace(/\//ig, '_');

        this.debug('Uploading file...');

        json.ext = this.ext;

        const data: any = await S3Uploader.upload(this.s3, {
            Bucket: this.uploadConfig.bucket,
            Key: (process.env.NODE_ENV !== 'production' ? process.env.NODE_ENV + '/' : '') + this.uploadConfig.dir + ref + '/' + name + this.ext,
            Body: this.file.data
        });

        return Promise.resolve({
            path: (process.env.NODE_ENV !== 'production' ? process.env.NODE_ENV + '/' : '') + this.uploadConfig.dir + ref + '/' + name + this.ext,
            filename: name + this.ext,
            original: data.Location
        });
    }
}

export default S3Upload;
