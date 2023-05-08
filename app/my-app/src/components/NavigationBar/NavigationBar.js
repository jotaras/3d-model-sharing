import React, { useEffect, useState } from 'react';
import './NavigationBar.scss';
import { Link } from 'react-router-dom';
import useAuthentication from '../Authentication/useAuthenticationHook';
import usersService from '../../services/UsersService';
import * as Constants from '../../constants/Constants';
import * as SystemConstants from '../../constants/SystemConstants';
import menuIcon from '../../assets/icon-menu.svg';

export default function NavigationBar() {
    const [isLogged, setIsLogged] = useState(false);
    const {userId, logout} = useAuthentication();
    const [userEmail, setUserEmail] = useState('');
    const [showMenu, setShowMenu] = useState(false);

    useEffect(() => {
        if (userId) {
            usersService.getUserById(userId)
                .then((user) => {
                    setIsLogged(true);
                    setUserEmail(user.email);
                }).catch(() => {
                    setIsLogged(false);
                    setUserEmail('');
                });
        } else {
            setIsLogged(false);
        }
    }, [userId]);

    const logoutHandle = () => {
        setIsLogged(false);
        logout();
    };

    const naviagtionList = () => {
        return (
            <React.Fragment>
                <Link className = 'navigation-button' to = {SystemConstants.HOME_LINK_PATH}>{Constants.HOME_BUTTON_TEXT}</Link>
                <Link className = 'navigation-button' to = {SystemConstants.MODELS_LINK_PATH}>{Constants.MODELS_MANAGEMENT_BUTTON_TEXT}</Link>
                <Link className = 'navigation-button' to = {SystemConstants.USERS_LINK_PATH}>{Constants.USERS_MANAGEMENT_BUTTON_TEXT}</Link>
            </React.Fragment>
        );
    };

    return (
        <div className = 'navigation-bar-container'>
            <button className = 'navigation-menu-button' onClick = {() => setShowMenu((state) => !state)}>
                <img src = {menuIcon} alt = {Constants.NAVIGATION_MENU_IMG_ALT}/>
            </button>
            <div className = 'navigation-list'>
                {naviagtionList()}
            </div>
            <div className = 'navigation-auth'>
                {isLogged ?
                    <React.Fragment>
                        <label className = 'logged-user-label'>{userEmail}</label>
                        <Link className = 'navigation-button' to = {SystemConstants.LOGIN_LINK_PATH} onClick = {logoutHandle}>{Constants.LOGOUT_BUTTON_TEXT}</Link>
                    </React.Fragment>
                    : <Link className = 'navigation-button' to = {SystemConstants.LOGIN_LINK_PATH}>{Constants.LOGIN_BUTTON_TEXT}</Link>
                }
            </div>
            <div className = 'expanded-navigation-list'>
                {showMenu && naviagtionList()}
            </div>
        </div>
    );
}
