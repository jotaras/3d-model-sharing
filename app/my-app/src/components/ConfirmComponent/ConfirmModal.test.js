import React from 'react';
import { render, screen } from '@testing-library/react';
import * as Conctants from '../../constants/Constants';
import ConfirmModal from './ConfirmModal';
import userEvent from '@testing-library/user-event';


const mockDoConfirm = jest.fn();
const mockCancelConfirm = jest.fn();
const mockMessage = 'Are you sure';
let mockIsOpen = true;

jest.mock('./useConfirmHook', () => ({
    __esModule: true,
    default: () => ({
        isOpen: mockIsOpen,
        doConfirm: mockDoConfirm,
        cancel: mockCancelConfirm,
        message: mockMessage
    })
}));

afterEach(() => {
    jest.clearAllMocks();
});

test('component should be displayed', async () => {
    render(<ConfirmModal />);
    expect(await screen.findByText(Conctants.CONFIRM_BUTTON_TEXT)).toBeInTheDocument();
    expect(await screen.findByText(Conctants.CANCEL_BUTTON_TEXT)).toBeInTheDocument();
    expect(await screen.findByText(mockMessage)).toBeInTheDocument();
});

test('component should not be displayed', async () => {
    mockIsOpen = false;
    render(<ConfirmModal />);
    expect(screen.queryByText(Conctants.CONFIRM_BUTTON_TEXT)).not.toBeInTheDocument();
    expect(screen.queryByText(Conctants.CANCEL_BUTTON_TEXT)).not.toBeInTheDocument();
    expect(screen.queryByText(mockMessage)).not.toBeInTheDocument();
    mockIsOpen = true;
});

test('on confirm click method should be called', async () => {
    render(<ConfirmModal />);
    userEvent.click(await screen.findByText(Conctants.CONFIRM_BUTTON_TEXT));
    expect(mockDoConfirm).toBeCalled();
});

test('on cancel click method should be called', async () => {
    render(<ConfirmModal />);
    userEvent.click(await screen.findByText(Conctants.CANCEL_BUTTON_TEXT));
    expect(mockCancelConfirm).toBeCalled();
});

test('on close form cancel method should be called', async () => {
    render(<ConfirmModal />);
    userEvent.click(await screen.findByAltText(Conctants.CLOSE_IMG_ALT));
    expect(mockCancelConfirm).toBeCalled();
});
