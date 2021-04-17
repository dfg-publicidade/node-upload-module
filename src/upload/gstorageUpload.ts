import { Storage } from '@google-cloud/storage';
import appDebugger from 'debug';
import { UploadedFile } from 'express-fileupload';
import fs from 'fs-extra';
import mime from 'mime-type/with-db';
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

        let tmpPath: string;
        if (this.file.tempFilePath) {
            tmpPath = this.file.tempFilePath;
        }
        else {
            tmpPath = `/tmp/${ref}`;

            if (!await fs.pathExists(tmpPath)) {
                debug('Creating upload directory...');
                await fs.mkdirs(tmpPath);
            }

            await fs.writeFile(tmpPath, this.file.data);
        }

        const data: any = await storage.bucket(this.uploadConfig.bucket).upload(tmpPath, {
            destination: filepath,
            gzip: true,
            contentType: mime.lookup(this.ext) as string
        });

        if (!this.file.tempFilePath) {
            await fs.remove(tmpPath);
        }

        return Promise.resolve({
            path: filepath,
            filename: name,
            original: `https://${data[0].metadata.bucket}/${data[0].metadata.name}`,
            ext: this.ext
        });
    }
}

export default GStorageUpload;
