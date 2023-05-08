import React from 'react';
import './LoadingComponent.scss';

export default function LoadingComponent(props) {

    return (
        <div className = 'loading-container'>
            <div className = 'loading-bar'></div>
            <label className = 'loading-message'>{props.loadingMessage}</label>
        </div>
    );
}
