import { File, Storage } from '@google-cloud/storage';
import { UploadedFile } from 'express-fileupload';
import mime from 'mime-type/with-db';
import CloudUploadConfig from '../interfaces/cloudUploadConfig';
import Upload from '../interfaces/upload';
import FileUpload from './fileUpload';

/* Module */
class GStorageUpload extends FileUpload implements Upload {
    protected uploadConfig: CloudUploadConfig;

    public async save(ref: string, ext: string, buffer: Buffer): Promise<any> {
        this.file = {
            data: buffer
        } as UploadedFile;

        this.ext = ext;

        return this.upload(ref);
    }

    protected async mv(root: string, path: string, file: string): Promise<any> {
        const storage: Storage = new Storage();

        const bucketFile: File = storage.bucket(this.uploadConfig.bucket).file(path + file);

        await bucketFile.delete({ ignoreNotFound: true });

        const stream: any = bucketFile.createWriteStream({
            metadata: {
                contentType: mime.lookup(file)
            },
            resumable: false,
            gzip: true
        });

        await stream.write(this.file.data);
        await stream.end();

        return new Promise<void>((
            resolve: (data: any) => void
        ): void => {
            stream.on('finish', (): void => {
                resolve(bucketFile.getMetadata());
            });
        });
    }

    protected getUploadData(mvData: any, relativePath: string, name: string): any {
        const data: any = mvData[0];

        const json: any = super.getUploadData(mvData, relativePath, name);
        json.original = `https://${data.bucket}/${data.name}`;

        return json;
    }
}

export default GStorageUpload;
