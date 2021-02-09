/* Module */
interface Download {
    download(path: string): Promise<any>;
}

export default Download;
