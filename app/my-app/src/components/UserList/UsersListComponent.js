import React, { useEffect, useMemo, useRef, useState } from 'react';
import editIcon from '../../assets/edit-icon.svg';
import trashIcon from '../../assets/trash-icon.svg';
import Form from '../UserCreateUpdateModal/UserCreateUpdateModal.js';
import userService from '../../services/UsersService';
import defaultPicture from '../../assets/default-profile.svg';
import * as Constants from '../../constants/Constants';
import useAlert from '../AlertComponent/useAlertHook';
import useConfirm from '../ConfirmComponent/useConfirmHook';
import LoadingComponent from '../LoadingComponent/LoadingComponent';
import './UsersListComponent.scss';
import useSort from '../useSortHook';
import useSearch from '../useSearchHook';
import { USER_FIELDS } from '../../constants/SystemConstants';


export default function UsersListComponent() {
    const [roles, setRoles] = useState([]);
    const [users, setUsers] = useState([]);
    const [loadError, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const {addAlert} = useAlert();
    const {confirmDialog} = useConfirm();
    const {sort, handleSortOptionChange, sortOption, displaySortChevrons} = useSort();
    const {searchOption, setSearchOption, find} = useSearch();
    const userToChange = useRef(null);

    async function getData() {
        try {
            setUsers(await userService.getAllUsers());
            setRoles(await userService.getAllRoles());
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getData();
    }, []);

    const usersToMap = useMemo(() => {
        const newUsers = find(users, USER_FIELDS.FIRST_NAME, USER_FIELDS.LAST_NAME, USER_FIELDS.EMAIL);
        sort(newUsers);
        return newUsers;
    }, [users, sortOption, searchOption]);

    const handelDelete = async (user) => {
        const confirmed = await confirmDialog(Constants.DELETE_USER_CONFIRM_TEXT);
        if (confirmed) {
            userService.deleteUser(user)
                .then(() => {
                    setUsers((oldUsers) => {
                        return oldUsers.filter((u) => {
                            return u.id !== user.id;
                        });
                    });
                    addAlert(Constants.USER_DELETED_MESSAGE);

                })
                .catch(err => {
                    addAlert(err.message);
                });
        }
    };

    if (loadError) {
        return(<p>{loadError.message}</p>);
    }

    if (loading) {
        return <LoadingComponent loadingMessage = {Constants.USERS_LOADING_TEXT}/>;
    }

    return(
        <div>
            {showForm && <Form closeForm = {() => setShowForm(false)} user = {userToChange.current} setUsers = {setUsers}
                users = {users} roles = {roles}/>
            }
            <div className = 'users-list-tools'>
                <button className = 'create-new-user-button'
                    onClick = {() => {
                        userToChange.current = null;
                        setShowForm(true);}
                    }>{Constants.NEW_USER_BUTTON_TEXT}</button>
                <input className = 'search-user-input' type = 'text' placeholder = {Constants.SEARCH_USER_PLACEHOLDER} onChange =
                    {event => setSearchOption(event.target.value.toLowerCase())}/>
            </div>
            <div className = 'table-container'>
                <table className = 'users-table'>
                    <thead>
                        <tr>
                            <th>
                                <button className = 'sort-button'>
                                    {Constants.PICTURE_SORT_BUTTON_TEXT}
                                </button>
                            </th>
                            <th>
                                <button className = 'sort-button' onClick = {() => handleSortOptionChange(USER_FIELDS.FIRST_NAME)}>
                                    {displaySortChevrons(USER_FIELDS.FIRST_NAME)}
                                    {Constants.FIRST_NAME_SORT_BUTTON_TEXT}
                                </button>
                            </th>
                            <th>
                                <button className = 'sort-button' onClick = {() => handleSortOptionChange(USER_FIELDS.LAST_NAME)}>
                                    {displaySortChevrons(USER_FIELDS.LAST_NAME)}
                                    {Constants.LAST_NAME_SORT_BUTTON_TEXT}
                                </button>
                            </th>
                            <th>
                                <button className = 'sort-button' onClick = {() => handleSortOptionChange(USER_FIELDS.EMAIL)}>
                                    {displaySortChevrons(USER_FIELDS.EMAIL)}
                                    {Constants.EMAIL_SORT_BUTTON_TEXT}
                                </button>
                            </th>
                            <th>
                                <button className = 'sort-button'>
                                    {Constants.ROLES_SORT_BUTTON_TEXT}
                                </button>
                            </th>
                            <th>
                                <button className = 'sort-button'>
                                    {Constants.ACTIONS_SORT_BUTTON_TEXT}
                                </button>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {usersToMap.map((user) => {
                            const imageSrc = (user.imageBlobKey) ? ('filestorage/' + user.imageBlobKey) : (defaultPicture);

                            const rolesList = user.roleIds.map((roleId) => {
                                return <li key = {roleId}>{userService.getRoleName(roleId, roles)}</li>;
                            });

                            return(
                                <tr key = {user.id}>
                                    <td> <img className = 'profile-picture' src = {imageSrc} alt = {Constants.USER_PROFILE_IMAGE_ALT}></img>  </td>
                                    <td> {user.firstName} </td>
                                    <td> {user.lastName} </td>
                                    <td> {user.email} </td>
                                    <td> <ul className = 'user-roles'>{rolesList}</ul></td>
                                    <td>
                                        <button className = 'action-buttons' onClick = {() => {
                                            setShowForm(true);
                                            userToChange.current = user;
                                        }}>
                                            <img src = {editIcon} alt = {Constants.UPDATE_USER_IMAGE_ALT}></img>
                                        </button>

                                        <button className = 'action-buttons' onClick = {() => handelDelete(user)}>
                                            <img src = {trashIcon} alt = {Constants.DELETE_USER_IMAGE_ALT}></img>
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
