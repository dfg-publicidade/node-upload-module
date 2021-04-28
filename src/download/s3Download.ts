import AWS, { S3 } from 'aws-sdk';
import appDebugger from 'debug';
import CloudConfig from '../interfaces/cloudConfig';
import CloudUploadConfig from '../interfaces/cloudUploadConfig';
import FileDownload from './fileDownload';

/* Module */
const debug: appDebugger.IDebugger = appDebugger('module:download-s3');

class S3Download extends FileDownload {
    private cloudConfig: CloudConfig;
    private s3: S3;

    public constructor(config: any, cloudConfig: CloudUploadConfig) {
        super();

        this.cloudConfig = cloudConfig;

        if (!config) {
            throw new Error('Application config. was not provided.');
        }
        if (!config.aws?.key || !config.aws.secret) {
            throw new Error('Cloud authentication data was not provided.');
        }
        if (!cloudConfig?.bucket) {
            throw new Error('Cloud config. was not provided.');
        }

        this.s3 = new AWS.S3({
            accessKeyId: config.aws.key,
            secretAccessKey: config.aws.secret
        });
    }

    public async download(path: string): Promise<any> {
        debug('Downloading file...');

        const stream: any = this.s3.getObject({
            Bucket: this.cloudConfig.bucket,
            Key: path
        }).createReadStream();

        return new Promise<Buffer>((
            resolve: (buffer: Buffer) => void,
            reject: (err: any) => void
        ): void => {
            const buffer: any = [];

            stream.on('data', (chunk: any): void => {
                buffer.push(chunk);
            });

            stream.on('end', (): void => {
                resolve(Buffer.concat(buffer));
            });

            stream.on('error', (err: any): void => {
                reject(err);
            });
        });
    }
}

export default S3Download;
