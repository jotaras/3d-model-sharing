import * as Constants from '../../../src/constants/Constants';
import * as SystemConstants from '../../../src/constants/SystemConstants';

import { testAuthenticatedAdmin, testModels, testTags } from '../../../src/constants/TestTemplates';

const beVisible = 'be.visible';
const haveLength = 'have.length';
const exist = 'exist';
const notExist = 'not.exist';
const testModelName = 'test-model.stl';
const testPreviewName = 'image-for-test.png';
const newModelName = 'updated model name';
const formRole = 'form';
const rowRole = 'row';
const rowGroupRole = 'rowgroup';
const buttonRole = 'button';
const loadModelFileId ='load-model-file';
const loadModelPreviewId = 'load-model-preview';
const modelType = 'model';
const imageType = 'image/png';

beforeEach(() => {
    cy.login(testAuthenticatedAdmin);
});

describe('check components', () => {
    it('components should be displayed on page', () => {
        cy.visit('https://localhost:3000/models');
        cy.findByText(Constants.NEW_MODEL_BUTTON_NAME).should(exist).and(beVisible);
        cy.findByPlaceholderText(Constants.SEARCH_MODEL_PLACEHOLDER).should(exist).and(beVisible);
        cy.findByText(Constants.PICTURE_SORT_BUTTON_TEXT).should(exist).and(beVisible);
        cy.findByText(Constants.NAME_SORT_BUTTON_TEXT).should(exist).and(beVisible);
        cy.findByText(Constants.DECRIPTION_SORT_BUTTON_TEXT).should(exist).and(beVisible);
        cy.findByText(Constants.TAGS_SORT_BUTTON_TEXT).should(exist).and(beVisible);
        cy.findByText(Constants.LAST_UPDATE_SORT_BUTTON_TEXT).should(exist).and(beVisible);
        cy.findByText(Constants.ACTIONS_SORT_BUTTON_TEXT).should(exist).and(beVisible);
    });

    it('components should be displayed on form', () => {
        cy.findByText(Constants.NEW_MODEL_BUTTON_NAME).click();
        cy.get(formRole).within(() => {
            cy.findByPlaceholderText(Constants.FORM_INPUT_NAME_PLACEHOLDER).should(exist).and(beVisible);
            cy.findByPlaceholderText(Constants.FORM_INPUT_DESCRIPTION_PLACEHOLDER).should(exist).and(beVisible);
            cy.findByPlaceholderText(Constants.FORM_INPUT_TAG_PLACEHOLDER).should(exist).and(beVisible);
            cy.findByText(Constants.FORM_ADD_TAG_BUTTON_TEXT).should(exist).and(beVisible);
            cy.findByText(Constants.FORM_INPUT_MODEL_FILE_TEXT).should(exist).and(beVisible);
            cy.findByText(Constants.FORM_INPUT_MODEL_PREVIEW_TEXT).should(exist).and(beVisible);
            cy.get(`[id^=${loadModelFileId}]`).not(beVisible);
            cy.get(`[id^=${loadModelPreviewId}]`).not(beVisible);
        });
        cy.findByAltText(Constants.CLOSE_MODEL_FORM_ALT).click();
    });
});

describe('create model', () => {
    it('validation errors should be displayed', () => {
        cy.findByText(Constants.NEW_MODEL_BUTTON_NAME).click();
        cy.get(formRole).within(() => {
            cy.findByText(Constants.SUBMIT_BUTTON_TEXT).click();
            cy.findByText(Constants.MODEL_FILE_EMPTY_ERROR_MESSAGE).should(exist).and(beVisible);
            cy.findByText(Constants.MODEL_NAME_EMPTY_ERROR_MESSAGE).should(exist).and(beVisible);
            cy.findByText(Constants.MODEL_DESCR_EMPTY_ERROR_MESSAGE).should(exist).and(beVisible);
        });
    });

    it('model should be created with preview, alert should be displayed', () => {
        cy.get(formRole).within(() => {
            cy.findByPlaceholderText(Constants.FORM_INPUT_NAME_PLACEHOLDER).type(testModels[0].name);
            cy.findByPlaceholderText(Constants.FORM_INPUT_DESCRIPTION_PLACEHOLDER).type(testModels[0].description);
            cy.findByPlaceholderText(Constants.FORM_INPUT_TAG_PLACEHOLDER).type(testTags[0].name);
            cy.findByText(Constants.FORM_ADD_TAG_BUTTON_TEXT).click();
            cy.findByPlaceholderText(Constants.FORM_INPUT_TAG_PLACEHOLDER).type(testTags[1].name);
            cy.findByText(Constants.FORM_ADD_TAG_BUTTON_TEXT).click();

            cy.loadFile(`[id^=${loadModelFileId}]`, testModelName, modelType);
            cy.loadFile(`[id^=${loadModelPreviewId}]`, testPreviewName, imageType);
            cy.findByText(testPreviewName).should(exist).and(beVisible);
            cy.findByText(testModelName).should(exist).and(beVisible);
            cy.findByText(Constants.SUBMIT_BUTTON_TEXT).click();
        });
        cy.findByText(Constants.MODEL_CREATED_MESSAGE).should(exist).and(beVisible);
        cy.wait(SystemConstants.ALERT_DISPOSAL_TIME_OUT);
        cy.findByText(Constants.MODEL_CREATED_MESSAGE).should(notExist);
        cy.findByText(testModels[0].name).should(exist);
        cy.findByText(testModels[0].description).should(exist);
        cy.findByText(testModels[0].name).parent().contains(testTags[0].name);
        cy.findByText(testModels[0].name).parent().contains(testTags[1].name);
    });

    it('model should be created without preview, alert should be displayed', () => {
        cy.findByText(Constants.NEW_MODEL_BUTTON_NAME).click();
        cy.get(formRole).within(() => {
            cy.findByPlaceholderText(Constants.FORM_INPUT_NAME_PLACEHOLDER).type(testModels[1].name);
            cy.findByPlaceholderText(Constants.FORM_INPUT_DESCRIPTION_PLACEHOLDER).type(testModels[1].description);
            cy.loadFile(`[id^=${loadModelFileId}]`, testModelName, modelType);
            cy.findByPlaceholderText(Constants.FORM_INPUT_TAG_PLACEHOLDER).type(testTags[1].name);
            cy.findByText(Constants.FORM_ADD_TAG_BUTTON_TEXT).click();

            cy.findByText(testModelName).should(exist).and(beVisible);
            cy.findByText(Constants.SUBMIT_BUTTON_TEXT).click();
        });

        cy.findByText(Constants.MODEL_CREATED_MESSAGE).should(exist).and(beVisible);
        cy.wait(SystemConstants.ALERT_DISPOSAL_TIME_OUT);
        cy.findByText(Constants.MODEL_CREATED_MESSAGE).should(notExist);
        cy.findByText(testModels[1].name).should(exist);
        cy.findByText(testModels[1].description).should(exist);
        cy.findByText(testModels[1].name).parent().contains(testTags[1].name);
    });

    it('models previews should be displayed', () => {
        cy.findByText(testModels[0].name).parent().findByAltText(Constants.PREVIEW_IMAGE_ALT).should(exist).and((img) => {
            expect(img[0].naturalWidth).to.be.greaterThan(0);
            expect(img[0].naturalHeight).to.be.greaterThan(0);
        });

        cy.findByText(testModels[1].name).parent().findByAltText(Constants.PREVIEW_IMAGE_ALT).should(exist).and((img) => {
            expect(img[0].naturalWidth).to.be.greaterThan(0);
            expect(img[0].naturalHeight).to.be.greaterThan(0);
        });
    });
});

describe('sort models', () => {
    it('models should be sorted by last update in ascending', () => {
        cy.findByText(Constants.LAST_UPDATE_SORT_BUTTON_TEXT).click();
        cy.findAllByRole(rowGroupRole)
            .next()
            .findAllByRole(rowRole)
            .first()
            .contains(testModels[0].name)
            .parent()
            .next()
            .contains(testModels[1].name);
    });

    it('models should be sorted by last update in descending', () => {
        cy.findByText(Constants.LAST_UPDATE_SORT_BUTTON_TEXT).click();
        cy.findAllByRole(rowGroupRole)
            .next()
            .findAllByRole(rowRole)
            .first()
            .contains(testModels[1].name)
            .parent()
            .next()
            .contains(testModels[0].name);
    });
});

describe('search model', () => {
    afterEach(() => {
        cy.focused().clear();
    });

    it('only first model found by name, should be displayed', () => {
        cy.findByPlaceholderText(Constants.SEARCH_MODEL_PLACEHOLDER).type(testModels[0].name);
        cy.findAllByRole(rowGroupRole).next().should(haveLength, 1);
        cy.findByText(testModels[0].name).should(exist);
        cy.findByText(testModels[1].name).should(notExist);
    });

    it('only second model found by name, should be displayed', () => {
        cy.findByPlaceholderText(Constants.SEARCH_MODEL_PLACEHOLDER).type(testModels[1].name);
        cy.findAllByRole(rowGroupRole).next().should(haveLength, 1);
        cy.findByText(testModels[1].name).should(exist);
        cy.findByText(testModels[0].name).should(notExist);
    });
});

describe('update model', () => {
    it('model to update should be displayed in form', () => {
        cy.findByText(testModels[0].name).parent().findByAltText(Constants.UPDATE_MODEL_IMAGE_ALT).click();
        cy.get(formRole).within(() => {
            cy.findByDisplayValue(testModels[0].name).should(exist);
            cy.findByText(testModels[0].description).should(exist);
            cy.findByText(testTags[0].name).should(exist);
            cy.findByText(testTags[1].name).should(exist);
        });
    });

    it('model should be updated with new name and tags, alert should be displayed', () => {
        cy.get(formRole).within(() => {
            cy.findByDisplayValue(testModels[0].name).clear().type(newModelName);
            cy.findByText(testTags[0].name).parent().within(() => {
                cy.get(buttonRole).click();
            });
        });
        cy.loadFile(`[id^=${loadModelFileId}]`, testModelName, modelType);
        cy.findByText(Constants.SUBMIT_BUTTON_TEXT).click();
        cy.findByText(newModelName).should(exist);
        cy.findByText(Constants.MODEL_UPDATED_MESSAGE).should(exist).and(beVisible);
        cy.wait(SystemConstants.ALERT_DISPOSAL_TIME_OUT);
        cy.findByText(Constants.MODEL_UPDATED_MESSAGE).should(notExist);
        cy.findByText(newModelName).parent().findByText(testTags[0].name).should(notExist);
        cy.findByText(testModels[0].name).should(notExist);
    });
});


describe('delete models', () => {
    it('cancel delete, model should not be deleted', () => {
        cy.findByText(testModels[1].name).parent().findByAltText(Constants.DELETE_MODEL_IMAGE_ALT).click();
        cy.findByText(Constants.CANCEL_BUTTON_TEXT).click();
        cy.findByText(testModels[1].name).should(exist);
    });

    it('models should be deleted, alerts should be displayed', () => {
        cy.findByText(testModels[1].name).parent().findByAltText(Constants.DELETE_MODEL_IMAGE_ALT).click();
        cy.findByText(Constants.CONFIRM_BUTTON_TEXT).click();
        cy.findByText(newModelName).parent().findByAltText(Constants.DELETE_MODEL_IMAGE_ALT).click();
        cy.findByText(Constants.CONFIRM_BUTTON_TEXT).click();

        cy.findByText(newModelName).should(notExist);
        cy.findAllByText(Constants.MODEL_DELETED_MESSAGE).should(exist).and(beVisible);
        cy.findByText(testModels[1].name).should(notExist);
        cy.wait(SystemConstants.ALERT_DISPOSAL_TIME_OUT);
        cy.findByText(Constants.MODEL_DELETED_MESSAGE).should(notExist);
    });
});
