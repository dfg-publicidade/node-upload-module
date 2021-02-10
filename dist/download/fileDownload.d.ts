import Download from '../interfaces/download';
declare class FileDownload implements Download {
    download(path: string): Promise<any>;
}
export default FileDownload;
