import appDebugger from 'debug';
import Download from '../interfaces/download';
declare class FileDownload implements Download {
    protected debug: appDebugger.IDebugger;
    constructor(debug: appDebugger.IDebugger);
    download(path: string): Promise<any>;
}
export default FileDownload;
