import UploadConfig from './uploadConfig';
interface ImageUploadConfig extends UploadConfig {
    rules: {
        width?: number;
        height?: number;
        sizeInKBytes?: number;
        ext?: string[];
    };
    sizes?: {
        tag: string;
        width?: number;
        height?: number;
    }[];
}
export default ImageUploadConfig;
