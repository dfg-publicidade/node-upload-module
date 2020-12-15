interface UploadConfig {
    dir?: string;
    name: string;
    prefix: string;
    rules: {
        sizeInKBytes?: number;
        ext?: string[];
    };
}
export default UploadConfig;
