"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* Module */
class S3Uploader {
    static async upload(s3, params) {
        return new Promise((resolve, reject) => {
            s3.upload(params, (err, data) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    }
}
exports.default = S3Uploader;
