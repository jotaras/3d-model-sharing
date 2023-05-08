import React from 'react';
import iconX from '../../assets/icon-x.svg';
import useAlert from './useAlertHook';
import {CLOSE_IMG_ALT} from '../../constants/Constants';
import './AlertDialog.scss';

export default function AlertDialog() {
    const { alerts, removeAlert} = useAlert();

    return (
        <div className = 'messages-container'>
            {alerts.map((alert, index) => {
                return (
                    <div className = 'message-container' key = {index}>
                        <button className = 'close-message-button' onClick = {() => removeAlert(alert)}>
                            <img className = 'close-message-image' src = {iconX} alt = {CLOSE_IMG_ALT}></img>
                        </button>
                        <p className = 'p-message' key = {index}> {alert.message}</p>

                    </div>
                );
            })}
        </div>
    );
}
