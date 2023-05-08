import File from '../models/File.js';
import config from '../config.js';
import fs from 'fs';
import { Guid } from 'js-guid';
import FileNotFoundError from '../errors/FileNotFoundError.js';
import * as Constants from '../constants/Constants.js';

class FileService{

    async getAllFiles(){
        return File.find({});
    }

    async getFile(fileName){
        const queryResult = await File.findOne({path:{ $regex: `${fileName}`}});

        if (!queryResult){
            throw new FileNotFoundError(Constants.FILE_NOT_FOUND_MESSAGE);
        }

        return queryResult;
    }

    async createFile(file, header){
        const guid = Guid.newGuid();

        const metadata = header;
        metadata['mimetype'] = file.mimetype;
        const dbDocument = new File({
            path: guid,
            metadata: metadata,
            realFileName: file.name,
            createdAt: Date.now()
        });

        file.mv(config.storagePath + guid);
        dbDocument.save();
        return guid.toString();

    }

    async updateFile(fileName, newFile, header){
        const newFileName = newFile.name;
        const queryResult = await File.findOne({path:{ $regex: `${fileName}`}});

        if (!queryResult) {
            throw new FileNotFoundError(Constants.FILE_NOT_FOUND_MESSAGE);
        }

        const metadata = header;
        metadata['mimetype'] = newFile.mimetype;

        newFile.mv(config.storagePath + queryResult.path);

        queryResult.realFileName = newFileName;
        queryResult.updatedAt = Date.now();
        queryResult.metadata = metadata;
        queryResult.save();

        return fileName;
    }

    async deleteFile(fileName){
        const queryResult = await File.findOneAndRemove({path:{ $regex: `${fileName}`}});

        if (!queryResult) {
            throw new FileNotFoundError(Constants.FILE_NOT_FOUND_MESSAGE);
        } else {
            fs.unlink(config.storagePath + queryResult.path, () => true);
        }
        return queryResult;
    }

}
const fileService = new FileService();
export default fileService;
