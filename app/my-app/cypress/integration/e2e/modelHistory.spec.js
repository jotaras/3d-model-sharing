import { testAuthenticatedAdmin, testModels, testTags } from '../../../src/constants/TestTemplates';
import * as Constants from '../../../src/constants/Constants';
import modelsService from '../../../src/services/ModelsService';
import sortOrder from '../../../src/services/SortOrder';
import { HOME_LINK_PATH, MODEL_VIEWER_PATH } from '../../../src/constants/SystemConstants';

const loadModelFileId ='load-model-file';
const loadModelPreviewId = 'load-model-preview';
const expandedRowsClass = '.expanded-model-body';
const rowRole = 'row';
const rowGroupRole = 'rowgroup';
const modelType = 'model';
const imageType = 'image/png';
const formRole = 'form';
const testModelName = 'test-model.stl';
const testPreviewName = 'image-for-test.png';
const beVisible = 'be.visible';
const exist = 'exist';
const notExist = 'not.exist';
const updatedFileFlag = 'updated';
const createdFileFlag = 'created';
let models;

describe('creating models for tests', () => {
    it('creating', () => {
        cy.login(testAuthenticatedAdmin);
        cy.visit('https://localhost:3000/models');
        for (const model of testModels) {
            cy.findByText(Constants.NEW_MODEL_BUTTON_NAME).click();
            cy.get(formRole).within(() => {
                cy.findByPlaceholderText(Constants.FORM_INPUT_NAME_PLACEHOLDER).type(model.name);
                cy.findByPlaceholderText(Constants.FORM_INPUT_DESCRIPTION_PLACEHOLDER).type(model.description);
                for (const tagId of model.tagIds) {
                    const tagName = modelsService.getTagName(tagId, testTags);
                    cy.findByPlaceholderText(Constants.FORM_INPUT_TAG_PLACEHOLDER).type(tagName);
                    cy.findByText(Constants.FORM_ADD_TAG_BUTTON_TEXT).click();
                }

                cy.loadFile(`[id^=${loadModelFileId}]`, testModelName, modelType, `${model.name}-${createdFileFlag}-${testModelName}`);
                cy.loadFile(`[id^=${loadModelPreviewId}]`, testPreviewName, imageType);
                cy.findByText(Constants.SUBMIT_BUTTON_TEXT).click();
            });
        }

        for (const model of testModels) {
            cy.findByText(model.name).parent().findByAltText(Constants.UPDATE_MODEL_IMAGE_ALT).click();
            cy.get(formRole).within(() => {
                cy.loadFile(`[id^=${loadModelFileId}]`, testModelName, modelType, `${model.name}-${updatedFileFlag}-${testModelName}`);
                cy.findByText(Constants.SUBMIT_BUTTON_TEXT).click();
            });
        }
        cy.wait(1000);
        cy.request('GET', 'https://localhost:8080/api/models', {})
            .then(response => {
                models = response.body;
                for (const model of models) {
                    cy.request('GET', `https://localhost:8080/api/models/${model.modelId}/history`)
                        .then(response => model.modelHistory = response.body);
                }
            });
        cy.wait(1000);
    });
});


describe('check components', () => {
    it('navigation bar should be displayed', () => {
        cy.visit('https://localhost:3000/home');
        cy.findByText(Constants.HOME_BUTTON_TEXT).should(exist).and(beVisible);
        cy.findByText(Constants.MODELS_MANAGEMENT_BUTTON_TEXT).should(exist).and(beVisible);
        cy.findByText(Constants.USERS_MANAGEMENT_BUTTON_TEXT).should(exist).and(beVisible);
        cy.findByText(Constants.LOGIN_BUTTON_TEXT).should(exist).and(beVisible);
        cy.findByPlaceholderText(Constants.FORM_INPUT_TAG_PLACEHOLDER).should(notExist);
        cy.findByText(Constants.FORM_ADD_TAG_BUTTON_TEXT).should(notExist);
    });

    it('should be displayed on page', () => {
        cy.findByText(Constants.SELECTED_TAGS_LABEL).should(exist).and(beVisible);
        cy.findByAltText(Constants.ADD_TAG_IMAGE_ALT).should(exist).and(beVisible);
        cy.findByPlaceholderText(Constants.SEARCH_MODEL_PLACEHOLDER).should(exist).and(beVisible);
        cy.findByText(Constants.NAME_SORT_BUTTON_TEXT).should(exist).and(beVisible);
        cy.findByText(Constants.DECRIPTION_SORT_BUTTON_TEXT).should(exist).and(beVisible);
        cy.findByText(Constants.TAGS_SORT_BUTTON_TEXT).should(exist).and(beVisible);
        cy.findByText(Constants.ACTIONS_SORT_BUTTON_TEXT).should(exist).and(beVisible);
    });

    it('models should be displayed', () => {
        for (const model of testModels) {
            cy.findByText(model.name).parent().within(() => {
                cy.findByText(model.description).should(exist);
                cy.findByText(Constants.PREVIEW_MODEL_BUTTON_TEXT).should(exist);
                cy.findByText(Constants.DOWNLOAD_MODEL_BUTTON_TEXT).should(exist);
                for (const tagId of model.tagIds) {
                    const tagName = modelsService.getTagName(tagId, testTags);
                    cy.findByText(tagName, {exact: false}).should(exist);
                }
            });
        }
    });

});

describe('expanding model', () => {
    it('on button click model should expand with history', () => {
        for (const model of models) {
            cy.findByText(model.name).parent().findByAltText(Constants.EXPAND_MODEL_IMAGE_ALT).click();
            cy.contains(Constants.UPDATED_DATE_LABEL)
                .parent().contains(Constants.UPDATED_BY_LABEL);
            cy.findByText(model.name).parent().findByAltText(Constants.EXPAND_MODEL_IMAGE_ALT).click();
        }
    });

    it('the first model history should be last update of model', () => {
        for (const model of models) {
            cy.findByText(model.name).parent().findByAltText(Constants.EXPAND_MODEL_IMAGE_ALT).click();
            cy.findByText(Constants.LAST_UPDATED_LABEL).parent()
                .findByText(new Date(model.updatedAt).toLocaleString()).should(exist);
            cy.findByText(model.name).parent().findByAltText(Constants.EXPAND_MODEL_IMAGE_ALT).click();
        }
    });

    it('model history should be sorted by date', () => {
        for (const model of models) {
            const expectedOrderOfDates = [];
            expectedOrderOfDates.push(model.updatedAt);
            for (const modelHistory of model.modelHistory.reverse()) {
                expectedOrderOfDates.push(modelHistory.createdAt);
            }
            cy.findByText(model.name).parent().findByAltText(Constants.EXPAND_MODEL_IMAGE_ALT).click();
            cy.get(expandedRowsClass).each((row, index) => {
                cy.wrap(row).findByText(new Date(expectedOrderOfDates[index]).toLocaleString()).should(exist);
            });
            cy.findByText(model.name).parent().findByAltText(Constants.EXPAND_MODEL_IMAGE_ALT).click();
        }
    });

    it('user data, who modified the model, should be displayed', () => {
        for (const model of models) {
            cy.findByText(model.name).parent().findByAltText(Constants.EXPAND_MODEL_IMAGE_ALT).click();
            cy.get(expandedRowsClass).each((row) => {
                cy.wrap(row).findByText(testAuthenticatedAdmin.firstName, {exact: false}).should(exist);
                cy.wrap(row).findByText(testAuthenticatedAdmin.lastName, {exact: false}).should(exist);
            });
            cy.findByText(model.name).parent().findByAltText(Constants.EXPAND_MODEL_IMAGE_ALT).click();
        }
    });

    it('model preview should be displayed', () => {
        for (const model of models) {
            cy.findByText(model.name).parent().findByText(Constants.PREVIEW_MODEL_BUTTON_TEXT).click();
            cy.findByAltText(Constants.PREVIEW_IMAGE_ALT).should(exist).and((img) => {
                expect(img[0].naturalWidth).to.be.greaterThan(0);
                expect(img[0].naturalHeight).to.be.greaterThan(0);
            });
            cy.findByAltText(Constants.CLOSE_IMG_ALT).click();
            cy.findByText(model.name).parent().findByAltText(Constants.EXPAND_MODEL_IMAGE_ALT).click();
            cy.get(expandedRowsClass).each((row) => {
                cy.wrap(row).findByText(Constants.PREVIEW_MODEL_BUTTON_TEXT).click();
                cy.findByAltText(Constants.PREVIEW_IMAGE_ALT).should(exist).and((img) => {
                    expect(img[0].naturalWidth).to.be.greaterThan(0);
                    expect(img[0].naturalHeight).to.be.greaterThan(0);
                });
                cy.findByAltText(Constants.CLOSE_IMG_ALT).click();
            });
            cy.findByText(model.name).parent().findByAltText(Constants.EXPAND_MODEL_IMAGE_ALT).click();
        }
    });

    it('model downloading should be successfull', () => {
        for (const model of models) {
            cy.findByText(model.name).parent().findByText(Constants.DOWNLOAD_MODEL_BUTTON_TEXT).click();
            cy.readFile(`cypress\\downloads\\${model.name}-${updatedFileFlag}-${testModelName}`).should(exist);
        }
    });

    it('downloading model files from first model history, should be file from creating model', () => {
        for (const model of models) {
            cy.findByText(model.name).parent().findByAltText(Constants.EXPAND_MODEL_IMAGE_ALT).click();
            cy.get(expandedRowsClass).last().findByText(Constants.DOWNLOAD_MODEL_BUTTON_TEXT).click();
            cy.readFile(`cypress\\downloads\\${model.name}-${createdFileFlag}-${testModelName}`).should(exist);
            cy.findByText(model.name).parent().findByAltText(Constants.EXPAND_MODEL_IMAGE_ALT).click();
        }
    });

});

describe('searching models', () => {
    it('only founded model should be displayed', () => {
        for (const model of models) {
            cy.findByPlaceholderText(Constants.SEARCH_MODEL_PLACEHOLDER).type(model.name);
            cy.findByText(model.name).should(exist);
            const otherModels = models.filter((m) => m.modelId !== model.modelId);
            for (const otherModel of otherModels) {
                cy.findByText(otherModel.name).should(notExist);
            }
            cy.focused().clear();
        }
    });
});

describe('sorting models', () => {
    it('models should be sorted by name in ascending', () => {
        const expectedModelList = [...models].sort(sortOrder('name', true));
        cy.findByText(Constants.NAME_SORT_BUTTON_TEXT).click();
        cy.findAllByRole(rowGroupRole).next().findAllByRole(rowRole).each((row, index) => {
            cy.wrap(row).contains(expectedModelList[index].name);
        });
    });

    it('models should be sorted by name in descending', () => {
        const expectedModelList = [...models].sort(sortOrder('name', false));
        cy.findByText(Constants.NAME_SORT_BUTTON_TEXT).click();
        cy.findAllByRole(rowGroupRole).next().findAllByRole(rowRole).each((row, index) => {
            cy.wrap(row).contains(expectedModelList[index].name);
        });
    });
});

describe('filtering models', () => {
    it('only models with selected tag should be displayed', () => {
        cy.findByAltText(Constants.ADD_TAG_IMAGE_ALT).click();
        for (const model of models) {
            const tagNames = model.tagIds.map((tagId) => modelsService.getTagName(tagId, testTags));
            for (const tagName of tagNames) {
                cy.findByPlaceholderText(Constants.FORM_INPUT_TAG_PLACEHOLDER).type(tagName);
                cy.findByText(Constants.FORM_ADD_TAG_BUTTON_TEXT).click();
            }
            cy.findByText(model.name).should(exist);
            const otherModels = models.filter(m => {
                return !model.tagIds.every((elem) => m.tagIds.includes(elem));
            });
            console.log(otherModels);
            for (const otherModel of otherModels) {
                cy.findByText(otherModel.name).should(notExist);
            }

            cy.findByText(Constants.SELECTED_TAGS_LABEL).parent().within(() => {
                for (const tagName of tagNames) {
                    cy.findByText(tagName).parent().findByAltText(Constants.CLOSE_IMG_ALT).click();
                }
            });
        }


    });
});

describe('model viewing', () => {
    it('model viewing', () => {
        for (const model of models) {
            cy.findByText(model.name).parent().findByText(Constants.VIEW_MODEL_BUTTON_TEXT).click();
            cy.url().should('include', `${MODEL_VIEWER_PATH}/${model.modelId}`);

            cy.findByText(model.name).should(exist);
            cy.findByText(new Date(model.updatedAt).toLocaleString(), {exact: false}).should(exist);

            cy.get('canvas').should(exist);

            cy.findByAltText(Constants.BACK_IMAGE_ALT).click();
            cy.url().should('include', `${HOME_LINK_PATH}`);
        }
    });
    it('view model from history', () => {
        for (const model of models) {
            for (const history of model.modelHistory) {
                cy.findByText(model.name).parent().findByAltText(Constants.EXPAND_MODEL_IMAGE_ALT).click();
                cy.get(expandedRowsClass).each((row, index) => {
                    if (index !== 0) {
                        cy.wrap(row).findByText(Constants.VIEW_MODEL_BUTTON_TEXT).click();
                        cy.url().should('include', `${MODEL_VIEWER_PATH}/${model.modelId}`);
                        cy.findByText(model.name).should(exist);
                        cy.findByText(new Date(history.createdAt).toLocaleString(), {exact: false}).should(exist);
                        cy.findByAltText(Constants.BACK_IMAGE_ALT).click();
                    }
                });
            }
        }
    });
});

describe('deleting models after tests', () => {
    it('deleting', () => {
        cy.login(testAuthenticatedAdmin);
        cy.visit('https://localhost:3000/models');
        for (const model of testModels) {
            cy.findByText(model.name).parent().findByAltText(Constants.DELETE_MODEL_IMAGE_ALT).click();
            cy.findByText(Constants.CONFIRM_BUTTON_TEXT).click();
        }
    });
});
