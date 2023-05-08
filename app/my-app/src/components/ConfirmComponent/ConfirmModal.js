import React from 'react';
import './ConfirmModal.scss';
import iconX from '../../assets/icon-x.svg';
import useConfirm from './useConfirmHook.js';
import { CONFIRM_BUTTON_TEXT, CANCEL_BUTTON_TEXT, CLOSE_IMG_ALT } from '../../constants/Constants';


export default function ConfirmModal() {
    const { message ,isOpen, doConfirm, cancel} = useConfirm();


    return (
        isOpen && <div className = 'confirm-container'>
            <div className = 'confirm-window'>
                <button className = 'close-confirm-modal-button' onClick = {() => cancel()}>
                    <img className = 'close-confirm-modal-image' src = {iconX} alt = {CLOSE_IMG_ALT}></img>
                </button>
                <label className = 'confirm-message'>{message}</label>
                <div className = 'action-buttons-container'>
                    <button className = 'ok-button' onClick = {() => {
                        doConfirm();
                    }}>{CONFIRM_BUTTON_TEXT}</button>

                    <button className = 'cancel-button' onClick = {() => {
                        cancel();
                    }}>{CANCEL_BUTTON_TEXT}</button>
                </div>
            </div>
        </div>
    );
}
