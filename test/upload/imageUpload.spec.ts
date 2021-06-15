import chai, { expect } from 'chai';
import express, { Express, Request, Response } from 'express';
import fileUpload from 'express-fileupload';
import fs from 'fs-extra';
import http from 'http';
import { after, before, describe, it } from 'mocha';
import { Sharp } from 'sharp';
import { ImageUpload, ImageUploadConfig } from '../../src';
import ChaiHttp = require('chai-http');
import chaiFiles = require('chai-files');
import sharp = require('sharp');

/* Tests */
chai.use(ChaiHttp);
chai.use(chaiFiles);

describe('imageUpload.ts', (): void => {
    const config: any = {
        upload: {
            fileUpload: {},
            path: __dirname + '/upload-dest/',
            url: 'http://localhost:3000/'
        }
    };
    let exp: Express;
    let httpServer: http.Server;

    before(async (): Promise<void> => {
        exp = express();
        const port: number = 3000;

        exp.set('port', port);

        httpServer = http.createServer(exp);

        exp.use(fileUpload({}));

        exp.post('/image1', async (req: Request, res: Response): Promise<void> => {
            try {
                const imageUpload: ImageUpload = new ImageUpload(config.upload, {
                    name: 'file',
                    prefix: 'f',
                    rules: {
                        sizeInKBytes: 500,
                        ext: ['.png'],
                        width: 100,
                        height: 100
                    },
                    dir: 'test/'
                } as ImageUploadConfig);

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
                const imageUpload: ImageUpload = new ImageUpload(config.upload, {
                    name: 'file',
                    prefix: 'f',
                    rules: {
                        sizeInKBytes: 500,
                        ext: ['.png'],
                        width: 600,
                        height: 100
                    },
                    dir: 'test/'
                } as ImageUploadConfig);

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
                const imageUpload: ImageUpload = new ImageUpload(config.upload, {
                    name: 'file',
                    prefix: 'f',
                    rules: {
                        sizeInKBytes: 1000,
                        ext: ['.jpg', '.png'],
                        width: 600,
                        height: 400
                    },
                    dir: 'test/'
                } as ImageUploadConfig);

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
                const imageUpload: ImageUpload = new ImageUpload(config.upload, {
                    name: 'file',
                    prefix: 'f',
                    dir: 'test/'
                } as ImageUploadConfig);

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
                const imageUpload: ImageUpload = new ImageUpload(config.upload, {
                    name: 'file',
                    prefix: 'f',
                    dir: 'test/'
                } as ImageUploadConfig);

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
                const imageUpload: ImageUpload = new ImageUpload(config.upload, {
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
                } as ImageUploadConfig);

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
                const imageUpload: ImageUpload = new ImageUpload(config.upload, {
                    name: 'file',
                    prefix: 'f',
                    dir: 'test/',
                    sizes: [{
                        tag: 'sm',
                        width: 400
                    }]
                } as ImageUploadConfig);

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
                const imageUpload: ImageUpload = new ImageUpload(config.upload, {
                    name: 'file',
                    prefix: 'f',
                    dir: 'test/',
                    sizes: [{
                        tag: 'sm',
                        height: 400
                    }]
                } as ImageUploadConfig);

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

        exp.post('/image9', async (req: Request, res: Response): Promise<void> => {
            try {
                const imageUpload: ImageUpload = new ImageUpload(config.upload, {
                    name: 'file',
                    prefix: 'f',
                    dir: 'test/',
                    convertTo: 'jpeg'
                } as ImageUploadConfig);

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

    after(async (): Promise<void> => {
        if (fs.existsSync(__dirname + '/upload-dest')) {
            fs.removeSync(__dirname + '/upload-dest');
        }
        if (fs.existsSync(__dirname + '/../../tmp')) {
            fs.removeSync(__dirname + '/../../tmp');
            fs.mkdirSync(__dirname + '/../../tmp');
        }

        return new Promise<void>((
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
        });
    });

    it('1. init', async (): Promise<void> => {
        const imageUpload: ImageUpload = new ImageUpload(config, {} as ImageUploadConfig);

        const req: Request = {} as Request;

        await imageUpload.init(req);

        expect(imageUpload.hasFile()).to.be.false;
    });

    it('2. init', async (): Promise<void> => {
        const res: ChaiHttp.Response = await chai.request(exp).keepOpen()
            .post('/image1')
            .field('Content-Type', 'multipart/form-data')
            .attach('file', __dirname + '/../test.txt', 'test.txt');

        // eslint-disable-next-line no-magic-numbers
        expect(res).to.have.status(200);
        expect(res.text).to.contain('Cannot upload image');
    });

    it('3. validate', async (): Promise<void> => {
        const res: ChaiHttp.Response = await chai.request(exp).keepOpen()
            .post('/image1')
            .field('Content-Type', 'multipart/form-data');

        // eslint-disable-next-line no-magic-numbers
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('validate').eq('EMPTY_FILE');
    });

    it('4. validate', async (): Promise<void> => {
        const res: ChaiHttp.Response = await chai.request(exp).keepOpen()
            .post('/image1')
            .field('Content-Type', 'multipart/form-data')
            .attach('file', __dirname + '/../test.png', 'test.png');

        // eslint-disable-next-line no-magic-numbers
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('validate').eq('OUT_OF_DIMENSION');
    });

    it('5. validate', async (): Promise<void> => {
        const res: ChaiHttp.Response = await chai.request(exp).keepOpen()
            .post('/image2')
            .field('Content-Type', 'multipart/form-data')
            .attach('file', __dirname + '/../test.png', 'test.png');

        // eslint-disable-next-line no-magic-numbers
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('validate').eq('OUT_OF_DIMENSION');
    });

    it('7. validate', async (): Promise<void> => {
        const res: ChaiHttp.Response = await chai.request(exp).keepOpen()
            .post('/image3')
            .field('Content-Type', 'multipart/form-data')
            .attach('file', __dirname + '/../test2.jpg', 'test2.jpg');

        // eslint-disable-next-line no-magic-numbers
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('validate').eq('INVALID_MODE');
    });

    it('8. validate', async (): Promise<void> => {
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

    it('9. validate', async (): Promise<void> => {
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

    it('10. upload', async (): Promise<void> => {
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
        expect(res.body.upload).to.have.property('original').eq(config.upload.url + 'test/test/ref-1/f.png');
        expect(res.body.upload).to.have.property('filename').eq('test/test/ref-1/f.png');
        expect(res.body.upload).to.have.property('ext').eq('.png');

        expect(chaiFiles.dir(__dirname + '/upload-dest')).to.exist;
        expect(chaiFiles.dir(__dirname + '/upload-dest/test/')).to.exist;

        const image: Sharp = sharp(__dirname + '/upload-dest/' + res.body.upload.filename);
        const metadata: any = await image.metadata();

        // eslint-disable-next-line no-magic-numbers
        expect(metadata.width).to.be.eq(600);
        // eslint-disable-next-line no-magic-numbers
        expect(metadata.height).to.be.eq(400);
    });

    it('11. upload', async (): Promise<void> => {
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
        expect(res.body.upload).to.have.property('original').eq(config.upload.url + 'test/test/ref-1/f.png');
        expect(res.body.upload).to.have.property('filename').eq('test/test/ref-1/f.png');
        expect(res.body.upload).to.have.property('ext').eq('.png');

        expect(res.body.upload.sm).to.have.property('original').eq(config.upload.url + 'test/test/ref-1/f_sm.png');
        expect(res.body.upload.sm).to.have.property('filename').eq('test/test/ref-1/f_sm.png');
        expect(res.body.upload.sm).to.have.property('ext').eq('.png');

        expect(res.body.upload.xs).to.have.property('original').eq(config.upload.url + 'test/test/ref-1/f_xs.png');
        expect(res.body.upload.xs).to.have.property('filename').eq('test/test/ref-1/f_xs.png');
        expect(res.body.upload.xs).to.have.property('ext').eq('.png');

        expect(chaiFiles.dir(__dirname + '/upload-dest')).to.exist;
        expect(chaiFiles.dir(__dirname + '/upload-dest/test/')).to.exist;

        const image: Sharp = sharp(__dirname + '/upload-dest/' + res.body.upload.filename);
        const metadata: any = await image.metadata();

        // eslint-disable-next-line no-magic-numbers
        expect(metadata.width).to.be.eq(600);
        // eslint-disable-next-line no-magic-numbers
        expect(metadata.height).to.be.eq(400);

        const imageSm: Sharp = sharp(__dirname + '/upload-dest/' + res.body.upload.sm.filename);
        const metadataSm: any = await imageSm.metadata();

        // eslint-disable-next-line no-magic-numbers
        expect(metadataSm.width).to.be.eq(400);
        // eslint-disable-next-line no-magic-numbers
        expect(metadataSm.height).to.be.eq(400);

        const imageXs: Sharp = sharp(__dirname + '/upload-dest/' + res.body.upload.xs.filename);
        const metadataXs: any = await imageXs.metadata();

        // eslint-disable-next-line no-magic-numbers
        expect(metadataXs.width).to.be.eq(100);
        // eslint-disable-next-line no-magic-numbers
        expect(metadataXs.height).to.be.eq(100);
    });

    it('12. upload', async (): Promise<void> => {
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
        expect(res.body.upload).to.have.property('original').eq(config.upload.url + 'test/test/ref-1/f.png');
        expect(res.body.upload).to.have.property('filename').eq('test/test/ref-1/f.png');
        expect(res.body.upload).to.have.property('ext').eq('.png');

        expect(chaiFiles.dir(__dirname + '/upload-dest')).to.exist;
        expect(chaiFiles.dir(__dirname + '/upload-dest/test/')).to.exist;

        const image: Sharp = sharp(__dirname + '/upload-dest/' + res.body.upload.filename);
        const metadata: any = await image.metadata();

        // eslint-disable-next-line no-magic-numbers
        expect(metadata.width).to.be.eq(600);
        // eslint-disable-next-line no-magic-numbers
        expect(metadata.height).to.be.eq(400);

        const imageSm: Sharp = sharp(__dirname + '/upload-dest/' + res.body.upload.sm.filename);
        const metadataSm: any = await imageSm.metadata();

        // eslint-disable-next-line no-magic-numbers
        expect(metadataSm.width).to.be.eq(400);
        // eslint-disable-next-line no-magic-numbers
        expect(metadataSm.height).to.be.eq(400);
    });

    it('13. upload', async (): Promise<void> => {
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
        expect(res.body.upload).to.have.property('original').eq(config.upload.url + 'test/test/ref-1/f.png');
        expect(res.body.upload).to.have.property('filename').eq('test/test/ref-1/f.png');
        expect(res.body.upload).to.have.property('ext').eq('.png');

        expect(chaiFiles.dir(__dirname + '/upload-dest')).to.exist;
        expect(chaiFiles.dir(__dirname + '/upload-dest/test/')).to.exist;

        const image: Sharp = sharp(__dirname + '/upload-dest/' + res.body.upload.filename);
        const metadata: any = await image.metadata();

        // eslint-disable-next-line no-magic-numbers
        expect(metadata.width).to.be.eq(600);
        // eslint-disable-next-line no-magic-numbers
        expect(metadata.height).to.be.eq(400);

        const imageSm: Sharp = sharp(__dirname + '/upload-dest/' + res.body.upload.sm.filename);
        const metadataSm: any = await imageSm.metadata();

        // eslint-disable-next-line no-magic-numbers
        expect(metadataSm.width).to.be.eq(400);
        // eslint-disable-next-line no-magic-numbers
        expect(metadataSm.height).to.be.eq(400);
    });

    it('14. upload', async (): Promise<void> => {
        const res: ChaiHttp.Response = await chai.request(exp).keepOpen()
            .post('/image9')
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
        expect(res.body.upload).to.have.property('original').eq(config.upload.url + 'test/test/ref-1/f.jpeg');
        expect(res.body.upload).to.have.property('filename').eq('test/test/ref-1/f.jpeg');
        expect(res.body.upload).to.have.property('ext').eq('.jpeg');

        expect(chaiFiles.dir(__dirname + '/upload-dest')).to.exist;
        expect(chaiFiles.dir(__dirname + '/upload-dest/test/')).to.exist;

        const image: Sharp = sharp(__dirname + '/upload-dest/' + res.body.upload.filename);
        const metadata: any = await image.metadata();

        // eslint-disable-next-line no-magic-numbers
        expect(metadata.width).to.be.eq(600);
        // eslint-disable-next-line no-magic-numbers
        expect(metadata.height).to.be.eq(400);
    });
});
