import appDebugger from 'debug';
import fs from 'fs-extra';
import Download from '../interfaces/download';

/* Module */
class FileDownload implements Download {
    protected debug: appDebugger.IDebugger;

    public constructor(debug: appDebugger.IDebugger) {
        this.debug = debug;
    }

    public async download(path: string): Promise<any> {
        this.debug('Downloading file...');

        return fs.promises.readFile(path);
    }
}

export default FileDownload;
