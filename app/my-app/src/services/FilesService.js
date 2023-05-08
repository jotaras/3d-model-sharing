import { IMAGE_FILE_IS_NOT_ALLOWED_ERROR_MESSAGE, MODEL_FILE_NOT_SUPPORTED_ERROR_MESSAGE } from '../constants/Constants';
import { SUPPORTED_IMAGE_EXTENSIONS, SUPPORTED_MODEL_EXTENSIONS } from '../constants/SystemConstants';
import authenticationService from './AuthenticationService';
import handleError from './ErrorHandler';
import path from 'path';

class FileService {

    constructor() {
        this.getModelFile = this.getModelFile.bind(this);
        this.createNewFile = this.createNewFile.bind(this);
        this.updateFile = this.updateFile.bind(this);
        this.deleteFile = this.deleteFile.bind(this);
        this.getSupportedImageExtension = this.getSupportedImageExtension.bind(this);
        this.getSupportedModelExtension = this.getSupportedModelExtension.bind(this);
    }

    getSupportedImageExtension(fileName) {
        const fileExtension = path.extname(fileName);
        if (Object.values(SUPPORTED_IMAGE_EXTENSIONS).includes(fileExtension)) {
            return fileExtension;
        }
        throw new Error(IMAGE_FILE_IS_NOT_ALLOWED_ERROR_MESSAGE);
    }

    getSupportedModelExtension(fileName) {
        const fileExtension = path.extname(fileName);
        if (Object.values(SUPPORTED_MODEL_EXTENSIONS).includes(fileExtension)) {
            return fileExtension;
        }

        throw new Error(MODEL_FILE_NOT_SUPPORTED_ERROR_MESSAGE);
    }


    async getModelFile(modelKey) {
        return fetch(`/filestorage/${modelKey}`, {
            method: 'GET'
        }).then(handleError)
            .then(async response => {
                const contentDisposition = response.headers.get('content-disposition').replace(/"/gi, '');
                const fileExtension = this.getSupportedModelExtension(contentDisposition);
                return {file: await response.arrayBuffer(), extension: fileExtension};
            });
    }

    async createNewFile(file) {
        const formData = new FormData();
        formData.append('file', file);

        const method = 'POST';
        const signedUrl = await authenticationService.signUrl(method);
        return fetch(signedUrl, {
            method: method,
            body: formData
        }).then(handleError)
            .then(response => {
                return response.text();
            });
    }

    async updateFile(file, oldFile) {
        const formData = new FormData();
        formData.append('file', file);

        const method = 'PUT';
        const signedUrl = await authenticationService.signUrl(method, oldFile);
        return fetch(signedUrl, {
            method: method,
            body: formData
        }).then(handleError)
            .then(response => {
                return response.text();
            });
    }


    async deleteFile(fileKey) {
        const signedUrl = await authenticationService.signUrl('DELETE', fileKey);
        await fetch(signedUrl, {
            method: 'DELETE'
        });
    }
}

const filesService = new FileService();
export default filesService;
