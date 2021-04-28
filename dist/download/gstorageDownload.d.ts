/// <reference types="node" />
import CloudConfig from '../interfaces/cloudConfig';
import FileDownload from './fileDownload';
declare class GStorageDownload extends FileDownload {
    protected config: any;
    protected uploadConfig: CloudConfig;
    constructor(config: any, uploadConfig: CloudConfig);
    download(path: string): Promise<Buffer>;
}
export default GStorageDownload;
