import { Storage } from '@google-cloud/storage';
import appDebugger from 'debug';
import { UploadedFile } from 'express-fileupload';
import mime from 'mime';
import Upload from '../interfaces/Upload';
import UploadConfig from '../interfaces/uploadConfig';
import FileUpload from './fileUpload';

/* Module */
class GStorageUpload extends FileUpload implements Upload {
    protected config: UploadConfig;
    protected debug: appDebugger.IDebugger;
    protected file: UploadedFile;
    protected ext: string;

    public constructor(config: UploadConfig, debug: appDebugger.IDebugger) {
        super(config, debug);
    }

    public async upload(config: any, ref: string): Promise<any> {
        const json: any = {};

        const name: string = this.config.prefix;

        this.debug('Uploading file...');

        const storage: Storage = new Storage();

        this.debug('Saving file');

        json.ext = this.ext;

        const data: any = await storage.bucket(config.storage.uploadBucket).upload(this.file.tempFilePath, {
            destination: (process.env.NODE_ENV !== 'production' ? process.env.NODE_ENV + '/' : '') + name + '/' + ref + this.ext,
            gzip: true,
            contentType: mime.getType(this.file.tempFilePath)
        });

        return Promise.resolve({
            path: (process.env.NODE_ENV !== 'production' ? process.env.NODE_ENV + '/' : '') + name + '/' + ref + this.ext,
            filename: name + this.ext,
            original: 'https://' + data[0].metadata.bucket + '/' + data[0].metadata.name
        });
    }
}

export default GStorageUpload;
