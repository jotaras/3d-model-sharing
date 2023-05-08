import { jest } from '@jest/globals';
import { testModelHistory, testModels, testTags, testTokens } from '../../constants/TestTemplates';
import authenticationService from '../AuthenticationService';
import fileService from '../FilesService';
import modelsService from '../ModelsService';

const testModelFile = 'file';
const testModelPreview = 'preview';
const mockResponse = {
    json: jest.fn(),
    text: jest.fn(),
    ok: true,
    statusText: 'Error',
    status: 200
};

afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
});

describe('getting all models', () => {
    const getModelsError = 'Failed to get all models';
    test('successfully get models', async () => {
        mockResponse.json = jest.fn().mockResolvedValue(testModels);
        jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse);
        const models = await modelsService.getAllModels();
        expect(models).toBe(testModels);
    });

    test('should return error', async () => {
        mockResponse.ok = false;
        mockResponse.status = 500;
        mockResponse.text = jest.fn().mockResolvedValue(getModelsError);
        jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse);
        await expect(modelsService.getAllModels()).rejects.toThrow(getModelsError);
    });
});

describe('getting models history', () => {
    const getModelHistoryError = 'Failed to get model history';
    test('successfull, should return history', async () => {
        mockResponse.ok = true;
        mockResponse.status = 200;
        mockResponse.json = jest.fn().mockResolvedValue(testModelHistory);
        jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse);
        const history = await modelsService.getModelHistory(testModels[0].modelId);
        expect(history).toBe(testModelHistory);
    });

    test('should throw error', async () => {
        mockResponse.ok = false;
        mockResponse.status = 500;
        mockResponse.text = jest.fn().mockResolvedValue(getModelHistoryError);
        jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse);
        await expect(modelsService.getModelHistory(testModels[0].modelId)).rejects.toThrow(getModelHistoryError);
    });
});

describe('model creating', () => {
    const createModelError = 'Failed to create model';
    beforeEach(() => {
        jest.spyOn(fileService, 'createNewFile').mockResolvedValueOnce(testModels[0].fileKey).mockResolvedValue(testModels[0].previewBlobKey);
        jest.spyOn(fileService, 'deleteFile').mockResolvedValue('deleted');
        jest.spyOn(authenticationService, 'getAccessToken').mockResolvedValue(testTokens.accessToken);
    });

    test('should return model, and upload file should be called', async () => {
        mockResponse.ok = true;
        mockResponse.status = 200;
        mockResponse.json = jest.fn().mockResolvedValue(testModels[0]);
        jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse);
        const createdModel = await modelsService.createNewModel(testModels[0], testModelFile);
        expect(createdModel).toBe(testModels[0]);
        expect(fileService.createNewFile).toBeCalledTimes(1);
        expect(fileService.createNewFile).toBeCalledWith(testModelFile);
        expect(fileService.createNewFile).not.toBeCalledWith(testModelPreview);
    });

    test('create model with preview, upload file should be called', async () => {
        mockResponse.ok = true;
        mockResponse.status = 200;
        mockResponse.json = jest.fn().mockResolvedValue(testModels[0]);
        jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse);
        const createdModel = await modelsService.createNewModel(testModels[0], testModelFile, testModelPreview);
        expect(createdModel).toBe(testModels[0]);
        expect(fileService.createNewFile).toBeCalledTimes(2);
        expect(fileService.createNewFile).toBeCalledWith(testModelFile);
        expect(fileService.createNewFile).toBeCalledWith(testModelPreview);
    });

    test('error happened when creating model, file and preview should be deleted', async () => {
        mockResponse.ok = false;
        mockResponse.status = 500;
        mockResponse.text = jest.fn().mockResolvedValue(createModelError);
        jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse);
        await expect(modelsService.createNewModel(testModels[0], testModelFile, testModelPreview)).rejects.toThrow(createModelError);
        expect(fileService.createNewFile).toBeCalledTimes(2);
        expect(fileService.createNewFile).toBeCalledWith(testModelFile);
        expect(fileService.createNewFile).toBeCalledWith(testModelPreview);
    });

    test('when jwt token expired, should refresh and try again', async () => {
        mockResponse.ok = true;
        mockResponse.status = 200;
        mockResponse.json = jest.fn().mockResolvedValue(testModels[0]);

        jest.spyOn(authenticationService, 'refreshAccessToken').mockResolvedValue(testTokens.accessToken);
        jest.spyOn(authenticationService, 'getAccessToken').mockImplementation(() => {
            return authenticationService.refreshAccessToken();
        });
        jest.spyOn(global, 'fetch').mockResolvedValueOnce(mockResponse);

        const createdModel = await modelsService.createNewModel(testModels[0], testModelFile);
        expect(fileService.createNewFile).toBeCalledTimes(1);
        expect(authenticationService.refreshAccessToken).toBeCalledTimes(1);
        expect(createdModel).toBe(testModels[0]);
    });

    test('when refresh token expired, should return error', async () => {
        const refreshTokenError = 'refresh token expired';
        mockResponse.ok = false;
        mockResponse.status = 500;

        jest.spyOn(authenticationService, 'getAccessToken').mockRejectedValue(new Error(refreshTokenError));
        jest.spyOn(global, 'fetch').mockResolvedValueOnce(mockResponse);
        await expect(modelsService.createNewModel(testModels[0], testModelFile)).rejects.toThrow(refreshTokenError);
        expect(fileService.createNewFile).toBeCalledTimes(1);
        expect(authenticationService.getAccessToken).toBeCalledTimes(1);
    });
});

describe('model updating', () => {
    const updateModelError = 'Failed to update model';
    beforeEach(() => {
        jest.spyOn(fileService, 'createNewFile').mockResolvedValueOnce(testModels[0].fileKey).mockResolvedValue(testModels[0].previewBlobKey);
        jest.spyOn(fileService, 'updateFile').mockResolvedValueOnce(testModels[0].previewBlobKey);
        jest.spyOn(authenticationService, 'getAccessToken').mockResolvedValue(testTokens.accessToken);
        jest.spyOn(fileService, 'deleteFile').mockResolvedValue('deleted');
    });

    test('should return model, and upload file should be called', async () => {
        mockResponse.ok = true;
        mockResponse.status = 200;
        mockResponse.json = jest.fn().mockResolvedValue(testModels[1]);
        jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse);
        const updateModel = await modelsService.updateModel(testModels[1], testModelFile);
        expect(updateModel).toBe(testModels[1]);
        expect(fileService.createNewFile).toBeCalledTimes(1);
        expect(fileService.createNewFile).toBeCalledWith(testModelFile);
        expect(fileService.createNewFile).not.toBeCalledWith(testModelPreview);
    });

    test('update model with new preview, upload file should be called with preview', async () => {
        mockResponse.ok = true;
        mockResponse.status = 200;
        mockResponse.json = jest.fn().mockResolvedValue(testModels[1]);
        jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse);
        const createdModel = await modelsService.updateModel(testModels[1], testModelFile, testModelPreview, null);
        expect(createdModel).toBe(testModels[1]);
        expect(fileService.createNewFile).toBeCalledTimes(2);
        expect(fileService.createNewFile).toBeCalledWith(testModelFile);
        expect(fileService.createNewFile).toBeCalledWith(testModelPreview);
    });

    test('update model and old preview, upload file should be called with old preview', async () => {
        mockResponse.ok = true;
        mockResponse.status = 200;
        mockResponse.json = jest.fn().mockResolvedValue(testModels[1]);
        jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse);
        const createdModel = await modelsService.updateModel(testModels[1], testModelFile, testModelPreview, testModels[1].previewBlobKey);
        expect(createdModel).toBe(testModels[1]);
        expect(fileService.createNewFile).toBeCalledTimes(1);
        expect(fileService.createNewFile).toBeCalledWith(testModelFile);
        expect(fileService.updateFile).toBeCalledWith(testModelPreview, testModels[1].previewBlobKey);
    });

    test('error happened when updating model, file and preview should be deleted', async () => {
        mockResponse.ok = false;
        mockResponse.status = 500;
        mockResponse.text = jest.fn().mockResolvedValue(updateModelError);
        jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse);
        await expect(modelsService.updateModel(testModels[1], testModelFile, testModelPreview)).rejects.toThrow(updateModelError);
        expect(fileService.deleteFile).toBeCalledTimes(2);
        expect(fileService.deleteFile).toBeCalledWith(testModels[1].previewBlobKey);
        expect(fileService.deleteFile).toBeCalledWith(testModels[1].fileKey);
    });

    test('when jwt token expired, should refresh and try again', async () => {
        mockResponse.ok = true;
        mockResponse.status = 200;
        mockResponse.json = jest.fn().mockResolvedValue(testModels[0]);

        jest.spyOn(authenticationService, 'refreshAccessToken').mockResolvedValue(testTokens.accessToken);
        jest.spyOn(authenticationService, 'getAccessToken').mockImplementation(() => {
            return authenticationService.refreshAccessToken();
        });
        jest.spyOn(global, 'fetch').mockResolvedValueOnce(mockResponse);
        const createdModel = await modelsService.updateModel(testModels[1], testModelFile);
        expect(fileService.createNewFile).toBeCalledTimes(1);
        expect(authenticationService.refreshAccessToken).toBeCalledTimes(1);
        expect(createdModel).toBe(testModels[0]);
    });
});

describe('model deleting', () => {
    const deleteModelError = 'Failed to delete model';
    const modelResourcesCount = 2; //model file and preview
    beforeEach(() => {
        jest.spyOn(fileService, 'deleteFile').mockResolvedValue('deleted');
        jest.spyOn(authenticationService, 'getAccessToken').mockResolvedValue(testTokens.accessToken);
    });

    test('successfully delete model, should delete all files from history', async () => {
        mockResponse.ok = true;
        mockResponse.status = 200;
        jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse);
        jest.spyOn(modelsService, 'getModelHistory').mockResolvedValue(testModelHistory);
        await modelsService.deleteModel(testModels[0]);
        expect(modelsService.getModelHistory).toBeCalledTimes(1);
        //delete should be called on model file, preview and all history files
        expect(fileService.deleteFile).toBeCalledTimes(testModelHistory.length + modelResourcesCount);
    });

    test('when jwt token expired, should refresh and try again', async () => {
        mockResponse.ok = true;
        mockResponse.status = 200;
        mockResponse.json = jest.fn().mockResolvedValue(testModels[0]);

        jest.spyOn(authenticationService, 'refreshAccessToken').mockResolvedValue(testTokens.accessToken);
        jest.spyOn(authenticationService, 'getAccessToken').mockImplementation(() => {
            return authenticationService.refreshAccessToken();
        });
        jest.spyOn(global, 'fetch').mockResolvedValueOnce(mockResponse);
        jest.spyOn(modelsService, 'getModelHistory').mockResolvedValue(testModelHistory);
        await modelsService.deleteModel(testModels[0]);
        expect(modelsService.getModelHistory).toBeCalledTimes(1);
        expect(authenticationService.refreshAccessToken).toBeCalledTimes(1);
        expect(fileService.deleteFile).toBeCalledTimes(testModelHistory.length + modelResourcesCount);
    });

    test('should throw error', async () => {
        mockResponse.ok = false;
        mockResponse.status = 500;
        mockResponse.text = jest.fn().mockResolvedValue(deleteModelError);
        jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse);
        jest.spyOn(modelsService, 'getModelHistory').mockResolvedValue(testModelHistory);
        await expect(modelsService.deleteModel(testModels[0])).rejects.toThrow(deleteModelError);
        expect(modelsService.getModelHistory).toBeCalledTimes(1);
        expect(fileService.deleteFile).toBeCalledTimes(0);
    });
});

describe('tags creating', () => {
    const createTagError = 'Failed to create tag';
    const tagNames = testTags.map((tag) => tag.name);

    beforeEach(() => {
        jest.spyOn(authenticationService, 'getAccessToken').mockResolvedValue(testTokens.accessToken);
    });

    test('successfully create, should return created tags', async () => {
        mockResponse.ok = true;
        mockResponse.status = 200;
        mockResponse.json = jest.fn().mockResolvedValue(testTags[0]);

        const secondResponse = {
            ok: true,
            status: 200,
            json: jest.fn().mockResolvedValue(testTags[1])
        };
        jest.spyOn(global, 'fetch').mockResolvedValueOnce(mockResponse).mockResolvedValueOnce(secondResponse);
        const tags = await modelsService.createNewTags(tagNames);
        expect(tags).toStrictEqual(testTags);
    });

    test('error when creating, should throw error', async () => {
        mockResponse.ok = true;
        mockResponse.status = 200;
        mockResponse.json = jest.fn().mockResolvedValue(testTags[0]);

        const secondResponse = {
            ok: false,
            status: 500,
            text: jest.fn().mockResolvedValue(createTagError)
        };
        jest.spyOn(global, 'fetch').mockResolvedValueOnce(mockResponse).mockResolvedValueOnce(secondResponse);
        await expect(modelsService.createNewTags(tagNames)).rejects.toThrow(createTagError);
    });

});
