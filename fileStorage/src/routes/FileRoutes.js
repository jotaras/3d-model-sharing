import express from 'express';
import FileController from '../controllers/FileController.js';
import mongoose from 'mongoose';
import fileService from '../services/FileService.js';
import fileUpload from 'express-fileupload';
import { sign, verifyUrl } from '../services/SignUrlService.js';
import clientCertificateAuth from 'client-certificate-auth-v2';
import config from '../config.js';
import FileExtensionVerifierMiddleware from '../middleware/FileExtensionVerifierMiddleware.js';

const jsonParser = express.json();
const fileRoutes = express.Router();
const controller = new FileController(fileService);
const path = '/filestorage';

const checkAuth = (cert) => {
    return cert.subject.CN === config.domainName;
};

fileRoutes.use(fileUpload({
    createParentPath: true
}));

fileRoutes.use('/',jsonParser);

fileRoutes.use( function(req, res, next){
    if (mongoose.connection.readyState !== 1) {
        throw new Error('database connection problem');
    }
    next();
});

fileRoutes.get(path + '/:name', controller.getFile);

fileRoutes.get(path, controller.getAllFiles);

fileRoutes.post(path, verifyUrl(), FileExtensionVerifierMiddleware, controller.createFile);

fileRoutes.put(path + '/:name', verifyUrl(), FileExtensionVerifierMiddleware, controller.updateFile);

fileRoutes.delete(path + '/:name', verifyUrl(), controller.deleteFile);

fileRoutes.post(path + '/get-signed-url', clientCertificateAuth(checkAuth), sign);

fileRoutes.use(function (err, req, res, next) {
    res.status(500).send(err.message);
});

export default fileRoutes;

