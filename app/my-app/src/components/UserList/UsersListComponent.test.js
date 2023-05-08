import React from 'react';
import {render, screen, within, waitForElementToBeRemoved} from '@testing-library/react';
import { jest } from '@jest/globals';
import UsersListComponent from './UsersListComponent.js';
import userEvent from '@testing-library/user-event';
import userService from '../../services/UsersService.js';
import * as Constants from '../../constants/Constants';
import { testUsers, testRoles } from '../../constants/TestTemplates.js';

const rowRole = 'row';

const mockedAddAlert = jest.fn();
jest.mock('../AlertComponent/useAlertHook', () => ({
    __esModule: true,
    default: () => ({addAlert: mockedAddAlert})
}));

let mockedConfirm = jest.fn();
jest.mock('../ConfirmComponent/useConfirmHook', () => ({
    __esModule: true,
    default: () => ({confirmDialog: mockedConfirm})
}));

const formTestId = 'test-form';
const closeFormTestId = 'test-form-close-button';
jest.mock('../UserCreateUpdateModal/UserCreateUpdateModal.js', () => {
    return function TestForm(props) {
        return (
            <div data-testid = {formTestId}>Showed form
                <button data-testid = {closeFormTestId} onClick = {props.closeForm}>Close</button>
            </div>
        );
    };
});

beforeEach(() => {
    jest.spyOn(userService, 'getAllUsers').mockResolvedValue(testUsers.slice(0));
    jest.spyOn(userService, 'getAllRoles').mockResolvedValue(testRoles.slice(0));
});

afterEach(() => {
    jest.clearAllMocks();
});

describe('server interaction', () => {
    test('loading message should be displayed', async () => {
        render(<UsersListComponent />);
        expect(screen.queryByText(Constants.USERS_LOADING_TEXT)).toBeInTheDocument();
        await waitForElementToBeRemoved(() => screen.queryByText(Constants.USERS_LOADING_TEXT));
        expect(screen.queryByText(Constants.USERS_LOADING_TEXT)).not.toBeInTheDocument();
    });

    test('error message should be displayed', async () => {
        const errorFromServer = 'network error';
        jest.spyOn(userService, 'getAllUsers').mockRejectedValue(new Error(errorFromServer));
        render(<UsersListComponent />);
        expect(await screen.findByText(errorFromServer)).toBeInTheDocument();
    });

    test('data should be displayed in table', async() => {
        render(<UsersListComponent />);
        const rows = await screen.findAllByRole(rowRole);
        testUsers.forEach((user, index) => {
            expect(within(rows[index+1]).queryByText(user.firstName)).toBeInTheDocument();
            expect(within(rows[index+1]).queryByText(user.lastName)).toBeInTheDocument();
            expect(within(rows[index+1]).queryByText(user.email)).toBeInTheDocument();
            expect(within(rows[index+1]).queryByText(
                user.roleIds.map(roleId => {
                    return(userService.getRoleName(roleId, testRoles));
                }))).toBeInTheDocument();

        });
    });
});

describe('search user', () => {
    test('only finded user should be displayed in table', async () => {
        render(<UsersListComponent />);

        const findUser = await screen.findByPlaceholderText(Constants.SEARCH_USER_PLACEHOLDER);

        userEvent.type(findUser, testUsers[0].firstName);

        expect(screen.queryByText(testUsers[0].firstName)).toBeInTheDocument();
        expect(screen.queryByText(testUsers[1].firstName)).not.toBeInTheDocument();
    });
});

describe('sort testUsers', () => {
    test('testUsers should be sorted by first name in ascending', async () => {
        render(<UsersListComponent />);

        const sortUsers = await screen.findByText(Constants.FIRST_NAME_SORT_BUTTON_TEXT);
        userEvent.click(sortUsers);

        const rows = await screen.findAllByRole(rowRole);
        expect(within(rows[1]).queryByText(testUsers[0].firstName)).toBeInTheDocument();
        expect(within(rows[2]).queryByText(testUsers[1].lastName)).toBeInTheDocument();
    });

    test('testUsers should be sorted by first name in descending', async () => {
        render(<UsersListComponent />);

        const sortUsers = await screen.findByText(Constants.FIRST_NAME_SORT_BUTTON_TEXT);
        userEvent.dblClick(sortUsers);

        const rows = await screen.findAllByRole(rowRole);
        expect(within(rows[1]).queryByText(testUsers[1].firstName)).toBeInTheDocument();
        expect(within(rows[2]).queryByText(testUsers[0].lastName)).toBeInTheDocument();
    });

});

describe('delete user', () => {
    test('deleted user should not be displayed on table, alert should be called', async () => {
        mockedConfirm = jest.fn().mockResolvedValue(true);
        jest.spyOn(userService, 'deleteUser').mockImplementation(() => Promise.resolve());

        render(<UsersListComponent />);
        const rows = await screen.findAllByRole(rowRole);
        const deleteModelButton = within(rows[1]).getByAltText(Constants.DELETE_USER_IMAGE_ALT);

        userEvent.click(deleteModelButton);

        expect(await screen.findByText(testUsers[1].firstName)).toBeInTheDocument();
        expect(screen.queryByText(testUsers[0].firstName)).not.toBeInTheDocument();
        expect(userService.deleteUser).toBeCalled();
        expect(mockedAddAlert).toBeCalledWith(Constants.USER_DELETED_MESSAGE);
    });

    test('error when deleting, user should not be deleted, alert should be called', async () => {
        const failedToDelete = 'Failed to delete';
        mockedConfirm = jest.fn().mockResolvedValue(true);
        jest.spyOn(userService, 'deleteUser').mockImplementation(() => Promise.reject(new Error(failedToDelete)));

        render(<UsersListComponent />);
        const rows = await screen.findAllByRole(rowRole);
        const deleteModelButton = within(rows[1]).getByAltText(Constants.DELETE_USER_IMAGE_ALT);

        userEvent.click(deleteModelButton);

        expect(await screen.findByText(testUsers[0].firstName)).toBeInTheDocument();
        expect(userService.deleteUser).toBeCalled();
        expect(mockedAddAlert).toBeCalledWith(failedToDelete);
    });

    test('cancel confirm, user should not be deleted', async () => {
        mockedConfirm = jest.fn().mockResolvedValue(false);
        jest.spyOn(userService, 'deleteUser');

        render(<UsersListComponent />);
        const rows = await screen.findAllByRole(rowRole);
        const deleteModelButton = within(rows[1]).getByAltText(Constants.DELETE_USER_IMAGE_ALT);

        userEvent.click(deleteModelButton);

        expect(userService.deleteUser).not.toBeCalled();
    });
});

describe('open form', () => {
    test('form should be displayed on new user click, and unmounted on close click', async () => {
        render(<UsersListComponent />);
        expect(screen.queryByText(Constants.USERS_LOADING_TEXT)).toBeInTheDocument();
        const openFormButton = await screen.findByText(Constants.NEW_USER_BUTTON_TEXT);
        expect(openFormButton.innerHTML).toBe(Constants.NEW_USER_BUTTON_TEXT);
        expect(screen.queryByTestId(formTestId)).not.toBeInTheDocument();

        userEvent.click(openFormButton);

        expect(screen.queryByTestId(formTestId)).toBeInTheDocument();

        const closeFormButton = screen.queryByTestId(closeFormTestId);
        userEvent.click(closeFormButton);
        expect(screen.queryByTestId(formTestId)).not.toBeInTheDocument();
    });
});

