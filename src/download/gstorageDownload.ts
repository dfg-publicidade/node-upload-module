import { Storage } from '@google-cloud/storage';
import appDebugger from 'debug';
import CloudConfig from '../interfaces/cloudConfig';
import Download from '../interfaces/download';
import FileDownload from './fileDownload';

/* Module */
const debug: appDebugger.IDebugger = appDebugger('module:download-gstorage');

class GStorageDownload extends FileDownload implements Download {
    private cloudConfig: CloudConfig;

    public constructor(cloudConfig: CloudConfig) {
        super();
        this.cloudConfig = cloudConfig;
    }

    public async download(path: string): Promise<any> {
        debug('Downloading file...');

        const storage: Storage = new Storage();

        debug('Saving file');

        return storage.bucket(this.cloudConfig.bucket).file(path).download();
    }
}

export default GStorageDownload;
