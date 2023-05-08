import React from 'react';
import ModelHistoryComponent from './ModelHistoryComponent';
import { render, screen, waitFor, waitForElementToBeRemoved, within } from '@testing-library/react';
import modelsService from '../../services/ModelsService';
import { testModelHistory, testModels, testModelWithFile, testNewTag, testTags, testUsers } from '../../constants/TestTemplates';
import usersService from '../../services/UsersService';
import * as Constants from '../../constants/Constants';
import { BrowserRouter as ReactRouter} from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import filesService from '../../services/FilesService';

const rowRole = 'row';

const mockedAddAlert = jest.fn();
const mockHistoryPush = jest.fn();

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: () => ({
        push: mockHistoryPush
    })
}));

jest.mock('../AlertComponent/useAlertHook', () => ({
    __esModule: true,
    default: () => ({addAlert: mockedAddAlert})
}));


beforeEach(() => {
    jest.spyOn(modelsService, 'getAllModels').mockResolvedValue(testModels.slice(0));
    jest.spyOn(usersService, 'getAllUsers').mockResolvedValue(testUsers.slice(0));
    jest.spyOn(modelsService, 'getAllTags').mockResolvedValue(testTags.slice(0));
});

afterEach(() => {
    jest.clearAllMocks();
});

describe('server interaction', () => {
    test('loading should be displayed', async () => {
        render(
            <ReactRouter>
                <ModelHistoryComponent/>
            </ReactRouter>
        );
        expect(screen.queryByText(Constants.MODELS_LOADING_TEXT)).toBeInTheDocument();
        await waitForElementToBeRemoved(() => screen.queryByText(Constants.MODELS_LOADING_TEXT));
        expect(screen.queryByText(Constants.MODELS_LOADING_TEXT)).not.toBeInTheDocument();
    });

    test('error should be displayed', async () => {
        const fetchError = 'Failed to load models';
        jest.spyOn(modelsService, 'getAllModels').mockRejectedValue(new Error(fetchError));
        render(
            <ReactRouter>
                <ModelHistoryComponent/>
            </ReactRouter>
        );
        expect(await screen.findByText(fetchError)).toBeInTheDocument;
    });

    test('models should be displayed in table', async() => {
        render(
            <ReactRouter>
                <ModelHistoryComponent/>
            </ReactRouter>
        );
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

describe('model expanding', () => {
    test('model history should be displayed on expand click and closed when clicked again', async () => {
        const mockGetModelHistory = jest.spyOn(modelsService, 'getModelHistory').mockResolvedValue(testModelHistory);
        render(
            <ReactRouter>
                <ModelHistoryComponent/>
            </ReactRouter>
        );
        const rows = await screen.findAllByRole(rowRole);
        const expandFirstModelButton = within(rows[1]).queryByAltText(Constants.EXPAND_MODEL_IMAGE_ALT);
        userEvent.click(expandFirstModelButton);
        await waitFor(() => expect(mockGetModelHistory).toBeCalledWith(testModels[0].modelId));

        const rowsWithExpandedModel = await screen.findAllByRole(rowRole);
        expect(within(rowsWithExpandedModel[2]).queryByText(Constants.UPDATED_DATE_LABEL)).toBeInTheDocument();
        expect(within(rowsWithExpandedModel[2]).queryByText(Constants.UPDATED_BY_LABEL)).toBeInTheDocument();
        expect(within(rowsWithExpandedModel[3]).queryByText(new Date(testModels[0].updatedAt).toLocaleString())).toBeInTheDocument();
        expect(within(rowsWithExpandedModel[3]).queryByText(Constants.LAST_UPDATED_LABEL)).toBeInTheDocument();
        expect(within(rowsWithExpandedModel[3]).queryByText(usersService.getUserNameById(testModels[0].updatedBy, testUsers))).toBeInTheDocument();
        expect(within(rowsWithExpandedModel[4]).queryByText(new Date(testModelHistory[0].createdAt).toLocaleString())).toBeInTheDocument();
        expect(within(rowsWithExpandedModel[4]).queryByText(usersService.getUserNameById(testModelHistory[0].createdBy, testUsers))).toBeInTheDocument();
        expect(within(rowsWithExpandedModel[5]).queryByText(new Date(testModelHistory[1].createdAt).toLocaleString())).toBeInTheDocument();
        expect(within(rowsWithExpandedModel[5]).queryByText(usersService.getUserNameById(testModelHistory[1].createdBy, testUsers))).toBeInTheDocument();

        userEvent.click(expandFirstModelButton);
        expect(await within(rowsWithExpandedModel[2]).findByText(Constants.UPDATED_DATE_LABEL)).not.toBeInTheDocument();
    });

    test('when expanding and closing model history getModelHistory should be called only once', async () => {
        const mockGetModelHistory = jest.spyOn(modelsService, 'getModelHistory').mockResolvedValue(testModelHistory);
        render(
            <ReactRouter>
                <ModelHistoryComponent/>
            </ReactRouter>
        );
        const rows = await screen.findAllByRole(rowRole);
        const expandFirstModelButton = within(rows[1]).queryByAltText(Constants.EXPAND_MODEL_IMAGE_ALT);
        userEvent.click(expandFirstModelButton);
        await waitFor(() => expect(mockGetModelHistory).toBeCalledTimes(1));
        userEvent.click(expandFirstModelButton);
        userEvent.click(expandFirstModelButton);

        await waitFor(() => expect(mockGetModelHistory).toBeCalledTimes(1));
    });

    test('when failed to fetch model history, alert should be called', async () => {
        const failedToFetchMessage = 'Model history not found';
        jest.spyOn(modelsService, 'getModelHistory').mockRejectedValue(new Error(failedToFetchMessage));

        render(
            <ReactRouter>
                <ModelHistoryComponent/>
            </ReactRouter>
        );

        const rows = await screen.findAllByRole(rowRole);
        const expandFirstModelButton = within(rows[1]).queryByAltText(Constants.EXPAND_MODEL_IMAGE_ALT);
        userEvent.click(expandFirstModelButton);

        await waitFor(() => expect(mockedAddAlert).toBeCalledWith(failedToFetchMessage));
    });
});

describe('models sorting', () => {
    beforeEach(async () => {
        render(
            <ReactRouter>
                <ModelHistoryComponent/>
            </ReactRouter>
        );
        await waitForElementToBeRemoved(() => screen.queryByText(Constants.MODELS_LOADING_TEXT));
    });

    test('models should be sorted by name in ascending', async () => {
        const sortModelsButton = await screen.findByText(Constants.NAME_SORT_BUTTON_TEXT);

        userEvent.click(sortModelsButton);

        const rows = await screen.findAllByRole(rowRole);
        expect(within(rows[1]).queryByText(testModels[0].name)).toBeInTheDocument();
        expect(within(rows[2]).queryByText(testModels[1].name)).toBeInTheDocument();
    });

    test('models should be sorted by name in descending', async () => {
        const sortModelsButton = await screen.findByText(Constants.NAME_SORT_BUTTON_TEXT);
        userEvent.dblClick(sortModelsButton);

        const rows = await screen.findAllByRole(rowRole);
        expect(within(rows[1]).queryByText(testModels[1].name)).toBeInTheDocument();
        expect(within(rows[2]).queryByText(testModels[0].name)).toBeInTheDocument();
    });
});

describe('models searching', () => {
    beforeEach(async () => {
        render(
            <ReactRouter>
                <ModelHistoryComponent/>
            </ReactRouter>
        );
        await waitForElementToBeRemoved(() => screen.queryByText(Constants.MODELS_LOADING_TEXT));
    });
    test('only first model should be displayed', async () => {
        const searchInput = await screen.findByPlaceholderText(Constants.SEARCH_MODEL_PLACEHOLDER);
        userEvent.type(searchInput, testModels[0].name);
        expect(screen.queryByText(testModels[0].name)).toBeInTheDocument();
        expect(screen.queryByText(testModels[1].name)).not.toBeInTheDocument();
    });

    test('only second model should be displayed', async () => {
        const searchInput = await screen.findByPlaceholderText(Constants.SEARCH_MODEL_PLACEHOLDER);
        userEvent.type(searchInput, testModels[1].name);
        expect(screen.queryByText(testModels[0].name)).not.toBeInTheDocument();
        expect(screen.queryByText(testModels[1].name)).toBeInTheDocument();
    });
});

describe('filtering by tags', () => {
    beforeEach(async () => {
        render(
            <ReactRouter>
                <ModelHistoryComponent/>
            </ReactRouter>
        );
        userEvent.click(await screen.findByAltText(Constants.ADD_TAG_IMAGE_ALT));
        userEvent.type(screen.queryByPlaceholderText(Constants.FORM_INPUT_TAG_PLACEHOLDER), testTags[1].name);
        userEvent.click(screen.queryByText(Constants.FORM_ADD_TAG_BUTTON_TEXT));
    });
    test('only model with selected tag should be displayed', async () => {
        expect(screen.queryByText(testModels[0].name)).toBeInTheDocument();
        expect(screen.queryByText(testModels[1].name)).not.toBeInTheDocument();
    });

    test('when models dont have tags that filtered by, all models should be displayed', async () => {
        userEvent.type(screen.queryByPlaceholderText(Constants.FORM_INPUT_TAG_PLACEHOLDER), testNewTag.name);
        userEvent.click(screen.queryByText(Constants.FORM_ADD_TAG_BUTTON_TEXT));
        expect(screen.queryByText(testModels[0].name)).not.toBeInTheDocument();
        expect(screen.queryByText(testModels[1].name)).not.toBeInTheDocument();
    });

    test('remove filter tag, all models should be displayed', () => {
        userEvent.click(screen.queryByAltText(Constants.CLOSE_IMG_ALT));
        expect(screen.queryByText(testModels[0].name)).toBeInTheDocument();
        expect(screen.queryByText(testModels[1].name)).toBeInTheDocument();
    });
});

describe('model preview', () => {
    test('preview should be displayed', async () => {
        render(
            <ReactRouter>
                <ModelHistoryComponent/>
            </ReactRouter>
        );
        const rows = await screen.findAllByRole(rowRole);
        userEvent.click(within(rows[1]).queryByText(Constants.PREVIEW_MODEL_BUTTON_TEXT));
        expect(screen.queryByAltText(Constants.PREVIEW_IMAGE_ALT)).toBeInTheDocument();
    });
});

describe('model view', () => {
    test('on click get model file should be called', async () => {
        jest.spyOn(filesService, 'getModelFile').mockResolvedValue(testModelWithFile.modelFile);
        render(
            <ReactRouter>
                <ModelHistoryComponent/>
            </ReactRouter>
        );
        const rows = await screen.findAllByRole(rowRole);
        userEvent.click(within(rows[1]).queryByText(Constants.VIEW_MODEL_BUTTON_TEXT));
        expect(filesService.getModelFile).toBeCalledWith(testModels[0].fileKey);
        await waitFor(() => expect(mockHistoryPush).toBeCalledTimes(1));
    });
    test('when model file not supported, alert should be called', async () => {
        jest.spyOn(filesService, 'getModelFile').mockRejectedValue(new Error(Constants.MODEL_FILE_NOT_SUPPORTED_ERROR_MESSAGE));
        render(
            <ReactRouter>
                <ModelHistoryComponent/>
            </ReactRouter>
        );
        const rows = await screen.findAllByRole(rowRole);
        userEvent.click(within(rows[1]).queryByText(Constants.VIEW_MODEL_BUTTON_TEXT));
        await waitFor(() => expect(mockedAddAlert).toBeCalledWith(Constants.MODEL_FILE_NOT_SUPPORTED_ERROR_MESSAGE));
    });

    test('error happened when getting file, alert should be called', async () => {
        const fetchingErrorMessage = 'failed to load model';
        jest.spyOn(filesService, 'getModelFile').mockRejectedValue(new Error(fetchingErrorMessage));
        render(
            <ReactRouter>
                <ModelHistoryComponent/>
            </ReactRouter>
        );
        const rows = await screen.findAllByRole(rowRole);
        userEvent.click(within(rows[1]).queryByText(Constants.VIEW_MODEL_BUTTON_TEXT));
        await waitFor(() => expect(mockedAddAlert).toBeCalledWith(fetchingErrorMessage));
    });
});
