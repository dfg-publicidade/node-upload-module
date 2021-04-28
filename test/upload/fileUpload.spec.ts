import chai, { expect } from 'chai';
import express, { Express, Request, Response } from 'express';
import fileUpload from 'express-fileupload';
import fs from 'fs-extra';
import http from 'http';
import { after, before, describe, it } from 'mocha';
import { FileUpload, UploadConfig } from '../../src';
import ChaiHttp = require('chai-http');
import chaiFiles = require('chai-files');

/* Tests */
chai.use(ChaiHttp);
chai.use(chaiFiles);

describe('fileUpload.ts', (): void => {
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

        exp.use('/file1', fileUpload({}));

        exp.post('/file1', async (req: Request, res: Response): Promise<void> => {
            try {
                const fileUpload: FileUpload = new FileUpload(config.upload, {
                    name: 'file',
                    prefix: 'f',
                    rules: {
                        sizeInKBytes: 1,
                        ext: ['.txt']
                    },
                    dir: 'test/'
                } as UploadConfig);

                await fileUpload.init(req);

                res.json({
                    hasFile: fileUpload.hasFile(),
                    md5: fileUpload.md5(),
                    validate: fileUpload.validate(),
                    file: fileUpload.getFile()
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

        exp.use('/file2', fileUpload({
            useTempFiles: true
        }));

        exp.post('/file2', async (req: Request, res: Response): Promise<void> => {
            try {
                const fileUpload: FileUpload = new FileUpload({
                    ...config.upload,
                    fileUpload: {
                        useTempFiles: true
                    }
                }, {
                    name: 'file',
                    prefix: 'f',
                    dir: 'test/'
                } as UploadConfig);

                await fileUpload.init(req);

                res.json({
                    hasFile: fileUpload.hasFile(),
                    md5: fileUpload.md5(),
                    validate: fileUpload.validate(),
                    file: fileUpload.getFile()
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

        exp.use('/file3', fileUpload({}));

        exp.post('/file3', async (req: Request, res: Response): Promise<void> => {
            try {
                const fileUpload: FileUpload = new FileUpload(config.upload, {
                    name: 'file',
                    prefix: 'f',
                    dir: 'test/'
                } as UploadConfig);

                await fileUpload.init(req);

                let upload: any;

                if (!fileUpload.validate()) {
                    upload = await fileUpload.upload('ref-1');
                }

                res.json({
                    hasFile: fileUpload.hasFile(),
                    md5: fileUpload.md5(),
                    validate: fileUpload.validate(),
                    file: fileUpload.getFile(),
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
        process.env.NODE_ENV = 'test';

        if (fs.existsSync(__dirname + '/upload-dest')) {
            // fs.removeSync(__dirname + '/upload-dest');
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

    it('1. constructor', async (): Promise<void> => {
        expect((): void => {
            new FileUpload(undefined, {} as UploadConfig);
        }).to.throw('Application config. was not provided.');
    });

    it('2. constructor', async (): Promise<void> => {
        expect((): void => {
            new FileUpload(config, undefined);
        }).to.throw('Upload config. was not provided.');
    });

    it('3. init', async (): Promise<void> => {
        const fileUpload: FileUpload = new FileUpload(config, {} as UploadConfig);

        let uploadError: any;
        try {
            await fileUpload.init(undefined);
        }
        catch (err: any) {
            uploadError = err;
        }

        expect(uploadError).to.exist;
        expect(uploadError.message).to.be.eq('Request was not provided.');
    });

    it('4. init', async (): Promise<void> => {
        const fileUpload: FileUpload = new FileUpload(config, {} as UploadConfig);

        const req: Request = {} as Request;

        await fileUpload.init(req);

        expect(fileUpload.hasFile()).to.be.false;
    });

    it('5. init', async (): Promise<void> => {
        const res: ChaiHttp.Response = await chai.request(exp).keepOpen().post('/file1');

        // eslint-disable-next-line no-magic-numbers
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('hasFile').eq(false);
    });

    it('6. init', async (): Promise<void> => {
        const res: ChaiHttp.Response = await chai.request(exp).keepOpen()
            .post('/file1')
            .field('Content-Type', 'multipart/form-data')
            .attach('invalid', __dirname + '/../test.txt', 'test.txt');

        // eslint-disable-next-line no-magic-numbers
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('hasFile').eq(false);
    });

    it('7. init', async (): Promise<void> => {
        const res: ChaiHttp.Response = await chai.request(exp).keepOpen()
            .post('/file1')
            .field('Content-Type', 'multipart/form-data')
            .attach('invalid', __dirname + '/../test.txt', 'test.txt')
            .attach('invalid', __dirname + '/../test.txt', 'test.txt');

        // eslint-disable-next-line no-magic-numbers
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('hasFile').eq(false);
    });

    it('8. init', async (): Promise<void> => {
        const res: ChaiHttp.Response = await chai.request(exp).keepOpen()
            .post('/file1')
            .field('Content-Type', 'multipart/form-data')
            .attach('file', __dirname + '/../test.txt', 'test.txt');

        // eslint-disable-next-line no-magic-numbers
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('hasFile').eq(true);
        expect(res.body).to.have.property('md5').not.null;
        expect(res.body.file).to.have.property('name').eq('test.txt');
        expect(res.body.file).to.have.property('data');
        expect(res.body.file).to.have.property('size');
        expect(res.body.file).to.have.property('encoding');
        expect(res.body.file).to.have.property('tempFilePath');
        expect(res.body.file).to.have.property('mimetype');
        expect(res.body.file).to.have.property('md5');
    });

    it('9. init', async (): Promise<void> => {
        const res: ChaiHttp.Response = await chai.request(exp).keepOpen()
            .post('/file1')
            .field('Content-Type', 'multipart/form-data')
            .attach('file', __dirname + '/../test.txt', 'test.txt')
            .attach('file', __dirname + '/../test.txt', 'test.txt');

        // eslint-disable-next-line no-magic-numbers
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('hasFile').eq(true);
        expect(res.body).to.have.property('md5').not.null;
        expect(res.body.file).to.have.property('name').eq('test.txt');
        expect(res.body.file).to.have.property('data');
        expect(res.body.file).to.have.property('size');
        expect(res.body.file).to.have.property('encoding');
        expect(res.body.file).to.have.property('tempFilePath');
        expect(res.body.file).to.have.property('mimetype');
        expect(res.body.file).to.have.property('md5');
    });

    it('10. init', async (): Promise<void> => {
        const res: ChaiHttp.Response = await chai.request(exp).keepOpen()
            .post('/file2')
            .field('Content-Type', 'multipart/form-data')
            .attach('file', __dirname + '/../test.txt', 'test.txt');

        // eslint-disable-next-line no-magic-numbers
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('hasFile').eq(true);
        expect(res.body).to.have.property('md5').not.null;
        expect(res.body.file).to.exist;
        expect(res.body.file).to.have.property('name').eq('test.txt');
        expect(res.body.file).to.have.property('data');
        expect(res.body.file).to.have.property('size');
        expect(res.body.file).to.have.property('encoding');
        expect(res.body.file).to.have.property('tempFilePath');
        expect(res.body.file).to.have.property('mimetype');
        expect(res.body.file).to.have.property('md5');
    });

    it('11. validate', async (): Promise<void> => {
        const res: ChaiHttp.Response = await chai.request(exp).keepOpen()
            .post('/file1')
            .field('Content-Type', 'multipart/form-data');

        // eslint-disable-next-line no-magic-numbers
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('validate').eq('EMPTY_FILE');
    });

    it('12. validate', async (): Promise<void> => {
        const res: ChaiHttp.Response = await chai.request(exp).keepOpen()
            .post('/file1')
            .field('Content-Type', 'multipart/form-data')
            .attach('file', __dirname + '/../test2.txt', 'test.txt');

        // eslint-disable-next-line no-magic-numbers
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('validate').eq('FILE_TOO_LARGE');
    });

    it('13. validate', async (): Promise<void> => {
        const res: ChaiHttp.Response = await chai.request(exp).keepOpen()
            .post('/file1')
            .field('Content-Type', 'multipart/form-data')
            .attach('file', __dirname + '/../test3.log', 'test.log');

        // eslint-disable-next-line no-magic-numbers
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('validate').eq('INVALID_EXTENSION');
    });

    it('14. getSizeInKBytes', async (): Promise<void> => {
        const res: ChaiHttp.Response = await chai.request(exp).keepOpen()
            .post('/file2')
            .field('Content-Type', 'multipart/form-data');

        // eslint-disable-next-line no-magic-numbers
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('hasFile').eq(false);
    });

    it('15. upload', async (): Promise<void> => {
        const res: ChaiHttp.Response = await chai.request(exp).keepOpen()
            .post('/file3')
            .field('Content-Type', 'multipart/form-data')
            .attach('file', __dirname + '/../test.txt', 'test.txt');

        // eslint-disable-next-line no-magic-numbers
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('hasFile').eq(true);
        expect(res.body).to.have.property('md5').not.null;
        expect(res.body.file).to.exist;
        expect(res.body.file).to.have.property('name').eq('test.txt');
        expect(res.body.file).to.have.property('data');
        expect(res.body.file).to.have.property('size');
        expect(res.body.file).to.have.property('encoding');
        expect(res.body.file).to.have.property('tempFilePath');
        expect(res.body.file).to.have.property('mimetype');
        expect(res.body.file).to.have.property('md5');
        expect(res.body.upload).to.have.property('original').eq(config.upload.url + 'test/test/ref-1/f.txt');
        expect(res.body.upload).to.have.property('filename').eq('test/test/ref-1/f.txt');
        expect(res.body.upload).to.have.property('ext').eq('.txt');

        expect(chaiFiles.dir(__dirname + '/upload-dest')).to.exist;
        expect(chaiFiles.dir(__dirname + '/upload-dest/test/')).to.exist;
        expect(chaiFiles.file(__dirname + '/upload-dest/test/test/ref-1/f.txt')).to.exist;
    });

    it('16. upload', async (): Promise<void> => {
        process.env.NODE_ENV = 'production';

        const res: ChaiHttp.Response = await chai.request(exp).keepOpen()
            .post('/file3')
            .field('Content-Type', 'multipart/form-data')
            .attach('file', __dirname + '/../test.txt', 'test.txt');

        // eslint-disable-next-line no-magic-numbers
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('hasFile').eq(true);
        expect(res.body).to.have.property('md5').not.null;
        expect(res.body.file).to.exist;
        expect(res.body.file).to.have.property('name').eq('test.txt');
        expect(res.body.file).to.have.property('data');
        expect(res.body.file).to.have.property('size');
        expect(res.body.file).to.have.property('encoding');
        expect(res.body.file).to.have.property('tempFilePath');
        expect(res.body.file).to.have.property('mimetype');
        expect(res.body.file).to.have.property('md5');
        expect(res.body.upload).to.have.property('original').eq(config.upload.url + 'test/ref-1/f.txt');
        expect(res.body.upload).to.have.property('filename').eq('test/ref-1/f.txt');
        expect(res.body.upload).to.have.property('ext').eq('.txt');

        expect(chaiFiles.dir(__dirname + '/upload-dest')).to.exist;
        expect(chaiFiles.file(__dirname + '/upload-dest/test/ref-1/f.txt')).to.exist;

        process.env.NODE_ENV = 'test';
    });
});
