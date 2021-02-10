import CloudConfig from '../interfaces/cloudConfig';
import Download from '../interfaces/download';
import FileDownload from './fileDownload';
declare class S3Download extends FileDownload implements Download {
    private config;
    private cloudConfig;
    constructor(config: any, cloudConfig: CloudConfig);
    download(path: string): Promise<any>;
}
export default S3Download;
