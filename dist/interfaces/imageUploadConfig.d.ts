import UploadConfig from './uploadConfig';
interface ImageUploadConfig extends UploadConfig {
    rules: {
        width?: number;
        height?: number;
        sizeInKBytes?: number;
        ext?: string[];
    };
    convertTo?: 'jpeg' | 'png' | 'webp';
    sizes?: {
        tag: string;
        width?: number;
        height?: number;
    }[];
}
export default ImageUploadConfig;
