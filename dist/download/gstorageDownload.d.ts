/// <reference types="node" />
import CloudUploadConfig from '../interfaces/cloudUploadConfig';
import FileDownload from './fileDownload';
declare class GStorageDownload extends FileDownload {
    protected config: any;
    protected uploadConfig: CloudUploadConfig;
    constructor(config: any, uploadConfig: CloudUploadConfig);
    download(path: string): Promise<Buffer>;
}
export default GStorageDownload;
