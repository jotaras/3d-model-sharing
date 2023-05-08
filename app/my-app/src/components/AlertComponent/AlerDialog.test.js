import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AlertDialog from './AlertDialog';
import { CLOSE_IMG_ALT } from '../../constants/Constants';

const mockRemoveAlert = jest.fn();
const mockMessages = [
    {message: 'message1'},
    {message: 'message2'}
];

jest.mock('./useAlertHook', () => ({
    __esModule: true,
    default: () => ({
        removeAlert: mockRemoveAlert,
        alerts: mockMessages
    })
}));

afterEach(() => {
    jest.clearAllMocks();
});

test('alerts should be displayed', async () => {
    render(<AlertDialog />);
    expect(await screen.findByText(mockMessages[0].message)).toBeInTheDocument();
    expect(await screen.findByText(mockMessages[1].message)).toBeInTheDocument();
});

test('on close alert, remove method should be called', async () => {
    render(<AlertDialog />);
    const alerts = await screen.findAllByAltText(CLOSE_IMG_ALT);
    userEvent.click(alerts[0]);
    expect(mockRemoveAlert).toBeCalledWith(mockMessages[0]);
});
