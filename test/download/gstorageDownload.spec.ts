import { File, Storage } from '@google-cloud/storage';
import chai, { expect } from 'chai';
import fs from 'fs-extra';
import { after, before, describe, it } from 'mocha';
import { Sharp } from 'sharp';
import { CloudUploadConfig, GStorageDownload, GStorageUpload } from '../../src';
import chaiFiles = require('chai-files');
import sharp = require('sharp');

/* Tests */
chai.use(chaiFiles);

describe('gstorageDownload.ts', (): void => {
    const config: any = {
        upload: {
            fileUpload: {},
            path: __dirname + '/upload-dest/'
        }
    };

    let json: any;

    before(async (): Promise<void> => {
        if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
            throw new Error('GOOGLE_APPLICATION_CREDENTIALS must be set');
        }
        if (!process.env.GCLOUD_TEST_BUCKET) {
            throw new Error('GCLOUD_TEST_BUCKET must be set');
        }

        const buffer: Buffer = await fs.readFile(__dirname + '/../test.png');

        const gstorageUpload: GStorageUpload = new GStorageUpload(config.upload, {
            bucket: process.env.GCLOUD_TEST_BUCKET,
            name: 'file',
            prefix: 'f',
            dir: 'test/'
        } as CloudUploadConfig);

        json = await gstorageUpload.save('ref-1', '.png', buffer);
    });

    after(async (): Promise<void> => {
        const storage: Storage = new Storage();

        const bucketFile: File = storage.bucket(process.env.GCLOUD_TEST_BUCKET).file(json.filename);

        await bucketFile.delete({ ignoreNotFound: true });
    });

    it.skip('1. constructor', async (): Promise<void> => {
        expect((): void => {
            new GStorageDownload(undefined, {} as CloudUploadConfig);
        }).to.throw('Application config. was not provided.');
    });

    it.skip('2. constructor', async (): Promise<void> => {
        expect((): void => {
            new GStorageDownload(config, undefined);
        }).to.throw('Upload config. was not provided.');
    });

    it.skip('3. download', async (): Promise<void> => {
        const gstorageDownload: GStorageDownload = new GStorageDownload(config, {
            bucket: process.env.GCLOUD_TEST_BUCKET
        } as CloudUploadConfig);

        const file: Buffer = await gstorageDownload.download(json.filename);

        const image: Sharp = sharp(file);
        const metadata: any = await image.metadata();

        // eslint-disable-next-line no-magic-numbers
        expect(metadata.width).to.be.eq(600);
        // eslint-disable-next-line no-magic-numbers
        expect(metadata.height).to.be.eq(400);
    });

    it.skip('4. download', async (): Promise<void> => {
        const gstorageDownload: GStorageDownload = new GStorageDownload(config, {
            bucket: process.env.GCLOUD_TEST_BUCKET
        } as CloudUploadConfig);

        let downloadError: any;
        try {
            await gstorageDownload.download('none');
        }
        catch (err: any) {
            downloadError = err;
        }

        expect(downloadError).to.exist;
    });
});
