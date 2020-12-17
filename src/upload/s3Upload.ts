import AWS, { S3 } from 'aws-sdk';
import appDebugger from 'debug';
import { UploadedFile } from 'express-fileupload';
import Upload from '../interfaces/upload';
import UploadConfig from '../interfaces/uploadConfig';
import FileUpload from './fileUpload';
import S3Uploader from './s3Uploader';

/* Module */
class S3Upload extends FileUpload implements Upload {
    protected config: UploadConfig;
    protected debug: appDebugger.IDebugger;
    protected file: UploadedFile;
    protected ext: string;

    public constructor(config: UploadConfig, debug: appDebugger.IDebugger) {
        super(config, debug);
    }

    public async upload(config: any, ref: string): Promise<any> {
        const json: any = {};

        const name: string = this.config.prefix.replace(/\//ig, '_');

        this.debug('Uploading file...');

        const s3: S3 = new AWS.S3({
            accessKeyId: config.aws.key,
            secretAccessKey: config.aws.secret
        });

        this.debug('Saving file');

        json.ext = this.ext;

        const data: any = await S3Uploader.upload(s3, {
            Bucket: config.aws.bucket,
            Key: (process.env.NODE_ENV !== 'production' ? process.env.NODE_ENV + '_' : '') + name + '_' + ref + this.ext,
            Body: this.file.data
        });

        return Promise.resolve({
            path: (process.env.NODE_ENV !== 'production' ? process.env.NODE_ENV + '_' : '') + name + '_' + ref + this.ext,
            filename: name + this.ext,
            original: data.Location
        });
    }
}

export default S3Upload;
