import { Storage } from '@google-cloud/storage';
import appDebugger from 'debug';
import CloudConfig from '../interfaces/cloudConfig';
import Download from '../interfaces/download';
import FileDownload from './fileDownload';

/* Module */
class GStorageDownload extends FileDownload implements Download {
    private config: any;
    private cloudConfig: CloudConfig;

    public constructor(config: any, cloudConfig: CloudConfig, debug: appDebugger.IDebugger) {
        super(debug);

        this.config = config;
        this.cloudConfig = cloudConfig;
    }

    public async download(path: string): Promise<any> {
        this.debug('Downloading file...');

        const storage: Storage = new Storage();

        this.debug('Saving file');

        return storage.bucket(this.cloudConfig.bucket).file(path).download();
    }
}

export default GStorageDownload;
