import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { testModels, testModelWithFile } from '../../constants/TestTemplates';
import modelsService from '../../services/ModelsService';
import ModelViewerComponent from './ModelViewerComponent';
import { ModelRenderer } from '../../modelRenderer/ModelRenderer';
import { BACK_IMAGE_ALT } from '../../constants/Constants';
import userEvent from '@testing-library/user-event';
import { HOME_LINK_PATH } from '../../constants/SystemConstants';
import filesService from '../../services/FilesService';

const mockHistoryPush = jest.fn();
let mockModelWithFile;
const mockModelId = testModelWithFile.modelId;
const mockStart = jest.fn();
const mockStop = jest.fn();

const mockedAddAlert = jest.fn();
jest.mock('../AlertComponent/useAlertHook', () => ({
    __esModule: true,
    default: () => ({addAlert: mockedAddAlert})
}));

jest.mock('react-router-dom', () => ({
    useHistory: () => ({
        push: mockHistoryPush
    }),
    useLocation: () => ({
        modelFromLink: mockModelWithFile
    }),
    useParams: () => ({modelId: mockModelId})
}));
jest.mock('../../modelRenderer/ModelRenderer');

beforeAll(() => {
    ModelRenderer.mockImplementation(() => ({
        start: mockStart,
        stop: mockStop
    }));
});

beforeEach(() => {
    jest.spyOn(ModelRenderer.prototype, 'start').mockImplementation(() => mockStart());
    mockModelWithFile = {...testModelWithFile};
});

afterEach(() => {
    jest.resetAllMocks();
});

test('when redirected from home page, model service should not be called', async() => {
    jest.spyOn(modelsService, 'getModel');
    jest.spyOn(filesService, 'getModelFile');
    render(<ModelViewerComponent/>);
    await screen.findByText(new Date(mockModelWithFile.updatedAt).toLocaleString(), {exact: false});
    expect(ModelRenderer).toBeCalledWith(expect.anything(), mockModelWithFile.modelFile);
    expect(mockStart).toBeCalled();
    expect(modelsService.getModel).not.toBeCalled();
    expect(filesService.getModelFile).not.toBeCalled();
});

test('when opened as new page, model service should be called', async() => {
    mockModelWithFile = null;
    jest.spyOn(modelsService, 'getModel').mockResolvedValue(testModels[0]);
    jest.spyOn(filesService, 'getModelFile').mockResolvedValue(testModelWithFile.modelFile);
    render(<ModelViewerComponent/>);
    await screen.findByText(new Date(testModels[0].updatedAt).toLocaleString(), {exact: false});
    expect(ModelRenderer).toBeCalledWith(expect.anything(), testModelWithFile.modelFile);
    expect(mockStart).toBeCalled();
    expect(modelsService.getModel).toBeCalled();
    expect(filesService.getModelFile).toBeCalled();
});

test('on button click should redirect to home page', async() => {
    render(<ModelViewerComponent/>);
    userEvent.click(await screen.findByAltText(BACK_IMAGE_ALT));
    expect(mockHistoryPush).toBeCalledWith(HOME_LINK_PATH);
});

test('when error happened alert should be called and redirected to home page', async() => {
    const errorMessage = 'Could not render model';
    mockStart.mockRejectedValue(new Error(errorMessage));
    await act(async () => {
        render(<ModelViewerComponent/>);
    });
    expect(mockedAddAlert).toBeCalledWith(errorMessage);
    expect(mockHistoryPush).toBeCalledWith(HOME_LINK_PATH);
});
