import appDebugger from 'debug';
import fs from 'fs-extra';

/* Module */
const debug: appDebugger.IDebugger = appDebugger('module:download-file');

class FileDownload {
    public async download(path: string): Promise<any> {
        debug('Downloading file...');

        return fs.promises.readFile(path);
    }
}

export default FileDownload;
