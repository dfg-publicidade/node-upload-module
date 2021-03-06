import axios, { AxiosResponse } from 'axios';
import chai, { expect } from 'chai';
import express, { Express, Request, Response } from 'express';
import fileUpload from 'express-fileupload';
import fs from 'fs-extra';
import http from 'http';
import { after, before, describe, it } from 'mocha';
import { CloudUploadConfig, GStorageUpload } from '../../src';
import ChaiHttp = require('chai-http');
import chaiFiles = require('chai-files');

/* Tests */
chai.use(ChaiHttp);
chai.use(chaiFiles);

describe('gstorageUpload.ts', (): void => {
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

        exp.post('/file1', async (req: Request, res: Response): Promise<void> => {
            try {
                const fileUpload: GStorageUpload = new GStorageUpload(config.upload, {
                    bucket: process.env.GCLOUD_TEST_BUCKET,
                    name: 'file',
                    prefix: 'f',
                    dir: 'test/'
                } as CloudUploadConfig);

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

    it('1. upload', async (): Promise<void> => {
        const res: ChaiHttp.Response = await chai.request(exp).keepOpen()
            .post('/file1')
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
        expect(res.body.upload).to.have.property('original');
        expect(res.body.upload).to.have.property('filename').eq('test/test/ref-1/f.txt');
        expect(res.body.upload).to.have.property('ext').eq('.txt');

        const response: AxiosResponse = await axios({
            method: 'GET',
            url: res.body.upload.original + '?timestamp=' + new Date().getTime(),
            responseType: 'arraybuffer'
        });

        // eslint-disable-next-line no-magic-numbers
        expect(response.status).to.eq(200);
    });

    it('2. save', async (): Promise<void> => {
        const buffer: Buffer = await fs.readFile(__dirname + '/../test.txt');

        const gstorageUpload: GStorageUpload = new GStorageUpload(config.upload, {
            bucket: process.env.GCLOUD_TEST_BUCKET,
            name: 'file',
            prefix: 'f',
            dir: 'test/'
        } as CloudUploadConfig);

        const json: any = await gstorageUpload.save('ref-1', '.txt', buffer);

        expect(json).to.have.property('original');
        expect(json).to.have.property('filename').eq('test/test/ref-1/f.txt');
        expect(json).to.have.property('ext').eq('.txt');

        const response: AxiosResponse = await axios({
            method: 'GET',
            url: json.original + '?timestamp=' + new Date().getTime(),
            responseType: 'arraybuffer'
        });

        // eslint-disable-next-line no-magic-numbers
        expect(response.status).to.eq(200);
    });
});
