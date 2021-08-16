import { File, Storage } from '@google-cloud/storage';
import appDebugger from 'debug';
import { UploadedFile } from 'express-fileupload';
import mime from 'mime-type/with-db';
import sharp from 'sharp';
import CloudImageUploadConfig from '../interfaces/cloudImageUploadConfig';
import Upload from '../interfaces/upload';
import ImageUpload from './imageUpload';

/* Module */
const debug: appDebugger.IDebugger = appDebugger('module:upload-gstorage-image');

class GStorageImageUpload extends ImageUpload implements Upload {
    protected uploadConfig: CloudImageUploadConfig;

    public async save(ref: string, ext: string, buffer: Buffer): Promise<any> {
        debug('Saving file...');

        this.file = {
            data: buffer
        } as UploadedFile;

        this.image = sharp(buffer);
        this.metadata = await this.image.metadata();

        this.ext = ext;

        return this.upload(ref);
    }

    protected async mv(root: string, path: string, file: string): Promise<any> {
        try {
            debug(`Storing file: ${path + file}`);

            const storage: Storage = new Storage();

            let bucketFile: File = storage.bucket(this.uploadConfig.bucket).file(path + file);

            await bucketFile.delete({ ignoreNotFound: true });

            bucketFile = storage.bucket(this.uploadConfig.bucket).file(path + file);

            const stream: any = bucketFile.createWriteStream({
                metadata: {
                    contentType: mime.lookup(file)
                },
                resumable: false,
                gzip: true
            });

            await stream.write(await this.image.toBuffer());
            await stream.end();

            return new Promise<void>((
                resolve: (data: any) => void
            ): void => {
                stream.on('finish', (): void => {
                    resolve(bucketFile.getMetadata());
                });
            });
        }
        catch (error: any) {
            return Promise.reject(error);
        }
    }

    protected getUploadData(mvData: any, relativePath: string, name: string): any {
        const data: any = mvData[0];

        const json: any = super.getUploadData(mvData, relativePath, name);
        json.original = `https://${data.bucket}/${data.name}`;

        return json;
    }
}

export default GStorageImageUpload;
