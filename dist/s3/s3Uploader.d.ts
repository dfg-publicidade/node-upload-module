import { S3 } from 'aws-sdk';
import { ManagedUpload } from 'aws-sdk/clients/s3';
declare class S3Uploader {
    static upload(s3: S3, params: any): Promise<ManagedUpload.SendData>;
}
export default S3Uploader;
