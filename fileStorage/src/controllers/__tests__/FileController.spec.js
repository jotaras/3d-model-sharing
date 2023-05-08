import { expect, jest, test } from '@jest/globals';
import fileService from '../../services/FileService.js';
import FileController from '../FileController';
import FileNotFoundError from '../../errors/FileNotFoundError.js';
import * as Constants from '../../constants/Constants.js';



function mockRequest() {
    return {
        body: jest.fn().mockReturnThis(),
        files: jest.fn().mockReturnThis(),
        params: jest.fn().mockReturnThis(),
    };
}

function mockResponse() {
    return {
        send: jest.fn().mockReturnThis(),
        status: jest.fn().mockReturnThis(),
        setHeader: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
    };
}

const returnedDataFromService =
    {
        '_id': '6149eead58d884797b88aabf',
        'path': 'D:\\FilesStorage\\text.txt',
        'realFileName': 'file',
        'metadata': 'metadata',
        'createdAt': '2021-09-21T14:39:41.533Z',
    };

const controller = new FileController(fileService);

beforeEach(() => {
    jest.clearAllMocks();
});

describe('Get all files', () => {
    test('Successfully get all files', async () => {
        fileService.getAllFiles = jest.fn().mockResolvedValue(returnedDataFromService);
        const req = mockRequest();
        const res = mockResponse();

        await controller.getAllFiles(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith(returnedDataFromService);
    });

    test('Happened error, while finding files', async () => {
        fileService.getAllFiles = jest.fn().mockRejectedValue(new Error());

        const req = mockRequest();
        const res = mockResponse();

        await controller.getAllFiles(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
    });
});

describe('GetFile', () => {
    test('Successfully get file', async () => {
        fileService.getFile = jest.fn().mockResolvedValue(returnedDataFromService);

        const req = mockRequest();
        const res = mockResponse();

        await controller.getFile(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('Get file, when happened error, while finding files', async () => {
        fileService.getFile = jest.fn().mockRejectedValue(new Error());

        const req = mockRequest();
        const res = mockResponse();

        await controller.getFile(req, res);
        expect(res.status).toHaveBeenCalledWith(500);

    });

    test('Get file, when file not exists', async () => {
        fileService.getFile = jest.fn().mockRejectedValue(new FileNotFoundError(Constants.FILE_NOT_FOUND_MESSAGE));

        const req = mockRequest();
        const res = mockResponse();

        await controller.getFile(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith(Constants.FILE_NOT_FOUND_MESSAGE);

    });
});


describe('CreateFile', () => {
    test('Successfully create file', async () => {
        fileService.createFile = jest.fn().mockResolvedValue('id');

        const req = mockRequest();
        req.files = {file: 'text.txt'};
        const res = mockResponse();

        await controller.createFile(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith('id');
    });

    test('Create file, whenw happened error with database or file system', async () => {
        fileService.createFile = jest.fn().mockRejectedValue(new Error());

        const req = mockRequest();
        const res = mockResponse();
        req.files = {file: {}};

        await controller.createFile(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
    });

    test('Create file, when file not specified', async () => {
        const req = mockRequest();
        const res = mockResponse();
        req.files = null;

        await controller.createFile(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });
});

describe('UpdateFile', () => {
    test('Successfully update file', async () => {
        fileService.updateFile = jest.fn().mockResolvedValue('id');

        const req = mockRequest();
        const res = mockResponse();

        await controller.updateFile(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith('id');
    });

    test('Update file, when file not specified', async () => {
        const req = mockRequest();
        const res = mockResponse();
        req.files = null;

        await controller.updateFile(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('Update file, when file not exists', async () => {
        fileService.updateFile = jest.fn().mockRejectedValue(new FileNotFoundError(Constants.FILE_NOT_FOUND_MESSAGE));

        const req = mockRequest();
        const res = mockResponse();

        await controller.updateFile(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith(Constants.FILE_NOT_FOUND_MESSAGE);
    });

    test('Update file, when happened error with database or file system', async () => {
        fileService.updateFile = jest.fn().mockRejectedValue(new Error);

        const req = mockRequest();
        const res = mockResponse();

        await controller.updateFile(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
    });
});

describe('DeleteFile', () => {
    test('Successfully delete file', async () => {
        fileService.deleteFile = jest.fn().mockResolvedValue();

        const req = mockRequest();
        const res = mockResponse();

        await controller.deleteFile(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith(Constants.FILE_DELETED_MESSSAGE);
    });

    test('Delete file, when file not exists', async () => {
        fileService.deleteFile = jest.fn().mockRejectedValue(new FileNotFoundError(Constants.FILE_NOT_FOUND_MESSAGE));

        const req = mockRequest();
        const res = mockResponse();

        await controller.deleteFile(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith(Constants.FILE_NOT_FOUND_MESSAGE);
    });

    test('Delete file, when happened error with database or file system', async () => {
        fileService.deleteFile = jest.fn().mockRejectedValue(new Error);

        const req = mockRequest();
        const res = mockResponse();

        await controller.deleteFile(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
    });

});
