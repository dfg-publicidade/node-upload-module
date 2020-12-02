import UploadError from './uploadError';

/* Module */
type ImageUploadError = UploadError | 'OUT_OF_DIMENSION' | 'INVALID_MODE';

export default ImageUploadError;
