import FileNotFoundError from '../errors/FileNotFoundError.js';
import * as Constants from '../constants/Constants.js';
import config from '../config.js';
export default class FileController {
    constructor(fileService) {
        this.fileService = fileService;
        this.getAllFiles = this.getAllFiles.bind(this);
        this.getFile = this.getFile.bind(this);
        this.createFile = this.createFile.bind(this);
        this.updateFile = this.updateFile.bind(this);
        this.deleteFile = this.deleteFile.bind(this);
    }

    async getAllFiles(req, res) {
        try {
            const queryResult = await this.fileService.getAllFiles();
            res.status(200).send(queryResult);
        } catch (err) {
            res.status(500).send(err.message);
        }
    }

    async getFile(req, res) {
        try {
            const queryResult = await this.fileService.getFile(req.params.name);
            const fileName = queryResult.realFileName;

            res.setHeader('content-type', queryResult.metadata.mimetype);
            res.status(200).download(config.storagePath + queryResult.path, fileName);

        } catch (err) {
            if (err instanceof FileNotFoundError){
                res.status(404).send(err.message);
            } else {
                res.status(500).send(err.message);
            }
        }
    }

    async createFile(req, res) {
        if (!req.files) {
            res.status(400).send(Constants.FILE_NOT_SPECIFIED_MESSAGE);
            return;
        }

        try {
            const file = req.files.file;
            const fileIdentifier = await this.fileService.createFile(file, req.headers);
            res.status(200).send(fileIdentifier);
        } catch (err) {
            res.status(500).send(err.message);
        }
    }

    async updateFile(req, res) {
        if (!req.files) {
            res.status(400).send(Constants.FILE_NOT_SPECIFIED_MESSAGE);
            return;
        }

        try{
            const newFile = req.files.file;
            const fileIdentifier = await this.fileService.updateFile(req.params.name, newFile, req.headers);
            res.status(200).send(fileIdentifier);
        } catch (err) {
            if (err instanceof FileNotFoundError) {
                res.status(404).send(err.message);
            } else {
                res.status(500).send(err.message);
            }
        }
    }

    async deleteFile(req, res) {
        try {
            await this.fileService.deleteFile(req.params.name);
            res.status(200).send(Constants.FILE_DELETED_MESSSAGE);
        } catch (err) {
            if (err instanceof FileNotFoundError) {
                res.status(404).send(err.message);
            } else {
                res.status(500).send(err.message);
            }
        }

    }
}
