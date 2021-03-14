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
        debug('Uploading file...');

        const storage: Storage = new Storage();

        const env: string = (process.env.NODE_ENV !== 'production' ? `${process.env.NODE_ENV}/` : '');

        let name: string = this.uploadConfig.prefix.replace(/\//ig, '_');
        name = `${ref}/${name}${this.ext}`;

        const filepath: string = `${env}${this.uploadConfig.dir}${name}`;

        const data: any = await storage.bucket(this.uploadConfig.bucket).upload(this.file.tempFilePath, {
            destination: filepath,
            gzip: true,
            contentType: mime.getType(this.file.tempFilePath)
        });

        return Promise.resolve({
            path: filepath,
            filename: name,
            original: `https://${data[0].metadata.bucket}/${data[0].metadata.name}`,
            ext: this.ext
        });
    }
}

export default GStorageUpload;
