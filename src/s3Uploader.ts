import { S3 } from 'aws-sdk';
import { ManagedUpload } from 'aws-sdk/clients/s3';

/* Module */
class S3Uploader {
    public static async upload(s3: S3, params: any): Promise<ManagedUpload.SendData> {
        return new Promise<ManagedUpload.SendData>((
            resolve: (data: any) => void,
            reject: (error: any) => void
        ): void => {
            s3.upload(params, (err: any, data: ManagedUpload.SendData): void => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    }
}

export default S3Uploader;
