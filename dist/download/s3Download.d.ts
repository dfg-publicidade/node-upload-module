import CloudConfig from '../interfaces/cloudConfig';
import FileDownload from './fileDownload';
declare class S3Download extends FileDownload {
    private cloudConfig;
    private s3;
    constructor(config: any, cloudConfig: CloudConfig);
    download(path: string): Promise<any>;
}
export default S3Download;
