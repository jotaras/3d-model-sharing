import { render, screen } from '@testing-library/react';
import { testUsers } from '../../constants/TestTemplates';
import usersService from '../../services/UsersService';
import NavigationBar from './NavigationBar';
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import * as Constants from '../../constants/Constants';
import userEvent from '@testing-library/user-event';

const mockLogOut = jest.fn();
jest.mock('../Authentication/useAuthenticationHook', () => ({
    __esModule: true,
    default: () => ({
        logout: mockLogOut,
        userId: 1
    })
}));


afterEach(() => {
    jest.clearAllMocks();
});

test('routes should be displayed', async () => {
    jest.spyOn(usersService, 'getUserById').mockRejectedValue(new Error());
    render(
        <Router>
            <NavigationBar />
        </Router>
    );
    expect(await screen.findByText(Constants.MODELS_MANAGEMENT_BUTTON_TEXT)).toBeInTheDocument();
    expect(await screen.findByText(Constants.HOME_BUTTON_TEXT)).toBeInTheDocument();
    expect(await screen.findByText(Constants.USERS_MANAGEMENT_BUTTON_TEXT)).toBeInTheDocument();
});

test('authenticated user`s email and logout button should be displayed' , async () => {
    jest.spyOn(usersService, 'getUserById').mockResolvedValue(testUsers[0]);

    render(
        <Router>
            <NavigationBar />
        </Router>
    );
    expect(await screen.findByText(testUsers[0].email)).toBeInTheDocument();
    expect(screen.queryByText(Constants.LOGIN_BUTTON_TEXT)).not.toBeInTheDocument();
    expect(await screen.findByText(Constants.LOGOUT_BUTTON_TEXT)).toBeInTheDocument();
});

test('user not authenticated, login button should be displayed', async () => {
    jest.spyOn(usersService, 'getUserById').mockRejectedValue(new Error());

    render(
        <Router>
            <NavigationBar />
        </Router>
    );
    expect(screen.queryByText(Constants.LOGOUT_BUTTON_TEXT)).not.toBeInTheDocument();
    expect(await screen.findByText(Constants.LOGIN_BUTTON_TEXT)).toBeInTheDocument();
});

test('on logout button click logout method should be called', async () => {
    jest.spyOn(usersService, 'getUserById').mockResolvedValue(testUsers[0]);

    render(
        <Router>
            <NavigationBar />
        </Router>
    );

    userEvent.click(await screen.findByText(Constants.LOGOUT_BUTTON_TEXT));
    expect(mockLogOut).toBeCalled();
});
