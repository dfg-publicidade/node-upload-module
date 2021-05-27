import UploadConfig from './uploadConfig';

/* Module */
interface ImageUploadConfig extends UploadConfig {
    rules: {
        width?: number;
        height?: number;
        sizeInKBytes?: number;
        ext?: string[];
    };
    convertTo?: 'jpeg' | 'png' | 'webp';
    webp?: any;
    sizes?: {
        tag: string;
        width?: number;
        height?: number;
    }[];
}

export default ImageUploadConfig;
