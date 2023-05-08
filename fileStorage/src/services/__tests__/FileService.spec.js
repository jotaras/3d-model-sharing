import File from '../../models/File.js';
import fs from 'fs';
import fileService from '../FileService.js';
import * as Constants from '../../constants/Constants.js';

jest.mock('../../models/File.js');
jest.mock('fs');


afterEach(() => {
    jest.clearAllMocks();
});

const fakeFile =
    {
        name: 'fakeFile',
        content: 'test',
        mimetype: 'some-type',
        mv: jest.fn()
    };

const fileId = 'randomised_id';

const header = {};

describe('get all files', () => {
    const filesFromDb =
    [
        {
            '_id': '6149eead58d884797b88aabf',
            'path': 'D:\\FilesStorage\\text.txt',
            'metadata': 'metadata',
            'createdAt': '2021-09-21T14:39:41.533Z',
        }
    ];

    test('successfully get files', async () => {
        File.find = jest.fn().mockResolvedValue(filesFromDb);

        const files = await fileService.getAllFiles();
        expect(files).toEqual(filesFromDb);
    });

    test('get files when db is empty', async () => {
        File.find = jest.fn().mockResolvedValue([]);

        const files = await fileService.getAllFiles();
        expect(files).toEqual([]);
    });
});


describe('get file', () => {
    test('successfully get file', async () => {
        File.findOne = jest.fn().mockResolvedValue(fakeFile);

        const files = await fileService.getFile();
        expect(files).toEqual(fakeFile);
    });

    test('get not existing file', async () => {
        File.findOne = jest.fn().mockResolvedValue(null);
        await expect(fileService.getFile()).rejects.toThrow(Constants.FILE_NOT_FOUND_MESSAGE);
    });
});

describe('create file', () => {
    test('successfully create file', async () => {
        File.findOne = jest.fn().mockResolvedValue(null);

        await fileService.createFile(fakeFile, header);
        expect(fakeFile.mv).toBeCalled();
    });

});

describe('update file', () => {
    test('successfully update file', async () => {
        const queryResult = {
            path:'',
            updatedAt: '',
            realFileName: 'file',
            metadata: {},
            save: jest.fn()
        };
        File.findOne = jest.fn().mockImplementationOnce(() => queryResult);

        const returnedId = await fileService.updateFile(fileId, fakeFile, header);
        expect(returnedId).toBe(fileId);
        expect(queryResult.save).toBeCalled();
        expect(fakeFile.mv).toBeCalled();
        expect(queryResult.realFileName).toBe(fakeFile.name);
    });

    test('that doesn\'t exist', async () => {
        File.findOne = jest.fn().mockResolvedValue(null);
        await expect(fileService.updateFile(fileId, fakeFile, header)).rejects.toThrow(Constants.FILE_NOT_FOUND_MESSAGE);
    });

});

describe('delete file', () => {
    test('successfully delete file', async () => {
        fs.unlink = jest.fn();
        File.findOneAndRemove = jest.fn().mockResolvedValue(true);

        await fileService.deleteFile(fileId);
        expect(fs.unlink).toBeCalled();
    });

    test('that doesn\'t exist', async () => {
        File.findOneAndRemove = jest.fn().mockResolvedValue(null);
        await expect(fileService.deleteFile(fileId, fakeFile, header)).rejects.toThrow(Constants.FILE_NOT_FOUND_MESSAGE);
    });

});
