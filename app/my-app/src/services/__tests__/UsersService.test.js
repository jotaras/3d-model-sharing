import usersService from '../UsersService';
import { testTokens, testUsers } from '../../constants/TestTemplates';
import { jest } from '@jest/globals';
import authenticationService from '../AuthenticationService';
import fileService from '../FilesService';


const testFile = 'file';
const mockResponse = {
    json: jest.fn(),
    text: jest.fn().mockResolvedValue('Error'),
    ok: true,
    statusText: 'Error',
    status: 200
};

afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
});

describe('getting all users', () => {
    const getUsersError = 'Failed to get users';
    test('should return users list', async () => {
        mockResponse.json = jest.fn().mockResolvedValue(testUsers);
        mockResponse.ok = true;
        mockResponse.status = 200;
        jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse);
        const users = await usersService.getAllUsers();
        expect(users).toBe(testUsers);
    });

    test('should return error message', async () => {
        mockResponse.ok = false;
        mockResponse.status = undefined;
        mockResponse.text = jest.fn().mockResolvedValue(getUsersError);
        jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse);
        await expect(usersService.getAllUsers()).rejects.toThrow(getUsersError);
    });
});

describe('getting user by id', () => {
    const getUserByIdError = 'Failed to get user';
    test('should return user', async () => {
        mockResponse.ok = true;
        mockResponse.status = 200;
        mockResponse.json = jest.fn().mockResolvedValue(testUsers[0]);
        jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse);
        const user = await usersService.getUserById(testUsers[0].id);
        expect(user).toBe(testUsers[0]);
    });

    test('should return error message', async () => {
        mockResponse.ok = false;
        mockResponse.status = 500;
        mockResponse.text = jest.fn().mockResolvedValue(getUserByIdError);
        jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse);
        await expect(usersService.getUserById(testUsers[0].id)).rejects.toThrow(getUserByIdError);
    });
});

describe('user creating', () => {
    const createUserError = 'Failed to create users';
    beforeEach(() => {
        jest.spyOn(fileService, 'createNewFile').mockResolvedValue(testUsers[0].imageBlobKey);
        jest.spyOn(authenticationService, 'getAccessToken').mockResolvedValue(testTokens.accessToken);
        jest.spyOn(fileService, 'deleteFile').mockResolvedValue('deleted');
    });

    test('successfully create user with image, upload image should be called', async () => {
        mockResponse.ok = true;
        mockResponse.status = 200;
        mockResponse.json = jest.fn().mockResolvedValue(testUsers[0]);
        jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse);
        const user = await usersService.createNewUser(testUsers[0], testFile);
        expect(fileService.createNewFile).toBeCalledTimes(1);
        expect(fileService.createNewFile).toBeCalledWith(testFile);
        expect(user).toBe(testUsers[0]);
    });

    test('successfully create user without image', async () => {
        mockResponse.ok = true;
        mockResponse.status = 200;
        mockResponse.json = jest.fn().mockResolvedValue(testUsers[0]);
        jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse);
        const user = await usersService.createNewUser(testUsers[0]);
        expect(fileService.createNewFile).toBeCalledTimes(0);
        expect(user).toBe(testUsers[0]);
    });

    test('create new user when jwt token expired', async () => {
        mockResponse.ok = true;
        mockResponse.status = 200;
        mockResponse.json = jest.fn().mockResolvedValue(testUsers[0]);

        jest.spyOn(authenticationService, 'refreshAccessToken').mockResolvedValue(testTokens.accessToken);
        jest.spyOn(authenticationService, 'getAccessToken').mockImplementation(() => {
            return authenticationService.refreshAccessToken();
        });
        jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse);
        const user = await usersService.createNewUser(testUsers[0]);
        expect(user).toBe(testUsers[0]);
        expect(authenticationService.refreshAccessToken).toBeCalledTimes(1);
    });

    test('when creating user failed, image should be deleted', async () => {
        mockResponse.ok = false;
        mockResponse.status = 500;
        mockResponse.text = jest.fn().mockResolvedValue(createUserError);
        jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse);
        await expect(usersService.createNewUser(testUsers[0], testFile)).rejects.toThrow(createUserError);
        expect(fileService.createNewFile).toBeCalledTimes(1);
        expect(fileService.deleteFile).toBeCalledTimes(1);
    });

    test('when loading image failed', async () => {
        const uploadImageError = 'Failed to upload image';
        mockResponse.ok = false;
        jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse);
        jest.spyOn(fileService, 'createNewFile').mockRejectedValue(new Error(uploadImageError));
        await expect(usersService.createNewUser(testUsers[0], testFile)).rejects.toThrow(uploadImageError);
        expect(fileService.createNewFile).toBeCalledTimes(1);
    });
});

describe('user updating', () => {
    const updateUserError = 'Failed to update image';
    beforeEach(() => {
        jest.spyOn(fileService, 'createNewFile').mockResolvedValue(testUsers[0].imageBlobKey);
        jest.spyOn(fileService, 'updateFile').mockResolvedValue(testUsers[0].imageBlobKey);
        jest.spyOn(authenticationService, 'getAccessToken').mockResolvedValue(testTokens.accessToken);
        jest.spyOn(fileService, 'deleteFile').mockResolvedValue('deleted');
    });

    test('successfully update user with new image, upload image should be called', async () => {
        mockResponse.ok = true;
        mockResponse.status = 200;
        mockResponse.json = jest.fn().mockResolvedValue(testUsers[0]);
        jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse);
        const user = await usersService.updateUser(testUsers[0], testFile);
        expect(fileService.createNewFile).toBeCalledTimes(1);
        expect(fileService.createNewFile).toBeCalledWith(testFile);
        expect(user).toBe(testUsers[0]);
    });

    test('successfully update user without image', async () => {
        mockResponse.ok = true;
        mockResponse.status = 200;
        mockResponse.json = jest.fn().mockResolvedValue(testUsers[0]);
        jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse);
        const user = await usersService.updateUser(testUsers[0]);
        expect(fileService.createNewFile).toBeCalledTimes(0);
        expect(user).toBe(testUsers[0]);
    });

    test('successfully update user and image', async () => {
        mockResponse.ok = true;
        mockResponse.status = 200;
        mockResponse.json = jest.fn().mockResolvedValue(testUsers[0]);
        jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse);
        const user = await usersService.updateUser(testUsers[0], testFile, testFile);
        expect(fileService.updateFile).toBeCalledTimes(1);
        expect(fileService.updateFile).toBeCalledWith(testFile, testFile);
        expect(fileService.createNewFile).not.toBeCalled();
        expect(user).toBe(testUsers[0]);
    });

    test('update user when jwt token expired', async () => {
        mockResponse.ok = true;
        mockResponse.status = 200;
        mockResponse.json = jest.fn().mockResolvedValue(testUsers[0]);

        jest.spyOn(authenticationService, 'refreshAccessToken').mockResolvedValue(testTokens.accessToken);
        jest.spyOn(authenticationService, 'getAccessToken').mockImplementation(() => {
            return authenticationService.refreshAccessToken();
        });
        jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse);
        const user = await usersService.updateUser(testUsers[0]);
        expect(user).toBe(testUsers[0]);
        expect(authenticationService.refreshAccessToken).toBeCalledTimes(1);
    });

    test('when updating user failed, image should be deleted', async () => {
        mockResponse.text = jest.fn().mockResolvedValue(updateUserError);
        mockResponse.ok = false;
        mockResponse.status = 500;
        jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse);
        await expect(usersService.updateUser(testUsers[0], testFile)).rejects.toThrow(updateUserError);
        expect(fileService.createNewFile).toBeCalledTimes(1);
        expect(fileService.deleteFile).toBeCalledTimes(1);
    });
});

describe('user deleting', () => {
    const deleteUserError = 'Failed to delete user';
    beforeEach(() => {
        jest.spyOn(fileService, 'createNewFile').mockResolvedValue(testUsers[0].imageBlobKey);
        jest.spyOn(authenticationService, 'getAccessToken').mockResolvedValue(testTokens.accessToken);
        jest.spyOn(fileService, 'deleteFile').mockResolvedValue('deleted');
    });

    test('successfully delete user with image, delete image should be called', async () => {
        mockResponse.ok = true;
        mockResponse.status = 200;
        jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse);
        await usersService.deleteUser(testUsers[0]);

        expect(fileService.deleteFile).toBeCalledWith(testUsers[0].imageBlobKey);
    });

    test('successfully delete user without image', async () => {
        mockResponse.ok = true;
        mockResponse.status = 200;
        mockResponse.json = jest.fn().mockResolvedValue(testUsers[0]);
        jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse);
        await usersService.deleteUser(testUsers[1]);
        expect(fileService.deleteFile).toBeCalledTimes(0);
    });

    test('delete user when jwt token expired', async () => {
        mockResponse.ok = true;
        mockResponse.status = 200;
        mockResponse.json = jest.fn().mockResolvedValue(testUsers[0]);

        jest.spyOn(authenticationService, 'refreshAccessToken').mockResolvedValue(testTokens.accessToken);
        jest.spyOn(authenticationService, 'getAccessToken').mockImplementation(() => {
            return authenticationService.refreshAccessToken();
        });
        jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse);

        await usersService.deleteUser(testUsers[0]);
        expect(authenticationService.refreshAccessToken).toBeCalledTimes(1);
        expect(fileService.deleteFile).toBeCalledTimes(1);
    });

    test('when deleting failed, should return error', async () => {
        mockResponse.ok = false;
        mockResponse.status = 500;
        mockResponse.text = jest.fn().mockResolvedValue(deleteUserError);
        jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse);
        await expect(usersService.deleteUser(testUsers[0])).rejects.toThrow(deleteUserError);
        expect(fileService.deleteFile).toBeCalledTimes(0);
    });

});

