import CloudConfig from '../interfaces/cloudConfig';
import Download from '../interfaces/download';
import FileDownload from './fileDownload';
declare class GStorageDownload extends FileDownload implements Download {
    private cloudConfig;
    constructor(cloudConfig: CloudConfig);
    download(path: string): Promise<any>;
}
export default GStorageDownload;
