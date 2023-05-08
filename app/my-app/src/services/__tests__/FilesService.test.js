import authenticationService from '../AuthenticationService';
import fileService from '../FilesService';
import { testModelToCreate } from '../../constants/TestTemplates';
import { MODEL_FILE_NOT_SUPPORTED_ERROR_MESSAGE } from '../../constants/Constants';

const mockResponse = {
    headers: {},
    json: jest.fn(),
    text: jest.fn(),
    ok: true,
    status: 200
};

const errorMessage = 'Error';
const respondedFileKey = 'new key';
const fileKey = 'key';


afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
});

beforeEach(() => {
    jest.spyOn(authenticationService, 'signUrl').mockResolvedValue('signed-url');
});

test('succesffully get model file', async () => {
    const expectedReturn = {
        extension: '.obj',
        file: 'file'
    };
    mockResponse.status = 200;
    mockResponse.headers.get = jest.fn().mockImplementation(() => '"model.obj"');
    mockResponse.ok = true;
    mockResponse.arrayBuffer = jest.fn().mockResolvedValue(expectedReturn.file);

    jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse);
    const response = await fileService.getModelFile(fileKey);
    expect(response).toStrictEqual(expectedReturn);
});

test('when file not supported error should be thrown', async () => {
    mockResponse.status = 200;
    mockResponse.headers.get = jest.fn().mockImplementation(() => '"model.3d"');
    mockResponse.ok = true;

    jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse);
    await expect(fileService.getModelFile(fileKey)).rejects.toThrow(MODEL_FILE_NOT_SUPPORTED_ERROR_MESSAGE);
});

test('succesffully upload new file', async () => {
    mockResponse.status = 200;
    mockResponse.ok = true;
    mockResponse.text = jest.fn().mockResolvedValue(respondedFileKey);

    jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse);
    const response = await fileService.createNewFile(testModelToCreate.file);
    expect(authenticationService.signUrl).toBeCalledWith('POST');
    expect(response).toBe(respondedFileKey);
});


test('error when uploading new file', async () => {
    mockResponse.status = 500;
    mockResponse.ok = false;
    mockResponse.text = jest.fn().mockResolvedValue(errorMessage);

    jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse);
    await expect(fileService.createNewFile(testModelToCreate.file)).rejects.toThrow(errorMessage);
    expect(authenticationService.signUrl).toBeCalledWith('POST');
});


test('error when signing url to create a new file', async () => {
    jest.spyOn(authenticationService, 'signUrl').mockRejectedValue(new Error(errorMessage));
    mockResponse.status = 500;
    mockResponse.ok = false;
    mockResponse.text = jest.fn().mockResolvedValue(errorMessage);

    jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse);
    await expect(fileService.createNewFile(testModelToCreate.file)).rejects.toThrow(errorMessage);
    expect(authenticationService.signUrl).toBeCalledWith('POST');
});

test('successfully update existing file', async () => {
    mockResponse.status = 200;
    mockResponse.ok = true;
    mockResponse.text = jest.fn().mockResolvedValue(respondedFileKey);
    jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse);
    const response = await fileService.updateFile(testModelToCreate.file, fileKey);
    expect(authenticationService.signUrl).toBeCalledWith('PUT', fileKey);
    expect(response).toBe(respondedFileKey);
});

test('error when updating file', async () => {
    mockResponse.status = 500;
    mockResponse.ok = false;
    mockResponse.text = jest.fn().mockResolvedValue(errorMessage);

    jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse);
    await expect(fileService.updateFile(testModelToCreate.file, fileKey)).rejects.toThrow(errorMessage);
    expect(authenticationService.signUrl).toBeCalledWith('PUT', fileKey);
});


test('file deleting', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse);
    await fileService.deleteFile(fileKey);
    expect(authenticationService.signUrl).toBeCalledWith('DELETE', fileKey);
});
