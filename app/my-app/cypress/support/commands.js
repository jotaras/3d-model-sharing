// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
import '@testing-library/cypress/add-commands';
import * as SystemConstants from '../../src/constants/SystemConstants';

Cypress.Commands.add('login', (user) => {
    const body = `email=${encodeURIComponent(user.testEmail)}&password=${encodeURIComponent(user.testPass)}`;
    cy.request({
        method: 'POST',
        url: 'https://localhost:3000/api/auth/get-token',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        },
        body: body
    }).then((resp) => {
        window.localStorage.setItem(SystemConstants.ACCESS_TOKEN_KEY, resp.body.accessToken);
        window.localStorage.setItem(SystemConstants.REFRESH_TOKEN_KEY, resp.body.refreshToken);
        window.localStorage.setItem(SystemConstants.USER_ID_KEY, resp.body.userId);
    });
});

Cypress.Commands.add('loadFile', (inputComponent, file, fileType, fileName = file) => {
    cy.fixture(file, 'binary').then((model) => {
        cy.get(inputComponent).then((input) => {
            const blob = Cypress.Blob.binaryStringToBlob(model, fileType);

            const file = new File([blob], fileName, { type: fileType });
            const list = new DataTransfer();

            list.items.add(file);
            const myFileList = list.files;

            input[0].files = myFileList;
            input[0].dispatchEvent(new Event('change', { bubbles: true }));
        });
    });
});

