import React, {  useRef, useState } from 'react';
import './LoginPage.scss';
import * as Constants from '../../constants/Constants';
import authenticationService from '../../services/AuthenticationService';
import useAlert from '../AlertComponent/useAlertHook';
import useAuthentication from './useAuthenticationHook';
import closeIcon from '../../assets/circle-x-icon.svg';
import { useHistory } from 'react-router-dom';

export default function LoginPage() {
    const {saveAccessToken, saveRefreshToken, saveUserId} = useAuthentication();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const {addAlert} = useAlert();
    const [validationErrors, setValidationErrors] = useState({
        email: '',
        password: ''
    });
    const history = useHistory();
    const submitRef = useRef();

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!isInputValid()) {
            return;
        }

        submitRef.current.setAttribute('disabled', true);
        try {
            const tokens = await authenticationService.authenticate(email, password);
            saveAccessToken(tokens.accessToken);
            saveRefreshToken(tokens.refreshToken);
            saveUserId(tokens.userId);
            history.push('/');
        } catch(err) {
            addAlert(err.message);
            setPassword('');
            submitRef.current.removeAttribute('disabled');
        }
    };

    const isInputValid = () => {
        let isValid = true;
        const emailPattern = /[a-zA-Z0-9]+[\\.]?([a-zA-Z0-9]+)?[\\@][a-z]{3,9}[\\.][a-z]{2,5}/;
        const validationErrorsObject = {};

        if (!email) {
            isValid = false;
            validationErrorsObject.email = Constants.EMAIL_EMPTY_ERROR_MESSAGE;
        } else if (!emailPattern.test(email)) {
            validationErrorsObject.email = Constants.EMAIL_NOT_VALID_ERROR_MESSAGE;
            isValid = false;
        }

        if (!password) {
            isValid = false;
            validationErrorsObject.password = Constants.PASSWORD_EMPTY_ERROR_MESSAGE;
        }

        setValidationErrors(validationErrorsObject);
        return isValid;
    };

    const closeFormHandle = () => {
        history.push('/');
    };

    return (
        <div className = 'login-container'>
            <form className = 'login-form' onSubmit = {handleSubmit}>
                <button type = 'button' className = 'close-form-button' onClick = {closeFormHandle}>
                    <img className = 'close-form-image' src = {closeIcon} alt = {Constants.CLOSE_IMG_ALT}></img>
                </button>
                <label className = 'login-form-label'>{Constants.LOGIN_TITLE}</label>
                <input
                    className = 'login-input-fields'
                    type = 'text'
                    value = {email}
                    onChange = {(event) => setEmail(event.target.value)}
                    placeholder = {Constants.EMAIL_INPUT_PLACEHOLDER}
                />
                <label className = 'validation-errors'>{validationErrors.email}</label>
                <input
                    className = 'login-input-fields'
                    type = 'password'
                    value = {password}
                    onChange = {(event) => setPassword(event.target.value)}
                    placeholder = {Constants.PASSWORD_INPUT_PLACEHOLDER}
                />
                <label className = 'validation-errors'>{validationErrors.password}</label>
                <input
                    className = 'login-button'
                    value = {Constants.LOGIN_SUBMIT_BUTTON_TEXT}
                    type ='submit'
                    ref = {submitRef}
                />
            </form>
        </div>
    );
}
