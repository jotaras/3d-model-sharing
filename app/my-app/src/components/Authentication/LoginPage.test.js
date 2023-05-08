import { render, screen, waitFor } from '@testing-library/react';
import {  testNotValidUser, testTokens, testUserPassword, testUsers } from '../../constants/TestTemplates';
import React from 'react';
import LoginPage from './LoginPage';
import * as Constans from '../../constants/Constants';
import userEvent from '@testing-library/user-event';
import authenticationService from '../../services/AuthenticationService';


const mockSaveAccessToken = jest.fn();
const mockSaveRefreshToken = jest.fn();
const mockSaveUserId = jest.fn();
const mockedAddAlert = jest.fn();
const mockHistoryPush = jest.fn();

jest.mock('../AlertComponent/useAlertHook', () => ({
    __esModule: true,
    default: () => ({addAlert: mockedAddAlert})
}));

jest.mock('react-router-dom', () => ({
    useHistory: () => ({
        push: mockHistoryPush
    }),
}));

jest.mock('./useAuthenticationHook', () => ({
    __esModule: true,
    default: () => ({
        saveAccessToken: mockSaveAccessToken,
        saveRefreshToken: mockSaveRefreshToken,
        saveUserId: mockSaveUserId
    })
}));

afterEach(() => {
    jest.clearAllMocks();
});

beforeEach(() => {
    render(<LoginPage />);
});

describe('validation login form', () => {
    test('when input is empty, errors should be displayed' , async () => {
        jest.spyOn(authenticationService, 'authenticate').mockResolvedValue(testTokens);
        userEvent.click(await screen.findByText(Constans.LOGIN_SUBMIT_BUTTON_TEXT));

        expect(await screen.findByText(Constans.EMAIL_EMPTY_ERROR_MESSAGE)).toBeInTheDocument();
        expect(await screen.findByText(Constans.PASSWORD_EMPTY_ERROR_MESSAGE)).toBeInTheDocument();
    });

    test('when email is not correct, errors should be displayed' , async () => {
        jest.spyOn(authenticationService, 'authenticate').mockResolvedValue(testTokens);
        userEvent.type(await screen.findByPlaceholderText(Constans.EMAIL_INPUT_PLACEHOLDER), testNotValidUser.email);
        userEvent.click(await screen.findByText(Constans.LOGIN_SUBMIT_BUTTON_TEXT));

        expect(await screen.findByText(Constans.EMAIL_NOT_VALID_ERROR_MESSAGE)).toBeInTheDocument();
        expect(mockHistoryPush).not.toBeCalled();
    });
});

describe('authenticate user', () => {
    test('when authentication successfull, tokens should be saved', async () => {
        jest.spyOn(authenticationService, 'authenticate').mockResolvedValue(testTokens);

        userEvent.type(await screen.findByPlaceholderText(Constans.EMAIL_INPUT_PLACEHOLDER), testUsers[0].email);
        userEvent.type(await screen.findByPlaceholderText(Constans.PASSWORD_INPUT_PLACEHOLDER), testUserPassword);
        userEvent.click(await screen.findByText(Constans.LOGIN_SUBMIT_BUTTON_TEXT));

        await waitFor(() => expect(mockSaveAccessToken).toBeCalledWith(testTokens.accessToken));
        expect(mockSaveRefreshToken).toBeCalledWith(testTokens.refreshToken);
        expect(mockSaveUserId).toBeCalledWith(testTokens.userId);
        expect(mockHistoryPush).toBeCalled();
    });

    test('when authentication failed, alert should be called', async () => {
        const authFailedMessage = 'authentication failed';
        jest.spyOn(authenticationService, 'authenticate').mockRejectedValue(new Error(authFailedMessage));

        userEvent.type(await screen.findByPlaceholderText(Constans.EMAIL_INPUT_PLACEHOLDER), testUsers[0].email);
        userEvent.type(await screen.findByPlaceholderText(Constans.PASSWORD_INPUT_PLACEHOLDER), testUserPassword);
        userEvent.click(await screen.findByText(Constans.LOGIN_SUBMIT_BUTTON_TEXT));

        await waitFor(() => expect(mockedAddAlert).toBeCalledWith(authFailedMessage));
        expect(mockHistoryPush).not.toBeCalled();
    });

    test('when form closed, user should be redirected', async () => {
        userEvent.click(await screen.findByAltText(Constans.CLOSE_IMG_ALT));
        expect(mockHistoryPush).toBeCalledWith('/');
    });
});
