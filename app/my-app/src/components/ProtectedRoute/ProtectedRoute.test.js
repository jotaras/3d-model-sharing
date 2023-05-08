import { render, screen } from '@testing-library/react';
import {  testTokens } from '../../constants/TestTemplates';
import { jest } from '@jest/globals';
import React from 'react';
import * as Constans from '../../constants/Constants';
import ProtectedRoute from './ProtectedRoute';
import { BrowserRouter as Router } from 'react-router-dom';


const mockJwtDecode = testTokens.decodedToken;
jest.mock('jwt-decode', () => ({
    __esModule: true,
    default: () => mockJwtDecode
}));

const protectedPageLabel = 'protected';

function MockChildComponent() {
    return (
        <label>{protectedPageLabel}</label>
    );
}

test('when user has not access role, forbidden message should be displayed', async () => {
    render(
        <Router>
            <ProtectedRoute allowedRoles = {['Role']}>
                <MockChildComponent />
            </ProtectedRoute>
        </Router>
    );
    expect(await screen.findByText(Constans.ROUTE_ACCESS_FORBIDEN_ERROR_MESSAGE)).toBeInTheDocument();
    expect(await screen.findByAltText(Constans.LOCK_IMAGE_ALT)).toBeInTheDocument();
});

test('when access is permitted, component should be rendered', async () => {
    render(
        <Router>
            <ProtectedRoute allowedRoles = {['Admin']}>
                <MockChildComponent />
            </ProtectedRoute>
        </Router>
    );
    expect(await screen.findByText(protectedPageLabel)).toBeInTheDocument();
    expect(screen.queryByText(Constans.ROUTE_ACCESS_FORBIDEN_ERROR_MESSAGE)).not.toBeInTheDocument();

});
