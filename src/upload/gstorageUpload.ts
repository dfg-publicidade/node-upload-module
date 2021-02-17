import { Storage } from '@google-cloud/storage';
import appDebugger from 'debug';
import { UploadedFile } from 'express-fileupload';
import mime from 'mime';
import CloudUploadConfig from '../interfaces/cloudUploadConfig';
import Upload from '../interfaces/upload';
import FileUpload from './fileUpload';

/* Module */
const debug: appDebugger.IDebugger = appDebugger('module:upload-gstorage');

class GStorageUpload extends FileUpload implements Upload {
    protected uploadConfig: CloudUploadConfig;
    protected file: UploadedFile;
    protected ext: string;

    public constructor(config: any, uploadConfig: CloudUploadConfig) {
        super(config, uploadConfig);
    }

    public async upload(ref: string): Promise<any> {
        const json: any = {};

        const name: string = this.uploadConfig.prefix;

        debug('Uploading file...');

        const storage: Storage = new Storage();

        debug('Saving file');

        json.ext = this.ext;

        const env: string = (process.env.NODE_ENV !== 'production' ? `${process.env.NODE_ENV}/` : '');
        const filename: string = `${env}${this.uploadConfig.dir}${ref}/${name}${this.ext}`;

        const data: any = await storage.bucket(this.uploadConfig.bucket).upload(this.file.tempFilePath, {
            destination: filename,
            gzip: true,
            contentType: mime.lookup(this.file.tempFilePath)
        });

        return Promise.resolve({
            path: filename,
            filename: name + this.ext,
            original: `https://${data[0].metadata.bucket}/${data[0].metadata.name}`
        });
    }
}

export default GStorageUpload;
