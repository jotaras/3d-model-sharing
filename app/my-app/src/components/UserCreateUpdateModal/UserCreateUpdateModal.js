import React, { useEffect, useRef, useState } from 'react';
import closeIcon from '../../assets/circle-x-icon.svg';
import userService from '../../services/UsersService';
import minusIcon from '../../assets/icon-circle-minus.svg';
import * as Constants from '../../constants/Constants';
import useAlert from '../AlertComponent/useAlertHook';
import './UserCreateUpdateModal.scss';
import filesService from '../../services/FilesService';
import { USER_FIELDS } from '../../constants/SystemConstants';

export default function UserCreateUpdateModal(props) {
    const [newUser, setNewUser] = useState({
        firstName:  '',
        lastName:  '',
        email:  '',
        imageBlobKey: null,
        roleIds: []
    });
    const [password, setPassword] = useState('');
    const [file, setFile] = useState(null);
    const [selectedRole, setSelectedRole] = useState('');
    const [validationErrors, setValidationErrors] = useState({});
    const {addAlert} = useAlert();
    const submitRef = useRef();

    useEffect(() => {
        if (props.user) {
            setNewUser({...props.user});
        }
    }, []);

    const handleSubmit = (event) => {
        event.preventDefault();
        newUser.password = password || null;
        if (!isInputValid(newUser, setValidationErrors)) {
            return;
        }

        submitRef.current.setAttribute('disabled', true);
        props.closeForm();

        //makes the first letter upper case
        newUser.firstName = newUser.firstName.charAt(0).toUpperCase() + newUser.firstName.slice(1);
        newUser.lastName = newUser.lastName.charAt(0).toUpperCase() + newUser.lastName.slice(1);
        if(!newUser.id) {
            userService.createNewUser(newUser, file)
                .then(createdUser => {
                    addAlert(Constants.USER_CREATED_MESSAGE);
                    props.setUsers((oldUsers) => [...oldUsers, createdUser]);
                })
                .catch(err => {
                    addAlert(err.message);
                });
        } else {
            userService.updateUser(newUser, file, props.user.imageBlobKey)
                .then(updatedUser => {
                    addAlert(Constants.USER_UPDATED_MESSAGE);
                    if (updatedUser.imageBlobKey) {
                        updatedUser.imageBlobKey = `${updatedUser.imageBlobKey}?updated=${Date.now()}`; //add parameter to force image fetching
                    }
                    props.setUsers((oldUsers) => oldUsers.map(user => {
                        return user.id === updatedUser.id ? updatedUser : user;
                    }));
                })
                .catch(err => {
                    addAlert(err.message);
                });
        }
    };

    const handleChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setNewUser(user => ({...user, [name]: value}));
    };

    const handleFileChange = (event) => {
        try {
            const file = event.target.files[0];
            if (file) {
                filesService.getSupportedImageExtension(file.name);
                setFile(file);
            }
        } catch(err) {
            addAlert(err.message);
        }
    };


    return(
        <div className = 'form-container'>
            <form className = 'form' onSubmit = {handleSubmit}>
                <button type = 'button' className = 'close-form-button' onClick = {props.closeForm}>
                    <img className = 'close-form-image' src = {closeIcon} alt = {Constants.CLOSE_USER_FORM_ALT}></img>
                </button>
                <input
                    className = 'user-data-input-fields'
                    type = 'text'
                    name =  {USER_FIELDS.FIRST_NAME}
                    value = {newUser.firstName}
                    onChange = {handleChange}
                    placeholder = {Constants.FIRST_NAME_INPUT_PLACEHOLDER}
                />
                <label className = 'validation-errors'>{validationErrors.firstName}</label>
                <input
                    className = 'user-data-input-fields'
                    type = 'text'
                    name =  {USER_FIELDS.LAST_NAME}
                    value = {newUser.lastName}
                    onChange = {handleChange}
                    placeholder = {Constants.LAST_NAME_INPUT_PLACEHOLDER}
                />
                <label className = 'validation-errors'>{validationErrors.lastName}</label>
                <input
                    className = 'user-data-input-fields'
                    type = 'email'
                    name =  {USER_FIELDS.EMAIL}
                    value = {newUser.email}
                    onChange = {handleChange}
                    placeholder = {Constants.EMAIL_INPUT_PLACEHOLDER}
                />
                <label className = 'validation-errors'>{validationErrors.email}</label>
                <input
                    className = 'user-data-input-fields'
                    type = 'password'
                    name =  {USER_FIELDS.PASSWORD}
                    value = {password}
                    onChange = {(event) => setPassword(event.target.value)}
                    placeholder = {Constants.PASSWORD_INPUT_PLACEHOLDER}
                />
                <label className = 'validation-errors'>{validationErrors.password}</label>
                <div className = 'grid-container'>
                    {
                        newUser.roleIds.map((roleId) => {
                            return (
                                <div className = 'role-div' key = {roleId}>
                                    <label>{userService.getRoleName(roleId, props.roles)}</label>
                                    <button className = 'remove-role-button' type = 'button' onClick = {() => {
                                        const rolesAfterRemove = newUser.roleIds.filter((id) => {
                                            return id !== roleId;
                                        });
                                        setNewUser(user => ({...user, 'roleIds': rolesAfterRemove}));
                                    }}>
                                        <img className = 'remove-role-img' src = {minusIcon} alt = ''></img>
                                    </button>
                                </div>
                            );
                        })
                    }
                </div>
                <div>
                    <select
                        value = {selectedRole}
                        name = {USER_FIELDS.ROLE_IDS}
                        onChange = {(event) => {setSelectedRole(parseInt(event.target.value));}}>
                        <option value="" disabled>{Constants.SELECT_ROLE_MESSAGE}</option>

                        {props.roles.map((role) => {
                            return(
                                <option key = {role.roleId} value = {role.roleId}> {role.name} </option>
                            );
                        })}
                    </select>
                    <button type = 'button' className = 'add-role-button' onClick = {() => {
                        if (selectedRole && !newUser.roleIds.includes(selectedRole)) {
                            const roles = [...newUser.roleIds, selectedRole];
                            setNewUser(user => ({...user, 'roleIds': roles}));
                        }
                    }}>{Constants.ADD_ROLE_BUTTON_TEXT}</button>
                </div>
                <label className = 'validation-errors'>{validationErrors.roleIds}</label>

                <input
                    id = 'load-picture-button'
                    type = 'file'
                    name = {USER_FIELDS.IMAGE_BLOB_KEY}
                    onChange = {handleFileChange}
                />
                <div className = 'choose-file-container'>
                    <button type = 'button' className = 'choose-file-button'>
                        <label className = 'chose-file-button-label' htmlFor = 'load-picture-button'>
                            {Constants.FORM_INPUT_PICTURE_TEXT}
                        </label>
                    </button>
                    <label className = 'choosed-file'>{file ? file.name : null}</label>
                </div>
                <input ref = {submitRef} type = 'submit' value = {Constants.SUBMIT_BUTTON_TEXT}/>
            </form>
        </div>
    );
}

const isInputValid = (newUser, setValidationErrors) => {
    let isValid = true;
    const onlyLettersPattern = /^[a-zA-Z]+$/;
    const emailPattern = /[a-zA-Z0-9]+[\\.]?([a-zA-Z0-9]+)?[\\@][a-z]{3,9}[\\.][a-z]{2,5}/;
    const validationErrorsObject = {};


    if (!newUser.firstName) {
        validationErrorsObject.firstName = Constants.FIRST_NAME_EMPTY_ERROR_MESSAGE;
        isValid = false;

    } else if (!onlyLettersPattern.test(newUser.firstName)) {
        validationErrorsObject.firstName = Constants.FIRST_NAME_NOT_VALID_ERROR_MESSAGE;
        isValid = false;
    }

    if (!newUser.lastName) {
        validationErrorsObject.lastName = Constants.LAST_NAME_EMPTY_ERROR_MESSAGE;
        isValid = false;

    } else if (!onlyLettersPattern.test(newUser.lastName)) {
        validationErrorsObject.lastName = Constants.LAST_NAME_NOT_VALID_ERROR_MESSAGE;
        isValid = false;
    }

    if (!newUser.email) {
        validationErrorsObject.email = Constants.EMAIL_EMPTY_ERROR_MESSAGE;
        isValid = false;

    } else if (!emailPattern.test(newUser.email)) {
        validationErrorsObject.email = Constants.EMAIL_NOT_VALID_ERROR_MESSAGE;
        isValid = false;
    }

    if (!newUser.id && !newUser.password) {
        validationErrorsObject.password = Constants.PASSWORD_EMPTY_ERROR_MESSAGE;
        isValid = false;

    } else if (newUser.password && !newUser.password.trim()) {
        validationErrorsObject.password = Constants.PASSWORD_ONLY_WITH_SPACES_ERROR_MESSAGE;
        isValid = false;

    } else if (newUser.password && (newUser.password.length < 4 || newUser.password.length > 25)) {
        isValid = false;
        validationErrorsObject.password = Constants.PASSWORD_LENGTH_ERROR_MESSAGE;
    }

    if (newUser.roleIds.length === 0) {
        validationErrorsObject.roleIds = Constants.ROLES_EMPTY_ERROR_MESSAGE;
        isValid = false;
    }
    setValidationErrors(validationErrorsObject);
    return isValid;
};
