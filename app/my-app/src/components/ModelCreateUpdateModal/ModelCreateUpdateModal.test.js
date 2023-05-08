import React from 'react';
import {render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { jest } from '@jest/globals';
import ModelCreateUpdateModal from './ModelCreateUpdateModal';
import modelsService from '../../services/ModelsService';
import * as Constants from '../../constants/Constants';
import { act } from 'react-dom/test-utils';
import { testModels, testTags, testModelToCreate, testNewTag } from '../../constants/TestTemplates';


const mockedAddAlert = jest.fn();
jest.mock('../AlertComponent/useAlertHook', () => ({
    __esModule: true,
    default: () => ({addAlert: mockedAddAlert})
}));


const mockCloseForm = jest.fn();
const mockSetTags = jest.fn();
const mockSetModels = jest.fn();



afterEach(() => {
    jest.clearAllMocks();
});


describe('models form functionality', () => {
    describe('create model', () => {
        beforeEach(() => {
            render(<ModelCreateUpdateModal closeForm = {mockCloseForm} modelToChange = {null} tags = {testTags}
                setTags = {mockSetTags} models = {testModels} setModels = {mockSetModels}/>);
        });

        test('validation errors should be displayed in form', async () => {
            userEvent.click(screen.getByText(Constants.SUBMIT_BUTTON_TEXT));
            expect(await screen.findByText(Constants.MODEL_NAME_EMPTY_ERROR_MESSAGE)).toBeInTheDocument();
            expect(await screen.findByText(Constants.MODEL_FILE_EMPTY_ERROR_MESSAGE)).toBeInTheDocument();
            expect(await screen.findByText(Constants.MODEL_DESCR_EMPTY_ERROR_MESSAGE)).toBeInTheDocument();
        });

        test('model should be successfully created', async () => {
            jest.spyOn(modelsService, 'createNewModel').mockResolvedValue(testModelToCreate);

            const nameInput = await screen.findByPlaceholderText(Constants.FORM_INPUT_NAME_PLACEHOLDER);
            const descrInput = await screen.findByPlaceholderText(Constants.FORM_INPUT_DESCRIPTION_PLACEHOLDER);
            const modelInput = await screen.findByText(Constants.FORM_INPUT_MODEL_FILE_TEXT);
            const previewInput = await screen.findByText(Constants.FORM_INPUT_MODEL_PREVIEW_TEXT);

            userEvent.type(nameInput, testModelToCreate.name);
            userEvent.type(descrInput, testModelToCreate.description);
            userEvent.upload(modelInput, testModelToCreate.file);
            userEvent.upload(previewInput, testModelToCreate.preview);

            await act(async () => {
                userEvent.click(screen.getByText(Constants.SUBMIT_BUTTON_TEXT));
            });

            expect(modelsService.createNewModel).toBeCalled();
            expect(mockedAddAlert).toBeCalledWith(Constants.MODEL_CREATED_MESSAGE);
            expect(mockSetModels).toBeCalledTimes(1);
        });
    });

    describe('update model', () => {
        beforeEach(() => {
            render(<ModelCreateUpdateModal closeForm = {mockCloseForm} modelToChange = {testModels[0]} tags = {testTags}
                setTags = {mockSetTags} models = {testModels} setModels = {mockSetModels}/>);
        });

        test('model\'s properties should be displayed in form', async () => {

            expect(await screen.findByDisplayValue(testModels[0].name)).toBeInTheDocument();
            expect(await screen.findByDisplayValue(testModels[0].description)).toBeInTheDocument();

            expect(await screen.findByText(testTags[0].name)).toBeInTheDocument();
            expect(await screen.findByText(testTags[1].name)).toBeInTheDocument();
        });

        test('model should be successfully updated', async () => {
            jest.spyOn(modelsService, 'updateModel').mockResolvedValue();
            jest.spyOn(modelsService, 'createNewTags').mockResolvedValue([testNewTag]);

            const tagInput = await screen.findByPlaceholderText(Constants.FORM_INPUT_TAG_PLACEHOLDER);
            const modelInput = await screen.findByText(Constants.FORM_INPUT_MODEL_FILE_TEXT);
            userEvent.type(tagInput, testNewTag.name);
            userEvent.click(await screen.findByText(Constants.FORM_ADD_TAG_BUTTON_TEXT));
            userEvent.upload(modelInput, testModelToCreate.file);

            await act(async () => {
                userEvent.click(screen.getByText(Constants.SUBMIT_BUTTON_TEXT));
            });

            expect(modelsService.updateModel).toBeCalled();
            expect(mockedAddAlert).toBeCalledWith(Constants.MODEL_UPDATED_MESSAGE);
            expect(mockSetTags).toBeCalledTimes(1);

        });
    });

});

describe('autosuggest tags functionality', () => {
    beforeEach(() => {
        render(<ModelCreateUpdateModal closeForm = {mockCloseForm} modelToChange = {testModels[1]} tags = {testTags}
            setTags = {mockSetTags} models = {testModels} setModels = {mockSetModels}/>);
    });

    test('choosed tag should be displayed in form', async () => {
        const tagInput = await screen.findByPlaceholderText(Constants.FORM_INPUT_TAG_PLACEHOLDER);
        tagInput.focus();
        const tagContainer = tagInput.parentNode;
        const tagBlock = await within(tagContainer).findByText(testTags[0].name);
        userEvent.click(tagBlock);
        tagInput.blur();
        expect(await screen.findByText(testTags[0].name)).toBeInTheDocument();
    });

    test('tag length error should be displayed in form', async () => {
        const notValidTagName = 'length is more than 15 characters';
        const tagInput = await screen.findByPlaceholderText(Constants.FORM_INPUT_TAG_PLACEHOLDER);
        userEvent.type(tagInput, notValidTagName);
        userEvent.click(await screen.findByText(Constants.FORM_ADD_TAG_BUTTON_TEXT));

        expect(await screen.findByText(Constants.TAG_LENGTH_ERROR_MESSAGE)).toBeInTheDocument();
        expect(screen.queryByText(notValidTagName)).not.toBeInTheDocument();
    });

    test('removed tag should not be displayed in form', async () => {
        const tagInput = await screen.findByPlaceholderText(Constants.FORM_INPUT_TAG_PLACEHOLDER);
        userEvent.type(tagInput, testTags[0].name);
        userEvent.click(await screen.findByText(Constants.FORM_ADD_TAG_BUTTON_TEXT));

        const modelTagContainer = (await screen.findByText(testTags[0].name)).parentNode;
        await act (async() => {
            userEvent.click(within(modelTagContainer).getByRole('button'));
        });
        expect(screen.queryByText(testTags[0].name)).not.toBeInTheDocument();
    });

});
