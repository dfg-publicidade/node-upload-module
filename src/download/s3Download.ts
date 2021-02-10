import AWS, { S3 } from 'aws-sdk';
import appDebugger from 'debug';
import CloudConfig from '../interfaces/cloudConfig';
import Download from '../interfaces/download';
import FileDownload from './fileDownload';

/* Module */
const debug: appDebugger.IDebugger = appDebugger('module:download-s3');

class S3Download extends FileDownload implements Download {
    private config: any;
    private cloudConfig: CloudConfig;

    public constructor(config: any, cloudConfig: CloudConfig) {
        super();

        this.config = config;
        this.cloudConfig = cloudConfig;
    }

    public async download(path: string): Promise<any> {
        debug('Downloading file...');

        const s3: S3 = new AWS.S3({
            accessKeyId: this.config.aws.key,
            secretAccessKey: this.config.aws.secret
        });

        return s3.getObject({
            Bucket: this.cloudConfig.bucket,
            Key: path
        });
    }
}

export default S3Download;
