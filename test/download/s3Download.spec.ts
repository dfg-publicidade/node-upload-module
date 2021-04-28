import AWS from 'aws-sdk';
import chai, { expect } from 'chai';
import fs from 'fs-extra';
import { after, before, describe, it } from 'mocha';
import { Sharp } from 'sharp';
import { CloudUploadConfig, S3Download, S3Upload } from '../../src';
import chaiFiles = require('chai-files');
import sharp = require('sharp');

/* Tests */
chai.use(chaiFiles);

describe('s3Download.ts', (): void => {
    const config: any = {
        aws: {},
        fileUpload: {},
        path: __dirname + '/upload-dest/'
    };

    let json: any;

    before(async (): Promise<void> => {
        if (!process.env.AWS_S3_TEST_BUCKET) {
            throw new Error('AWS_S3_TEST_BUCKET must be set');
        }
        if (!process.env.AWS_S3_TEST_KEY) {
            throw new Error('AWS_S3_TEST_KEY must be set');
        }
        if (!process.env.AWS_S3_TEST_SECRET) {
            throw new Error('AWS_S3_TEST_SECRET must be set');
        }

        config.aws.key = process.env.AWS_S3_TEST_KEY;
        config.aws.secret = process.env.AWS_S3_TEST_SECRET;

        const buffer: Buffer = await fs.readFile(__dirname + '/../test.png');

        const s3Upload: S3Upload = new S3Upload(config, {
            bucket: process.env.AWS_S3_TEST_BUCKET,
            name: 'file',
            prefix: 'f',
            dir: 'test/'
        } as CloudUploadConfig);

        json = await s3Upload.save('ref-1', '.png', buffer);
    });

    after(async (): Promise<void> => {
        const s3: AWS.S3 = new AWS.S3({
            accessKeyId: config.aws.key,
            secretAccessKey: config.aws.secret
        });

        await s3.deleteObject({
            Bucket: process.env.AWS_S3_TEST_BUCKET,
            Key: json.filename
        }).promise();
    });

    it('1. constructor', async (): Promise<void> => {
        expect((): void => {
            new S3Download(undefined, {} as CloudUploadConfig);
        }).to.throw('Application config. was not provided.');
    });

    it('2. constructor', async (): Promise<void> => {
        expect((): void => {
            new S3Download({
                ...config,
                aws: undefined
            }, {} as CloudUploadConfig);
        }).to.throw('Cloud authentication data was not provided.');
    });

    it('3. constructor', async (): Promise<void> => {
        expect((): void => {
            new S3Download({
                ...config,
                aws: {
                    key: config.aws.key
                }
            }, {} as CloudUploadConfig);
        }).to.throw('Cloud authentication data was not provided.');
    });

    it('4. constructor', async (): Promise<void> => {
        expect((): void => {
            new S3Download(config, undefined);
        }).to.throw('Cloud config. was not provided.');
    });

    it('5. constructor', async (): Promise<void> => {
        expect((): void => {
            new S3Download(config, {} as CloudUploadConfig);
        }).to.throw('Cloud config. was not provided.');
    });

    it('3. download', async (): Promise<void> => {
        const s3Download: S3Download = new S3Download(config, {
            bucket: process.env.AWS_S3_TEST_BUCKET
        } as CloudUploadConfig);

        const file: Buffer = await s3Download.download(json.filename);

        const image: Sharp = sharp(file);
        const metadata: any = await image.metadata();

        // eslint-disable-next-line no-magic-numbers
        expect(metadata.width).to.be.eq(600);
        // eslint-disable-next-line no-magic-numbers
        expect(metadata.height).to.be.eq(400);
    });

    it('4. download', async (): Promise<void> => {
        const s3Download: S3Download = new S3Download(config, {
            bucket: process.env.AWS_S3_TEST_BUCKET
        } as CloudUploadConfig);

        let downloadError: any;
        try {
            await s3Download.download('none');
        }
        catch (err: any) {
            downloadError = err;
        }

        expect(downloadError).to.exist;
    });
});
