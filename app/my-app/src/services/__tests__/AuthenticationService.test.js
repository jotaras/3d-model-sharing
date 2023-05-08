import { jest } from '@jest/globals';
import { AUTHENTICATION_FAILED_ERROR_MESSAGE, AUTHORIZATION_ERROR_MESSAGE } from '../../constants/Constants';
import { testAuthenticatedUser, testModels, testTokens } from '../../constants/TestTemplates';
import authenticationService from '../AuthenticationService';

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

describe('user authentication', () => {
    test('authentication successfull, should return tokens', async () => {
        mockResponse.json = jest.fn().mockResolvedValue(testTokens);
        jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse);
        const tokens = await authenticationService.authenticate(testAuthenticatedUser.testEmail, testAuthenticatedUser.testPass);
        expect(tokens).toBe(testTokens);
    });

    test('authentication failed, should throw error', async () => {
        mockResponse.ok = false;
        jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse);
        await expect(authenticationService.authenticate(testAuthenticatedUser.testEmail, testAuthenticatedUser.testPass))
            .rejects.toThrow(AUTHENTICATION_FAILED_ERROR_MESSAGE);
    });
});

describe('access token refreshing', () => {
    test('refresh successfull, should return token', async () => {
        mockResponse.json = jest.fn().mockResolvedValue({accessToken: testTokens.accessToken});
        mockResponse.ok = true;
        jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse);
        const token = await authenticationService.refreshAccessToken();
        expect(token).toBe(testTokens.accessToken);
    });

    test('refresh failed, should throw error', async () => {
        mockResponse.ok = false;
        mockResponse.status = 401;
        jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse);
        await expect(authenticationService.refreshAccessToken())
            .rejects.toThrow(AUTHORIZATION_ERROR_MESSAGE);
    });
});

describe('url signing', () => {
    const expectedSign = '?signed=sign';
    const signResponse = {signedUrl: `url${expectedSign}`};

    beforeEach(() => {
        jest.spyOn(authenticationService, 'getAccessToken').mockResolvedValue(testModels.accessToken);
    });

    test('successfully sign url when creating file', async () => {
        mockResponse.status = 200;
        mockResponse.ok = true;
        mockResponse.json = jest.fn().mockResolvedValue(signResponse);
        jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse);
        const signedUrl = await authenticationService.signUrl('POST');
        expect(signedUrl).toMatch(expectedSign);
    });

    test('successfully sign url when updating file', async () => {
        mockResponse.status = 200;
        mockResponse.ok = true;
        mockResponse.json = jest.fn().mockResolvedValue(signResponse);
        jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse);
        const signedUrl = await authenticationService.signUrl('PUT', testModels[0].fileKey);
        expect(signedUrl).toMatch(`/${testModels[0].fileKey}${expectedSign}`);
    });

    test('when access token expired, should refresh and try again', async () => {
        mockResponse.ok = true;
        mockResponse.status = 200;
        mockResponse.json = jest.fn().mockResolvedValue(signResponse);

        jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse);
        jest.spyOn(authenticationService, 'refreshAccessToken').mockResolvedValue(testTokens.accessToken);
        jest.spyOn(authenticationService, 'getAccessToken').mockImplementation(() => {
            return authenticationService.refreshAccessToken();
        });
        const signedUrl = await authenticationService.signUrl('POST');
        expect(authenticationService.refreshAccessToken).toBeCalledTimes(1);
        expect(signedUrl).toMatch(expectedSign);
    });

    test('should throw error', async () => {
        const signUrlError = 'Failed to sign url';
        mockResponse.ok = false;
        mockResponse.status = 500;
        mockResponse.text = jest.fn().mockResolvedValue(signUrlError);
        jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse);
        await expect(authenticationService.signUrl('POST')).rejects.toThrow(signUrlError);
    });
});
