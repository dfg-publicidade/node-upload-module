import fs from 'fs-extra';

class UploadUtil {
    public static getEnv(): string {
        return (process.env.NODE_ENV !== 'production' ? `${process.env.NODE_ENV}/` : '');
    }

    public static async mkdirs(path: string): Promise<void> {
        if (!await fs.pathExists(path)) {
            await fs.mkdirs(path);
        }
    }

    public static getFileName(prefix: string, ext: string, suffix: string): string {
        return prefix.replace(/\//ig, '_') + (suffix ? `_${suffix}` : '') + ext;
    }
}

export default UploadUtil;
