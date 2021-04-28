declare class UploadUtil {
    static getEnv(): string;
    static mkdirs(path: string): Promise<void>;
    static getFileName(prefix: string, ext: string, suffix: string): string;
}
export default UploadUtil;
