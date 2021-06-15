import axios, { AxiosResponse } from 'axios';
import chai, { expect } from 'chai';
import express, { Express, Request, Response } from 'express';
import fileUpload from 'express-fileupload';
import fs from 'fs-extra';
import http from 'http';
import { after, before, describe, it } from 'mocha';
import { Sharp } from 'sharp';
import { CloudImageUploadConfig, GStorageImageUpload } from '../../src';
import ChaiHttp = require('chai-http');
import chaiFiles = require('chai-files');
import sharp = require('sharp');

/* Tests */
chai.use(ChaiHttp);
chai.use(chaiFiles);

describe('gstorageImageUpload.ts', (): void => {
    const config: any = {
        upload: {
            fileUpload: {},
            path: __dirname + '/upload-dest/'
        }
    };
    let exp: Express;
    let httpServer: http.Server;

    before(async (): Promise<void> => {
        if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
            throw new Error('GOOGLE_APPLICATION_CREDENTIALS must be set');
        }
        if (!process.env.GCLOUD_TEST_BUCKET) {
            throw new Error('GCLOUD_TEST_BUCKET must be set');
        }

        exp = express();
        const port: number = 3000;

        exp.set('port', port);

        httpServer = http.createServer(exp);

        exp.use(fileUpload({}));

        exp.post('/image1', async (req: Request, res: Response): Promise<void> => {
            try {
                const imageUpload: GStorageImageUpload = new GStorageImageUpload(config.upload, {
                    bucket: process.env.GCLOUD_TEST_BUCKET,
                    name: 'file',
                    prefix: 'f',
                    rules: {
                        sizeInKBytes: 500,
                        ext: ['.png'],
                        width: 100,
                        height: 100
                    },
                    dir: 'test/'
                } as CloudImageUploadConfig);

                await imageUpload.init(req);

                res.json({
                    hasImage: imageUpload.hasFile(),
                    md5: imageUpload.md5(),
                    validate: imageUpload.imgValidate(),
                    file: imageUpload.getFile(),
                    image: imageUpload.getImage(),
                    metadata: imageUpload.getMetadata()
                });
                res.end();
            }
            catch (err) {
                // eslint-disable-next-line no-console
                console.error(err);
                res.write(err.message);
                res.end();
            }
        });

        exp.post('/image2', async (req: Request, res: Response): Promise<void> => {
            try {
                const imageUpload: GStorageImageUpload = new GStorageImageUpload(config.upload, {
                    bucket: process.env.GCLOUD_TEST_BUCKET,
                    name: 'file',
                    prefix: 'f',
                    rules: {
                        sizeInKBytes: 500,
                        ext: ['.png'],
                        width: 600,
                        height: 100
                    },
                    dir: 'test/'
                } as CloudImageUploadConfig);

                await imageUpload.init(req);

                res.json({
                    hasImage: imageUpload.hasFile(),
                    md5: imageUpload.md5(),
                    validate: imageUpload.imgValidate(),
                    file: imageUpload.getFile(),
                    image: imageUpload.getImage(),
                    metadata: imageUpload.getMetadata()
                });
                res.end();
            }
            catch (err) {
                // eslint-disable-next-line no-console
                console.error(err);
                res.write(err.message);
                res.end();
            }
        });

        exp.post('/image3', async (req: Request, res: Response): Promise<void> => {
            try {
                const imageUpload: GStorageImageUpload = new GStorageImageUpload(config.upload, {
                    bucket: process.env.GCLOUD_TEST_BUCKET,
                    name: 'file',
                    prefix: 'f',
                    rules: {
                        sizeInKBytes: 1000,
                        ext: ['.jpg', '.png'],
                        width: 600,
                        height: 400
                    },
                    dir: 'test/'
                } as CloudImageUploadConfig);

                await imageUpload.init(req);

                res.json({
                    hasImage: imageUpload.hasFile(),
                    md5: imageUpload.md5(),
                    validate: imageUpload.imgValidate(),
                    file: imageUpload.getFile(),
                    image: imageUpload.getImage(),
                    metadata: imageUpload.getMetadata()
                });
                res.end();
            }
            catch (err) {
                // eslint-disable-next-line no-console
                console.error(err);
                res.write(err.message);
                res.end();
            }
        });

        exp.post('/image4', async (req: Request, res: Response): Promise<void> => {
            try {
                const imageUpload: GStorageImageUpload = new GStorageImageUpload(config.upload, {
                    bucket: process.env.GCLOUD_TEST_BUCKET,
                    name: 'file',
                    prefix: 'f',
                    dir: 'test/'
                } as CloudImageUploadConfig);

                await imageUpload.init(req);

                res.json({
                    hasImage: imageUpload.hasFile(),
                    md5: imageUpload.md5(),
                    validate: imageUpload.imgValidate(),
                    file: imageUpload.getFile(),
                    image: imageUpload.getImage(),
                    metadata: imageUpload.getMetadata()
                });
                res.end();
            }
            catch (err) {
                // eslint-disable-next-line no-console
                console.error(err);
                res.write(err.message);
                res.end();
            }
        });

        exp.post('/image5', async (req: Request, res: Response): Promise<void> => {
            try {
                const imageUpload: GStorageImageUpload = new GStorageImageUpload(config.upload, {
                    bucket: process.env.GCLOUD_TEST_BUCKET,
                    name: 'file',
                    prefix: 'f',
                    dir: 'test/'
                } as CloudImageUploadConfig);

                await imageUpload.init(req);

                let upload: any;

                if (!imageUpload.imgValidate()) {
                    upload = await imageUpload.upload('ref-1');
                }

                res.json({
                    hasImage: imageUpload.hasFile(),
                    md5: imageUpload.md5(),
                    validate: imageUpload.imgValidate(),
                    file: imageUpload.getFile(),
                    image: imageUpload.getImage(),
                    metadata: imageUpload.getMetadata(),
                    upload
                });
                res.end();
            }
            catch (err) {
                // eslint-disable-next-line no-console
                console.error(err);
                res.write(err.message);
                res.end();
            }
        });

        exp.post('/image6', async (req: Request, res: Response): Promise<void> => {
            try {
                const imageUpload: GStorageImageUpload = new GStorageImageUpload(config.upload, {
                    bucket: process.env.GCLOUD_TEST_BUCKET,
                    name: 'file',
                    prefix: 'f',
                    dir: 'test/',
                    sizes: [{
                        tag: 'sm',
                        width: 400,
                        height: 400
                    }, {
                        tag: 'xs',
                        width: 100,
                        height: 100
                    }]
                } as CloudImageUploadConfig);

                await imageUpload.init(req);

                let upload: any;

                if (!imageUpload.imgValidate()) {
                    upload = await imageUpload.upload('ref-1');
                }

                res.json({
                    hasImage: imageUpload.hasFile(),
                    md5: imageUpload.md5(),
                    validate: imageUpload.imgValidate(),
                    file: imageUpload.getFile(),
                    image: imageUpload.getImage(),
                    metadata: imageUpload.getMetadata(),
                    upload
                });
                res.end();
            }
            catch (err) {
                // eslint-disable-next-line no-console
                console.error(err);
                res.write(err.message);
                res.end();
            }
        });

        exp.post('/image7', async (req: Request, res: Response): Promise<void> => {
            try {
                const imageUpload: GStorageImageUpload = new GStorageImageUpload(config.upload, {
                    bucket: process.env.GCLOUD_TEST_BUCKET,
                    name: 'file',
                    prefix: 'f',
                    dir: 'test/',
                    sizes: [{
                        tag: 'sm',
                        width: 400
                    }]
                } as CloudImageUploadConfig);

                await imageUpload.init(req);

                let upload: any;

                if (!imageUpload.imgValidate()) {
                    upload = await imageUpload.upload('ref-1');
                }

                res.json({
                    hasImage: imageUpload.hasFile(),
                    md5: imageUpload.md5(),
                    validate: imageUpload.imgValidate(),
                    file: imageUpload.getFile(),
                    image: imageUpload.getImage(),
                    metadata: imageUpload.getMetadata(),
                    upload
                });
                res.end();
            }
            catch (err) {
                // eslint-disable-next-line no-console
                console.error(err);
                res.write(err.message);
                res.end();
            }
        });

        exp.post('/image8', async (req: Request, res: Response): Promise<void> => {
            try {
                const imageUpload: GStorageImageUpload = new GStorageImageUpload(config.upload, {
                    bucket: process.env.GCLOUD_TEST_BUCKET,
                    name: 'file',
                    prefix: 'f',
                    dir: 'test/',
                    sizes: [{
                        tag: 'sm',
                        height: 400
                    }]
                } as CloudImageUploadConfig);

                await imageUpload.init(req);

                let upload: any;

                if (!imageUpload.imgValidate()) {
                    upload = await imageUpload.upload('ref-1');
                }

                res.json({
                    hasImage: imageUpload.hasFile(),
                    md5: imageUpload.md5(),
                    validate: imageUpload.imgValidate(),
                    file: imageUpload.getFile(),
                    image: imageUpload.getImage(),
                    metadata: imageUpload.getMetadata(),
                    upload
                });
                res.end();
            }
            catch (err) {
                // eslint-disable-next-line no-console
                console.error(err);
                res.write(err.message);
                res.end();
            }
        });

        return new Promise<void>((
            resolve: () => void
        ): void => {
            httpServer.listen(port, (): void => {
                resolve();
            });
        });
    });

    after(async (): Promise<void> => new Promise<void>((
        resolve: () => void
    ): void => {
        if (httpServer) {
            httpServer.close((): void => {
                resolve();
            });
        }
        else {
            resolve();
        }
    }));

    it('1. validate', async (): Promise<void> => {
        const res: ChaiHttp.Response = await chai.request(exp).keepOpen()
            .post('/image1')
            .field('Content-Type', 'multipart/form-data');

        // eslint-disable-next-line no-magic-numbers
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('validate').eq('EMPTY_FILE');
    });

    it('2. validate', async (): Promise<void> => {
        const res: ChaiHttp.Response = await chai.request(exp).keepOpen()
            .post('/image1')
            .field('Content-Type', 'multipart/form-data')
            .attach('file', __dirname + '/../test.png', 'test.png');

        // eslint-disable-next-line no-magic-numbers
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('validate').eq('OUT_OF_DIMENSION');
    });

    it('3. validate', async (): Promise<void> => {
        const res: ChaiHttp.Response = await chai.request(exp).keepOpen()
            .post('/image2')
            .field('Content-Type', 'multipart/form-data')
            .attach('file', __dirname + '/../test.png', 'test.png');

        // eslint-disable-next-line no-magic-numbers
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('validate').eq('OUT_OF_DIMENSION');
    });

    it('4. validate', async (): Promise<void> => {
        const res: ChaiHttp.Response = await chai.request(exp).keepOpen()
            .post('/image3')
            .field('Content-Type', 'multipart/form-data')
            .attach('file', __dirname + '/../test2.jpg', 'test2.jpg');

        // eslint-disable-next-line no-magic-numbers
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('validate').eq('INVALID_MODE');
    });

    it('5. validate', async (): Promise<void> => {
        const res: ChaiHttp.Response = await chai.request(exp).keepOpen()
            .post('/image3')
            .field('Content-Type', 'multipart/form-data')
            .attach('file', __dirname + '/../test.png', 'test.png');

        // eslint-disable-next-line no-magic-numbers
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('hasImage').eq(true);
        expect(res.body).to.have.property('md5').not.null;
        expect(res.body.file).to.exist;
        expect(res.body.file).to.have.property('name').eq('test.png');
        expect(res.body.file).to.have.property('data');
        expect(res.body.file).to.have.property('size');
        expect(res.body.file).to.have.property('encoding');
        expect(res.body.file).to.have.property('tempFilePath');
        expect(res.body.file).to.have.property('mimetype');
        expect(res.body.file).to.have.property('md5');
        expect(res.body.image).to.exist;
        expect(res.body.metadata).to.exist;
        expect(res.body.metadata).to.have.property('format').eq('png');
    });

    it('6. validate', async (): Promise<void> => {
        const res: ChaiHttp.Response = await chai.request(exp).keepOpen()
            .post('/image4')
            .field('Content-Type', 'multipart/form-data')
            .attach('file', __dirname + '/../test.png', 'test.png');

        // eslint-disable-next-line no-magic-numbers
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('hasImage').eq(true);
        expect(res.body).to.have.property('md5').not.null;
        expect(res.body.file).to.exist;
        expect(res.body.file).to.have.property('name').eq('test.png');
        expect(res.body.file).to.have.property('data');
        expect(res.body.file).to.have.property('size');
        expect(res.body.file).to.have.property('encoding');
        expect(res.body.file).to.have.property('tempFilePath');
        expect(res.body.file).to.have.property('mimetype');
        expect(res.body.file).to.have.property('md5');
        expect(res.body.image).to.exist;
        expect(res.body.metadata).to.exist;
        expect(res.body.metadata).to.have.property('format').eq('png');
    });

    it('7. upload', async (): Promise<void> => {
        const res: ChaiHttp.Response = await chai.request(exp).keepOpen()
            .post('/image5')
            .field('Content-Type', 'multipart/form-data')
            .attach('file', __dirname + '/../test.png', 'test.png');

        // eslint-disable-next-line no-magic-numbers
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('hasImage').eq(true);
        expect(res.body).to.have.property('md5').not.null;
        expect(res.body.file).to.exist;
        expect(res.body.file).to.have.property('name').eq('test.png');
        expect(res.body.file).to.have.property('data');
        expect(res.body.file).to.have.property('size');
        expect(res.body.file).to.have.property('encoding');
        expect(res.body.file).to.have.property('tempFilePath');
        expect(res.body.file).to.have.property('mimetype');
        expect(res.body.file).to.have.property('md5');
        expect(res.body.image).to.exist;
        expect(res.body.metadata).to.exist;
        expect(res.body.metadata).to.have.property('format').eq('png');
        expect(res.body.upload).to.have.property('original');
        expect(res.body.upload).to.have.property('filename').eq('test/test/ref-1/f.png');
        expect(res.body.upload).to.have.property('ext').eq('.png');

        const response: AxiosResponse = await axios({
            method: 'GET',
            url: res.body.upload.original + '?timestamp=' + new Date().getTime(),
            responseType: 'arraybuffer'
        });

        // eslint-disable-next-line no-magic-numbers
        expect(response.status).to.eq(200);

        const image: Sharp = sharp(response.data);
        const metadata: any = await image.metadata();

        // eslint-disable-next-line no-magic-numbers
        expect(metadata.width).to.be.eq(600);
        // eslint-disable-next-line no-magic-numbers
        expect(metadata.height).to.be.eq(400);
    });

    it('8. upload', async (): Promise<void> => {
        const res: ChaiHttp.Response = await chai.request(exp).keepOpen()
            .post('/image6')
            .field('Content-Type', 'multipart/form-data')
            .attach('file', __dirname + '/../test.png', 'test.png');

        // eslint-disable-next-line no-magic-numbers
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('hasImage').eq(true);
        expect(res.body).to.have.property('md5').not.null;
        expect(res.body.file).to.exist;
        expect(res.body.file).to.have.property('name').eq('test.png');
        expect(res.body.file).to.have.property('data');
        expect(res.body.file).to.have.property('size');
        expect(res.body.file).to.have.property('encoding');
        expect(res.body.file).to.have.property('tempFilePath');
        expect(res.body.file).to.have.property('mimetype');
        expect(res.body.file).to.have.property('md5');
        expect(res.body.image).to.exist;
        expect(res.body.metadata).to.exist;
        expect(res.body.metadata).to.have.property('format').eq('png');
        expect(res.body.upload).to.have.property('original');
        expect(res.body.upload).to.have.property('filename').eq('test/test/ref-1/f.png');
        expect(res.body.upload).to.have.property('ext').eq('.png');

        expect(res.body.upload.sm).to.have.property('original');
        expect(res.body.upload.sm).to.have.property('filename').eq('test/test/ref-1/f_sm.png');
        expect(res.body.upload.sm).to.have.property('ext').eq('.png');

        expect(res.body.upload.xs).to.have.property('original');
        expect(res.body.upload.xs).to.have.property('filename').eq('test/test/ref-1/f_xs.png');
        expect(res.body.upload.xs).to.have.property('ext').eq('.png');

        const response: AxiosResponse = await axios({
            method: 'GET',
            url: res.body.upload.original + '?timestamp=' + new Date().getTime(),
            responseType: 'arraybuffer'
        });

        // eslint-disable-next-line no-magic-numbers
        expect(response.status).to.eq(200);

        const image: Sharp = sharp(response.data);
        const metadata: any = await image.metadata();

        // eslint-disable-next-line no-magic-numbers
        expect(metadata.width).to.be.eq(600);
        // eslint-disable-next-line no-magic-numbers
        expect(metadata.height).to.be.eq(400);

        const responseSm: AxiosResponse = await axios({
            method: 'GET',
            url: res.body.upload.sm.original + '?timestamp=' + new Date().getTime(),
            responseType: 'arraybuffer'
        });

        const imageSm: Sharp = sharp(responseSm.data);
        const metadataSm: any = await imageSm.metadata();

        // eslint-disable-next-line no-magic-numbers
        expect(metadataSm.width).to.be.eq(400);
        // eslint-disable-next-line no-magic-numbers
        expect(metadataSm.height).to.be.eq(400);

        const responseXs: AxiosResponse = await axios({
            method: 'GET',
            url: res.body.upload.xs.original + '?timestamp=' + new Date().getTime(),
            responseType: 'arraybuffer'
        });

        const imageXs: Sharp = sharp(responseXs.data);
        const metadataXs: any = await imageXs.metadata();

        // eslint-disable-next-line no-magic-numbers
        expect(metadataXs.width).to.be.eq(100);
        // eslint-disable-next-line no-magic-numbers
        expect(metadataXs.height).to.be.eq(100);
    });

    it('9. upload', async (): Promise<void> => {
        const res: ChaiHttp.Response = await chai.request(exp).keepOpen()
            .post('/image7')
            .field('Content-Type', 'multipart/form-data')
            .attach('file', __dirname + '/../test.png', 'test.png');

        // eslint-disable-next-line no-magic-numbers
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('hasImage').eq(true);
        expect(res.body).to.have.property('md5').not.null;
        expect(res.body.file).to.exist;
        expect(res.body.file).to.have.property('name').eq('test.png');
        expect(res.body.file).to.have.property('data');
        expect(res.body.file).to.have.property('size');
        expect(res.body.file).to.have.property('encoding');
        expect(res.body.file).to.have.property('tempFilePath');
        expect(res.body.file).to.have.property('mimetype');
        expect(res.body.file).to.have.property('md5');
        expect(res.body.image).to.exist;
        expect(res.body.metadata).to.exist;
        expect(res.body.metadata).to.have.property('format').eq('png');
        expect(res.body.upload).to.have.property('original');
        expect(res.body.upload).to.have.property('filename').eq('test/test/ref-1/f.png');
        expect(res.body.upload).to.have.property('ext').eq('.png');

        const response: AxiosResponse = await axios({
            method: 'GET',
            url: res.body.upload.original + '?timestamp=' + new Date().getTime(),
            responseType: 'arraybuffer'
        });

        // eslint-disable-next-line no-magic-numbers
        expect(response.status).to.eq(200);

        const image: Sharp = sharp(response.data);
        const metadata: any = await image.metadata();

        // eslint-disable-next-line no-magic-numbers
        expect(metadata.width).to.be.eq(600);
        // eslint-disable-next-line no-magic-numbers
        expect(metadata.height).to.be.eq(400);

        const responseSm: AxiosResponse = await axios({
            method: 'GET',
            url: res.body.upload.sm.original + '?timestamp=' + new Date().getTime(),
            responseType: 'arraybuffer'
        });

        const imageSm: Sharp = sharp(responseSm.data);
        const metadataSm: any = await imageSm.metadata();

        // eslint-disable-next-line no-magic-numbers
        expect(metadataSm.width).to.be.eq(400);
        // eslint-disable-next-line no-magic-numbers
        expect(metadataSm.height).to.be.eq(267);
    });

    it('10. upload', async (): Promise<void> => {
        const res: ChaiHttp.Response = await chai.request(exp).keepOpen()
            .post('/image8')
            .field('Content-Type', 'multipart/form-data')
            .attach('file', __dirname + '/../test.png', 'test.png');

        // eslint-disable-next-line no-magic-numbers
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('hasImage').eq(true);
        expect(res.body).to.have.property('md5').not.null;
        expect(res.body.file).to.exist;
        expect(res.body.file).to.have.property('name').eq('test.png');
        expect(res.body.file).to.have.property('data');
        expect(res.body.file).to.have.property('size');
        expect(res.body.file).to.have.property('encoding');
        expect(res.body.file).to.have.property('tempFilePath');
        expect(res.body.file).to.have.property('mimetype');
        expect(res.body.file).to.have.property('md5');
        expect(res.body.image).to.exist;
        expect(res.body.metadata).to.exist;
        expect(res.body.metadata).to.have.property('format').eq('png');
        expect(res.body.upload).to.have.property('original');
        expect(res.body.upload).to.have.property('filename').eq('test/test/ref-1/f.png');
        expect(res.body.upload).to.have.property('ext').eq('.png');

        const response: AxiosResponse = await axios({
            method: 'GET',
            url: res.body.upload.original + '?timestamp=' + new Date().getTime(),
            responseType: 'arraybuffer'
        });

        // eslint-disable-next-line no-magic-numbers
        expect(response.status).to.eq(200);

        const image: Sharp = sharp(response.data);
        const metadata: any = await image.metadata();

        // eslint-disable-next-line no-magic-numbers
        expect(metadata.width).to.be.eq(600);
        // eslint-disable-next-line no-magic-numbers
        expect(metadata.height).to.be.eq(400);

        const responseSm: AxiosResponse = await axios({
            method: 'GET',
            url: res.body.upload.sm.original + '?timestamp=' + new Date().getTime(),
            responseType: 'arraybuffer'
        });

        const imageSm: Sharp = sharp(responseSm.data);
        const metadataSm: any = await imageSm.metadata();

        // eslint-disable-next-line no-magic-numbers
        expect(metadataSm.width).to.be.eq(600);
        // eslint-disable-next-line no-magic-numbers
        expect(metadataSm.height).to.be.eq(400);
    });

    it('11. save', async (): Promise<void> => {
        const buffer: Buffer = await fs.readFile(__dirname + '/../test.png');

        const gstorageImageUpload: GStorageImageUpload = new GStorageImageUpload(config.upload, {
            bucket: process.env.GCLOUD_TEST_BUCKET,
            name: 'file',
            prefix: 'f',
            dir: 'test/',
            sizes: [{
                tag: 'sm',
                width: 400,
                height: 400
            }, {
                tag: 'xs',
                width: 100,
                height: 100
            }]
        } as CloudImageUploadConfig);

        const json: any = await gstorageImageUpload.save('ref-1', '.png', buffer);

        expect(json).to.have.property('original');
        expect(json).to.have.property('filename').eq('test/test/ref-1/f.png');
        expect(json).to.have.property('ext').eq('.png');

        const response: AxiosResponse = await axios({
            method: 'GET',
            url: json.original + '?timestamp=' + new Date().getTime(),
            responseType: 'arraybuffer'
        });

        // eslint-disable-next-line no-magic-numbers
        expect(response.status).to.eq(200);

        const responseSm: AxiosResponse = await axios({
            method: 'GET',
            url: json.sm.original + '?timestamp=' + new Date().getTime(),
            responseType: 'arraybuffer'
        });

        const imageSm: Sharp = sharp(responseSm.data);
        const metadataSm: any = await imageSm.metadata();

        // eslint-disable-next-line no-magic-numbers
        expect(metadataSm.width).to.be.eq(400);
        // eslint-disable-next-line no-magic-numbers
        expect(metadataSm.height).to.be.eq(400);

        const responseXs: AxiosResponse = await axios({
            method: 'GET',
            url: json.xs.original + '?timestamp=' + new Date().getTime(),
            responseType: 'arraybuffer'
        });

        const imageXs: Sharp = sharp(responseXs.data);
        const metadataXs: any = await imageXs.metadata();

        // eslint-disable-next-line no-magic-numbers
        expect(metadataXs.width).to.be.eq(100);
        // eslint-disable-next-line no-magic-numbers
        expect(metadataXs.height).to.be.eq(100);
    });
});
