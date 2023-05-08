import UserCreateUpdateModal from '../UserCreateUpdateModal/UserCreateUpdateModal.js';
import { jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import userService from '../../services/UsersService.js';
import { act } from 'react-dom/test-utils';
import * as Constants from '../../constants/Constants.js';
import React from 'react';
import { testUsers, testRoles, testNotValidUser, testUpdatedUser, testUserPassword, } from '../../constants/TestTemplates';


afterEach(() => {
    jest.clearAllMocks();
});

const mockedAddAlert = jest.fn();
jest.mock('../AlertComponent/useAlertHook', () => ({
    __esModule: true,
    default: () => ({ addAlert: mockedAddAlert })
}));

const mockCloseForm = jest.fn();
const mockSetUsers = jest.fn();

describe('validation', () => {
    test('errors on empty inputs should be displayed', async () => {
        jest.spyOn(userService, 'createNewUser').mockResolvedValue();
        render(<UserCreateUpdateModal closeForm = {mockCloseForm} roles = {testRoles} setUsers = {mockSetUsers} users = {testUsers} />);
        expect(screen.queryByText(Constants.ROLES_EMPTY_ERROR_MESSAGE)).not.toBeInTheDocument();
        expect(screen.queryByText(Constants.FIRST_NAME_EMPTY_ERROR_MESSAGE)).not.toBeInTheDocument();
        expect(screen.queryByText(Constants.LAST_NAME_EMPTY_ERROR_MESSAGE)).not.toBeInTheDocument();
        expect(screen.queryByText(Constants.ROLES_EMPTY_ERROR_MESSAGE)).not.toBeInTheDocument();
        expect(screen.queryByText(Constants.EMAIL_EMPTY_ERROR_MESSAGE)).not.toBeInTheDocument();

        await act(async () => {
            userEvent.click(screen.getByText(Constants.SUBMIT_BUTTON_TEXT));
        });

        expect(userService.createNewUser).not.toBeCalled();
        expect(screen.queryByText(Constants.ROLES_EMPTY_ERROR_MESSAGE)).toBeInTheDocument();
        expect(screen.queryByText(Constants.FIRST_NAME_EMPTY_ERROR_MESSAGE)).toBeInTheDocument();
        expect(screen.queryByText(Constants.LAST_NAME_EMPTY_ERROR_MESSAGE)).toBeInTheDocument();
        expect(screen.queryByText(Constants.ROLES_EMPTY_ERROR_MESSAGE)).toBeInTheDocument();
        expect(screen.queryByText(Constants.EMAIL_EMPTY_ERROR_MESSAGE)).toBeInTheDocument();
    });

    test('validation errors should be displayed', async () => {
        render(<UserCreateUpdateModal closeForm = {mockCloseForm} roles = {testRoles} setUsers = {mockSetUsers} users = {testUsers} />);

        const inputFirstName = screen.getByPlaceholderText(Constants.FIRST_NAME_INPUT_PLACEHOLDER);
        const inputLastName = screen.getByPlaceholderText(Constants.LAST_NAME_INPUT_PLACEHOLDER);
        const inputEmail = screen.getByPlaceholderText(Constants.EMAIL_INPUT_PLACEHOLDER);

        userEvent.type(inputFirstName, testNotValidUser.firstName);
        userEvent.type(inputLastName, testNotValidUser.lastName);
        userEvent.type(inputEmail, testNotValidUser.email);

        userEvent.click(screen.getByText(Constants.SUBMIT_BUTTON_TEXT));

        expect(screen.queryByText(Constants.FIRST_NAME_NOT_VALID_ERROR_MESSAGE)).toBeInTheDocument();
        expect(screen.queryByText(Constants.LAST_NAME_NOT_VALID_ERROR_MESSAGE)).toBeInTheDocument();
        expect(screen.queryByText(Constants.EMAIL_NOT_VALID_ERROR_MESSAGE)).toBeInTheDocument();
    });
});

describe('create new user', () => {
    test('user should be successfully created', async () => {
        jest.spyOn(userService, 'createNewUser').mockResolvedValue(testUsers[0]);
        render(<UserCreateUpdateModal closeForm = {mockCloseForm} roles = {testRoles} setUsers = {mockSetUsers} users = {testUsers} />);
        const inputFirstName = screen.getByPlaceholderText(Constants.FIRST_NAME_INPUT_PLACEHOLDER);
        const inputLastName = screen.getByPlaceholderText(Constants.LAST_NAME_INPUT_PLACEHOLDER);
        const inputEmail = screen.getByPlaceholderText(Constants.EMAIL_INPUT_PLACEHOLDER);
        const inputPassword = screen.getByPlaceholderText(Constants.PASSWORD_INPUT_PLACEHOLDER);
        const selectRole = screen.getByDisplayValue(Constants.SELECT_ROLE_MESSAGE);
        const addRole = screen.getByText(Constants.ADD_ROLE_BUTTON_TEXT);

        userEvent.type(inputFirstName, testUsers[0].firstName);
        userEvent.type(inputLastName, testUsers[0].lastName);
        userEvent.type(inputEmail, testUsers[0].email);
        userEvent.type(inputPassword, testUserPassword);
        userEvent.selectOptions(selectRole, await screen.findByText(testRoles[0].name));
        userEvent.click(addRole);


        await act(async () => {
            userEvent.click(screen.getByText(Constants.SUBMIT_BUTTON_TEXT));
        });

        expect(mockSetUsers).toBeCalledTimes(1);
        expect(mockedAddAlert).toBeCalledWith(Constants.USER_CREATED_MESSAGE);
        expect(userService.createNewUser).toHaveBeenCalled();
    });

    test('error when creating user, alert should be called', async () => {
        const errorWhenCreating = 'error when creating';
        jest.spyOn(userService, 'createNewUser').mockRejectedValue(new Error(errorWhenCreating));
        render(<UserCreateUpdateModal closeForm = {mockCloseForm} roles = {testRoles} setUsers = {mockSetUsers} users = {testUsers} />);

        const inputFirstName = screen.getByPlaceholderText(Constants.FIRST_NAME_INPUT_PLACEHOLDER);
        const inputLastName = screen.getByPlaceholderText(Constants.LAST_NAME_INPUT_PLACEHOLDER);
        const inputEmail = screen.getByPlaceholderText(Constants.EMAIL_INPUT_PLACEHOLDER);
        const selectRole = screen.getByDisplayValue(Constants.SELECT_ROLE_MESSAGE);
        const addRole = screen.getByText(Constants.ADD_ROLE_BUTTON_TEXT);
        const inputPassword = screen.getByPlaceholderText(Constants.PASSWORD_INPUT_PLACEHOLDER);

        userEvent.type(inputFirstName, testUsers[0].firstName);
        userEvent.type(inputLastName, testUsers[0].lastName);
        userEvent.type(inputEmail, testUsers[0].email);
        userEvent.type(inputPassword, testUserPassword);
        userEvent.selectOptions(selectRole, await screen.findByText(testRoles[0].name));
        userEvent.click(addRole);

        await act(async () => {
            userEvent.click(screen.getByText(Constants.SUBMIT_BUTTON_TEXT));
        });
        expect(mockedAddAlert).toBeCalledWith(errorWhenCreating);
    });

    test('file should be loaded in form', async () => {
        render(<UserCreateUpdateModal closeForm = {mockCloseForm} roles = {testRoles} setUsers = {mockSetUsers} users = {testUsers}/>);
        jest.spyOn(userService, 'createNewUser').mockResolvedValue();
        const fileName = 'testFile.png';
        const file = new File(['test'], fileName, { type: 'image/png' });

        const changeFile = screen.getByText(Constants.FORM_INPUT_PICTURE_TEXT);
        userEvent.upload(changeFile, file);

        expect(screen.getByText(fileName)).toBeInTheDocument();
    });
});

describe('update user', () => {
    test('user should be successfully updated', async () => {
        jest.spyOn(userService, 'updateUser').mockResolvedValue(testUpdatedUser);
        render(<UserCreateUpdateModal closeForm = {mockCloseForm} user = {testUsers[0]} users = {testUsers} roles = {testRoles} setUsers = {mockSetUsers}/>);

        expect(screen.queryByDisplayValue(testUsers[0].firstName)).toBeInTheDocument();
        expect(screen.queryByDisplayValue(testUsers[0].lastName)).toBeInTheDocument();
        expect(screen.queryByDisplayValue(testUsers[0].email)).toBeInTheDocument();

        const inputFirstName = screen.getByPlaceholderText(Constants.FIRST_NAME_INPUT_PLACEHOLDER);
        userEvent.type(inputFirstName, testUpdatedUser.firstName);

        await act(async () => {
            userEvent.click(screen.getByText(Constants.SUBMIT_BUTTON_TEXT));
        });
        expect(userService.updateUser).toBeCalled();
        expect(mockedAddAlert).toBeCalledWith(Constants.USER_UPDATED_MESSAGE);
        expect(mockSetUsers).toBeCalledTimes(1);
    });
    test('error when updating, alert should be called', async () => {
        const errorWhenUpdating = 'error when updating';
        jest.spyOn(userService, 'updateUser').mockRejectedValue(new Error(errorWhenUpdating));
        render(<UserCreateUpdateModal closeForm = {mockCloseForm} user = {testUsers[0]} users = {testUsers} roles = {testRoles} setUsers = {mockSetUsers}/>);

        await act(async () => {
            userEvent.click(screen.getByText(Constants.SUBMIT_BUTTON_TEXT));
        });
        expect(mockedAddAlert).toBeCalledWith(errorWhenUpdating);
    });

});
