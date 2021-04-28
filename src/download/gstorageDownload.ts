import { File, Storage } from '@google-cloud/storage';
import appDebugger from 'debug';
import CloudConfig from '../interfaces/cloudConfig';
import FileDownload from './fileDownload';

/* Module */
const debug: appDebugger.IDebugger = appDebugger('module:download-gstorage');

class GStorageDownload extends FileDownload {
    protected config: any;
    protected uploadConfig: CloudConfig;

    public constructor(config: any, uploadConfig: CloudConfig) {
        super();

        if (!config) {
            throw new Error('Application config. was not provided.');
        }
        if (!uploadConfig) {
            throw new Error('Upload config. was not provided.');
        }

        this.config = config;
        this.uploadConfig = uploadConfig;
    }

    public async download(path: string): Promise<Buffer> {
        debug('Downloading file...');

        const storage: Storage = new Storage();

        const bucketFile: File = storage.bucket(this.uploadConfig.bucket).file(path);

        const stream: any = bucketFile.createReadStream();

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

export default GStorageDownload;
