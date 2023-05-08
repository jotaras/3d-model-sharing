import React from 'react';
import {render, screen, waitForElementToBeRemoved, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { jest } from '@jest/globals';
import ModelListComponent from './ModelsListComponent';
import modelsService from '../../services/ModelsService';
import * as Constants from '../../constants/Constants';
import { act } from 'react-dom/test-utils';
import { testModels, testTags, testUsers } from '../../constants/TestTemplates';
import usersService from '../../services/UsersService';


const rowRole = 'row';

const testFormId = 'test-form';
jest.mock('../ModelCreateUpdateModal/ModelCreateUpdateModal', () => {
    return function TestForm(props) {
        return (
            <div data-testid = {testFormId}>Showed form
                <button data-testid = 'test-form-close-button' onClick = {props.closeForm}>Close</button>
            </div>
        );
    };
});

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

beforeEach(() => {
    jest.spyOn(modelsService, 'getAllModels').mockResolvedValue(testModels.slice(0));
    jest.spyOn(modelsService, 'getAllTags').mockResolvedValue(testTags.slice(0));
    jest.spyOn(usersService, 'getAllUsers').mockResolvedValue(testUsers.slice(0));
});

afterEach(() => {
    jest.clearAllMocks();
});

describe('server interaction', () => {
    test('loading message should be displayed', async () => {
        render(<ModelListComponent />);
        expect(screen.queryByText(Constants.MODELS_LOADING_TEXT)).toBeInTheDocument();
        await waitForElementToBeRemoved(() => screen.queryByText(Constants.MODELS_LOADING_TEXT));
        expect(screen.queryByText(Constants.MODELS_LOADING_TEXT)).not.toBeInTheDocument();
    });

    test('error message should be displayed', async () => {
        const errorMessage = 'network error';
        jest.spyOn(modelsService, 'getAllModels').mockRejectedValue(new Error(errorMessage));
        render(<ModelListComponent />);
        expect(await screen.findByText(errorMessage)).toBeInTheDocument();
    });

    test('models should be displayed in table', async() => {
        render(<ModelListComponent />);
        const rows = await screen.findAllByRole(rowRole);
        testModels.forEach((model, index) => {
            expect(within(rows[index+1]).queryByText(model.name)).toBeInTheDocument();
            expect(within(rows[index+1]).queryByText(model.description)).toBeInTheDocument();
            expect(within(rows[index+1]).queryByText(
                model.tagIds.map(tagId => {
                    return(modelsService.getTagName(tagId, testTags));
                }).join(', '))).toBeInTheDocument();
        });
    });
});

describe('sort table', () => {
    test('models should be sorted by name in ascending', async () => {
        render(<ModelListComponent />);
        const sortModelsButton = await screen.findByText(Constants.NAME_SORT_BUTTON_TEXT);

        userEvent.click(sortModelsButton);

        const rows = await screen.findAllByRole(rowRole);
        expect(within(rows[1]).queryByText(testModels[0].name)).toBeInTheDocument();
        expect(within(rows[2]).queryByText(testModels[1].name)).toBeInTheDocument();
    });

    test('models should be sorted by name in descending', async () => {
        render(<ModelListComponent />);
        const sortModelsButton = await screen.findByText(Constants.NAME_SORT_BUTTON_TEXT);
        userEvent.dblClick(sortModelsButton);

        const rows = await screen.findAllByRole(rowRole);
        expect(within(rows[1]).queryByText(testModels[1].name)).toBeInTheDocument();
        expect(within(rows[2]).queryByText(testModels[0].name)).toBeInTheDocument();
    });

    test('models should be sorted by last update in ascending', async () => {
        render(<ModelListComponent />);
        const sortModelsButton = await screen.findByText(Constants.LAST_UPDATE_SORT_BUTTON_TEXT);
        userEvent.click(sortModelsButton);

        const rows = await screen.findAllByRole(rowRole);
        expect(within(rows[1]).queryByText(testModels[1].name)).toBeInTheDocument();
        expect(within(rows[2]).queryByText(testModels[0].name)).toBeInTheDocument();
    });
});

describe('search model', () => {
    test('only finded model should be displayed in table', async () => {
        render(<ModelListComponent />);
        const searchBar = await screen.findByPlaceholderText(Constants.SEARCH_MODEL_PLACEHOLDER);

        userEvent.type(searchBar, testModels[0].name);
        expect(screen.queryByText(testModels[0].name)).toBeInTheDocument();
        expect(screen.queryByText(testModels[1].name)).not.toBeInTheDocument();
    });
});

describe('delete model', () => {
    test('deleted model should not be displayed in table, alert should be called', async () => {
        mockedConfirm = jest.fn().mockResolvedValue(true);
        jest.spyOn(modelsService, 'deleteModel').mockImplementation(() => Promise.resolve());

        render(<ModelListComponent />);
        const rows = await screen.findAllByRole(rowRole);
        const deleteModelButton = within(rows[1]).getByAltText(Constants.DELETE_MODEL_IMAGE_ALT);

        await act(async() => {
            userEvent.click(deleteModelButton);
        });

        expect(await screen.findByText(testModels[1].name)).toBeInTheDocument();
        expect(screen.queryByText(testModels[0].name)).not.toBeInTheDocument();
        expect(modelsService.deleteModel).toBeCalled();
        expect(mockedAddAlert).toBeCalledWith(Constants.MODEL_DELETED_MESSAGE);
    });

    test('error when deleting, model should not be deleted, alert should be called', async () => {
        const failedToDelete = 'Failed to delete';
        mockedConfirm = jest.fn().mockResolvedValue(true);
        jest.spyOn(modelsService, 'deleteModel').mockImplementation(() => Promise.reject(new Error(failedToDelete)));

        render(<ModelListComponent />);
        const rows = await screen.findAllByRole(rowRole);
        const deleteModelButton = within(rows[1]).getByAltText(Constants.DELETE_MODEL_IMAGE_ALT);

        userEvent.click(deleteModelButton);

        expect(await screen.findByText(testModels[0].name)).toBeInTheDocument();
        expect(modelsService.deleteModel).toBeCalled();
        expect(mockedAddAlert).toBeCalledWith(failedToDelete);
    });

    test('cancel confirm, model should not be deleted', async () => {
        mockedConfirm = jest.fn().mockResolvedValue(false);
        jest.spyOn(modelsService, 'deleteModel');

        render(<ModelListComponent />);
        const rows = await screen.findAllByRole(rowRole);
        const deleteModelButton = within(rows[1]).getByAltText(Constants.DELETE_MODEL_IMAGE_ALT);

        userEvent.click(deleteModelButton);

        expect(modelsService.deleteModel).not.toBeCalled();
    });
});

test('on button click form should be displayed', async () => {
    render(<ModelListComponent />);
    const openFormButton = await screen.findByText(Constants.NEW_MODEL_BUTTON_NAME);
    userEvent.click(openFormButton);
    expect(await screen.findByTestId(testFormId)).toBeInTheDocument();
});

