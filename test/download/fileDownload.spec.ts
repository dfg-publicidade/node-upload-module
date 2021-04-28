import chai, { expect } from 'chai';
import { describe, it } from 'mocha';
import sharp, { Sharp } from 'sharp';
import { FileDownload } from '../../src';
import chaiFiles = require('chai-files');

/* Tests */
chai.use(chaiFiles);

describe('fileDownload.ts', (): void => {
    it('1. download', async (): Promise<void> => {
        const fileDownload: FileDownload = new FileDownload();

        const buffer: Buffer = await fileDownload.download(__dirname + '/../test.png');

        const image: Sharp = sharp(buffer);
        const metadata: any = await image.metadata();

        // eslint-disable-next-line no-magic-numbers
        expect(metadata.width).to.be.eq(600);
        // eslint-disable-next-line no-magic-numbers
        expect(metadata.height).to.be.eq(400);
    });
});
