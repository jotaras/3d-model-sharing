import * as Constants from '../../../src/constants/Constants.js';
import { testAuthenticatedAdmin, testAuthenticatedUser, testUserPassword, testUsers } from '../../../src/constants/TestTemplates.js';
import * as SystemConstants from '../../../src/constants/SystemConstants';

const beVisible = 'be.visible';
const haveLength = 'have.length';
const exist = 'exist';
const notExist = 'not.exist';
const rowRole = 'row';
const rowGroupRole = 'rowgroup';
const formRole = 'form';
const updatedName = 'UpdatedTestName';

beforeEach(() => {
    cy.login(testAuthenticatedAdmin);
});

describe('check components', () => {
    it('components should exist on page', () => {
        cy.visit('https://localhost:3000/users');
        cy.findByText(Constants.NEW_USER_BUTTON_TEXT).should(exist);
        cy.findByPlaceholderText(Constants.SEARCH_USER_PLACEHOLDER).should(exist);
        cy.findByText(Constants.PICTURE_SORT_BUTTON_TEXT).should(exist).and(beVisible);
        cy.findByText(Constants.FIRST_NAME_SORT_BUTTON_TEXT).should(exist).and(beVisible);
        cy.findByText(Constants.LAST_NAME_SORT_BUTTON_TEXT).should(exist).and(beVisible);
        cy.findByText(Constants.EMAIL_SORT_BUTTON_TEXT).should(exist).and(beVisible);
        cy.findByText(Constants.ROLES_SORT_BUTTON_TEXT).should(exist).and(beVisible);
        cy.findByText(Constants.ACTIONS_SORT_BUTTON_TEXT).should(exist).and(beVisible);

    });

    it('components should exist on form', () => {
        cy.findByText(Constants.NEW_USER_BUTTON_TEXT).click();
        cy.get(formRole).within(() => {
            cy.findByText(Constants.SELECT_ROLE_MESSAGE).should(exist).and(beVisible);

            cy.findByPlaceholderText(Constants.FIRST_NAME_INPUT_PLACEHOLDER).should(exist).and(beVisible);
            cy.findByPlaceholderText(Constants.LAST_NAME_INPUT_PLACEHOLDER).should(exist).and(beVisible);
            cy.findByPlaceholderText(Constants.EMAIL_INPUT_PLACEHOLDER).should(exist).and(beVisible);
            cy.findByText(Constants.SUBMIT_BUTTON_TEXT).should(exist).and(beVisible);
            cy.findByText(Constants.FORM_INPUT_PICTURE_TEXT).should(exist).and(beVisible);
        });
        cy.findByAltText(Constants.CLOSE_USER_FORM_ALT).click();
    });
});

describe('create new user', () => {
    it('user should be created, alert should be displayed', () => {
        cy.findByText(Constants.NEW_USER_BUTTON_TEXT).click();
        cy.get(formRole).within(() => {
            cy.findByPlaceholderText(Constants.FIRST_NAME_INPUT_PLACEHOLDER).type(testUsers[0].firstName);
            cy.findByPlaceholderText(Constants.LAST_NAME_INPUT_PLACEHOLDER).type(testUsers[0].lastName);
            cy.findByPlaceholderText(Constants.EMAIL_INPUT_PLACEHOLDER).type(testUsers[0].email);
            cy.findByPlaceholderText(Constants.PASSWORD_INPUT_PLACEHOLDER).type(testUserPassword);

            cy.findByText(Constants.SELECT_ROLE_MESSAGE).parent().then((selectRole) => {
                for (const roleId of testUsers[0].roleIds) {
                    cy.wrap(selectRole).select(roleId);
                    cy.findByText(Constants.ADD_ROLE_BUTTON_TEXT).click();
                }
            });

            cy.findByText(Constants.SUBMIT_BUTTON_TEXT).click();
        });

        cy.findByText(testUsers[0].firstName).should(exist);
        cy.findByText(Constants.USER_CREATED_MESSAGE).should(exist).and(beVisible);
        cy.wait(SystemConstants.ALERT_DISPOSAL_TIME_OUT);
        cy.findByText(Constants.USER_CREATED_MESSAGE).should(notExist);
    });

    it('user with picture should be created, alert should be displayed', () => {
        cy.findByText(Constants.NEW_USER_BUTTON_TEXT).click();
        cy.get(formRole).within(() => {
            cy.findByPlaceholderText(Constants.FIRST_NAME_INPUT_PLACEHOLDER).type(testUsers[1].firstName);
            cy.findByPlaceholderText(Constants.LAST_NAME_INPUT_PLACEHOLDER).type(testUsers[1].lastName);
            cy.findByPlaceholderText(Constants.EMAIL_INPUT_PLACEHOLDER).type(testUsers[1].email);
            cy.findByPlaceholderText(Constants.PASSWORD_INPUT_PLACEHOLDER).type(testUserPassword);
            cy.findByText(Constants.SELECT_ROLE_MESSAGE).parent().select(testUsers[1].roleIds);

            cy.findByText(Constants.SELECT_ROLE_MESSAGE).parent().then((selectRole) => {
                for (const roleId of testUsers[1].roleIds) {
                    cy.wrap(selectRole).select(roleId);
                    cy.findByText(Constants.ADD_ROLE_BUTTON_TEXT).click();
                }
            });

            cy.loadFile('input[type=file]', 'image-for-test.png', 'image/png');
            cy.findByText(Constants.SUBMIT_BUTTON_TEXT).click();
        });

        cy.findByText(testUsers[1].firstName).should(exist);
        cy.findByText(Constants.USER_CREATED_MESSAGE).should(exist).and(beVisible);
        cy.wait(SystemConstants.ALERT_DISPOSAL_TIME_OUT);
        cy.findByText(Constants.USER_CREATED_MESSAGE).should(notExist);
    });


    it('users images should be displayed', () => {
        cy.findByText(testUsers[0].firstName).parent().findByAltText(Constants.USER_PROFILE_IMAGE_ALT).should(exist).and((img) => {
            expect(img[0].naturalWidth).to.be.greaterThan(0);
            expect(img[0].naturalHeight).to.be.greaterThan(0);
        });
        cy.findByText(testUsers[1].firstName).parent().findByAltText(Constants.USER_PROFILE_IMAGE_ALT).should(exist).and((img) => {
            expect(img[0].naturalWidth).to.be.greaterThan(0);
            expect(img[0].naturalHeight).to.be.greaterThan(0);
        });
    });
});

describe('sort users', () => {
    it('users should be sorted by first name in ascending order', () => {
        cy.findByText(Constants.FIRST_NAME_SORT_BUTTON_TEXT).click();
        cy.findAllByRole(rowGroupRole)
            .next()
            .findAllByRole(rowRole)
            .first()
            .contains(testAuthenticatedAdmin.firstName);

        cy.findAllByRole(rowGroupRole)
            .next()
            .findAllByRole(rowRole)
            .last()
            .contains(testAuthenticatedUser.firstName);

    });

    it('users should be sorted by first name in descending order', () => {
        cy.findByText(Constants.FIRST_NAME_SORT_BUTTON_TEXT).click();
        cy.findAllByRole(rowGroupRole)
            .next()
            .findAllByRole(rowRole)
            .first()
            .contains(testAuthenticatedUser.firstName);

        cy.findAllByRole(rowGroupRole)
            .next()
            .findAllByRole(rowRole)
            .last()
            .contains(testAuthenticatedAdmin.firstName);
    });

});

describe('search user', () => {
    afterEach(() => {
        cy.focused().clear();
    });

    it('only user found by first name, should be displayed', () => {
        cy.findByPlaceholderText(Constants.SEARCH_USER_PLACEHOLDER).type(testUsers[0].firstName);
        cy.findAllByRole(rowGroupRole).next().should(haveLength, 1);
        cy.findByText(testUsers[0].firstName).should(exist);
    });

    it('only user found by last name, should be displayed', () => {
        cy.findByPlaceholderText(Constants.SEARCH_USER_PLACEHOLDER).type(testUsers[1].lastName);
        cy.findAllByRole(rowGroupRole).next().should(haveLength, 1);
        cy.findByText(testUsers[1].lastName).should(exist);

    });

    it('only user found by email, should be displayed', () => {
        cy.findByPlaceholderText(Constants.SEARCH_USER_PLACEHOLDER).type(testUsers[0].email);
        cy.findAllByRole(rowGroupRole).next().should(haveLength, 1);
        cy.findByText(testUsers[0].email).should(exist);

    });
});

describe('update user', () => {
    it('user should be updated, alert should be displayed', () => {
        cy.findByText(testUsers[1].firstName).parent().findByAltText(Constants.UPDATE_USER_IMAGE_ALT).click();
        cy.get(formRole).within(() => {
            cy.findByPlaceholderText(Constants.FIRST_NAME_INPUT_PLACEHOLDER).clear().type(updatedName);
            cy.findByText(Constants.SUBMIT_BUTTON_TEXT).click();
        });

        cy.findByText(testUsers[1].firstName).should(notExist);
        cy.findByText(updatedName).should(exist);
        cy.findByText(Constants.USER_UPDATED_MESSAGE).should(exist).and(beVisible);
        cy.wait(SystemConstants.ALERT_DISPOSAL_TIME_OUT);
        cy.findByText(Constants.USER_UPDATED_MESSAGE).should(notExist);

    });
});

describe('delete users', () => {
    it('cancel confirm, user should not be deleted', () => {
        cy.findByText(testUsers[0].firstName).parent().findByAltText(Constants.DELETE_USER_IMAGE_ALT).click();
        cy.findByText(Constants.CANCEL_BUTTON_TEXT).click();
        cy.findByText(testUsers[0].firstName).should(exist);
    });

    it('users should be deleted, alert should be displayed', () => {
        cy.findByText(testUsers[0].firstName).parent().findByAltText(Constants.DELETE_USER_IMAGE_ALT).click();
        cy.findByText(Constants.CONFIRM_BUTTON_TEXT).click();
        cy.findByText(testUsers[0].firstName).should(notExist);

        cy.findByText(updatedName).parent().findByAltText(Constants.DELETE_USER_IMAGE_ALT).click();
        cy.findByText(Constants.CONFIRM_BUTTON_TEXT).click();
        cy.findByText(updatedName).should(notExist);
        cy.findAllByText(Constants.USER_DELETED_MESSAGE).should(exist).and(beVisible);
        cy.wait(SystemConstants.ALERT_DISPOSAL_TIME_OUT);
        cy.findByText(Constants.USER_DELETED_MESSAGE).should(notExist);
    });
});
