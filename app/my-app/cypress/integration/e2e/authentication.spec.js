import * as LoginConstants from '../../../src/constants/Constants';
import { testAuthenticatedAdmin, testAuthenticatedUser, testNotValidUser, testUserPassword, testUsers } from '../../../src/constants/TestTemplates';

const formRole = 'form';
const exist = 'exist';
const notExist = 'not.exist';

const loginRoute = 'https://localhost:3000/login';
const modelsRoute = 'https://localhost:3000/models';
const usersRoute = 'https://localhost:3000/users';


describe('login page', () => {
    beforeEach(() => {
        cy.visit(loginRoute);
    });

    it('empty input, validation errors should be displayed', () => {
        cy.get(formRole).within(() => {
            cy.findByText(LoginConstants.LOGIN_SUBMIT_BUTTON_TEXT).click();
        });
        cy.findByText(LoginConstants.EMAIL_EMPTY_ERROR_MESSAGE).should(exist);
        cy.findByText(LoginConstants.PASSWORD_EMPTY_ERROR_MESSAGE).should(exist);
    });

    it('invalid email, validation error should be displayed', () => {
        cy.get(formRole).within(() => {
            cy.findByPlaceholderText(LoginConstants.EMAIL_INPUT_PLACEHOLDER).type(testNotValidUser.email);
            cy.findByText(LoginConstants.LOGIN_SUBMIT_BUTTON_TEXT).click();
        });
        cy.findByText(LoginConstants.EMAIL_NOT_VALID_ERROR_MESSAGE).should(exist);
    });

    it('authentication failed, alert should be displayed', () => {
        cy.get(formRole).within(() => {
            cy.findByPlaceholderText(LoginConstants.EMAIL_INPUT_PLACEHOLDER).type(testUsers[0].email);
            cy.findByPlaceholderText(LoginConstants.PASSWORD_INPUT_PLACEHOLDER).type(testUserPassword);
            cy.findByText(LoginConstants.LOGIN_SUBMIT_BUTTON_TEXT).click();
        });
        cy.findByText(LoginConstants.AUTHENTICATION_FAILED_ERROR_MESSAGE).should(exist);
    });

    it('authentication successfull, user email and logout button should be displayed at navigation bar', () => {
        cy.findByText(LoginConstants.LOGOUT_BUTTON_TEXT).should(notExist);
        cy.get(formRole).within(() => {
            cy.findByPlaceholderText(LoginConstants.EMAIL_INPUT_PLACEHOLDER).type(testAuthenticatedUser.testEmail);
            cy.findByPlaceholderText(LoginConstants.PASSWORD_INPUT_PLACEHOLDER).type(testAuthenticatedUser.testPass);
            cy.findByText(LoginConstants.LOGIN_SUBMIT_BUTTON_TEXT).click();
        });
        cy.findByText(testAuthenticatedUser.testEmail).should(exist);
        cy.findByText(LoginConstants.LOGOUT_BUTTON_TEXT).should(exist);
    });
});

describe('access private page when unauthenticated', () => {
    it('users page should not be loaded', () => {
        cy.visit(usersRoute);
        cy.findByText(LoginConstants.ROUTE_ACCESS_FORBIDEN_ERROR_MESSAGE).should(exist);
        cy.findByAltText(LoginConstants.LOCK_IMAGE_ALT).should(exist);
    });

    it('models page should not be loaded', () => {
        cy.visit(modelsRoute);
        cy.findByText(LoginConstants.ROUTE_ACCESS_FORBIDEN_ERROR_MESSAGE).should(exist);
        cy.findByAltText(LoginConstants.LOCK_IMAGE_ALT).should(exist);
    });
});


describe('access private page when authenticated as user', () => {
    it('users page should not be loaded', () => {
        cy.login(testAuthenticatedUser);
        cy.visit(usersRoute);
        cy.findByText(LoginConstants.ROUTE_ACCESS_FORBIDEN_ERROR_MESSAGE).should(exist);
        cy.findByAltText(LoginConstants.LOCK_IMAGE_ALT).should(exist);
    });

    it('models page should not be loaded', () => {
        cy.login(testAuthenticatedUser);
        cy.visit(modelsRoute);
        cy.findByText(LoginConstants.ROUTE_ACCESS_FORBIDEN_ERROR_MESSAGE).should(notExist);
        cy.findByAltText(LoginConstants.LOCK_IMAGE_ALT).should(notExist);
    });
});

describe('access private page with admin role', () => {

    it('users page should be loaded', () => {
        cy.login(testAuthenticatedAdmin);
        cy.visit(usersRoute);
        cy.findByText(LoginConstants.ROUTE_ACCESS_FORBIDEN_ERROR_MESSAGE).should(notExist);
        cy.findByAltText(LoginConstants.LOCK_IMAGE_ALT).should(notExist);
    });

    it('models page should be loaded', () => {
        cy.login(testAuthenticatedAdmin);
        cy.findByText(LoginConstants.ROUTE_ACCESS_FORBIDEN_ERROR_MESSAGE).should(notExist);
        cy.findByAltText(LoginConstants.LOCK_IMAGE_ALT).should(notExist);
    });
});
