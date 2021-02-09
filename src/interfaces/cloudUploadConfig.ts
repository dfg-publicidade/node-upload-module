import CloudConfig from './cloudConfig';
import UploadConfig from './uploadConfig';

/* Module */
interface CloudUploadConfig extends UploadConfig, CloudConfig {
}

export default CloudUploadConfig;
