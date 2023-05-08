import { SUPPORTED_IMAGE_EXTENSIONS, SUPPORTED_MODEL_EXTENSIONS } from '../config.js';
import { FILE_NOT_SPECIFIED_MESSAGE, NOT_ALLOWED_EXTENSION_ERROR_MESSAGE } from '../constants/Constants.js';

export default function fileSelection(req, res, next) {
    if (!req.files) {
        return res.status(400).send(FILE_NOT_SPECIFIED_MESSAGE);
    }

    for (let key in req.files) {
        const fileName =  req.files[key].name;
        const extension = fileName.substring(fileName.lastIndexOf('.'));
        if(!Object.values(SUPPORTED_IMAGE_EXTENSIONS).includes(extension)
            && !Object.values(SUPPORTED_MODEL_EXTENSIONS).includes(extension)) {
            return res.status(422).send(NOT_ALLOWED_EXTENSION_ERROR_MESSAGE);
        }
    }

    return next();


}