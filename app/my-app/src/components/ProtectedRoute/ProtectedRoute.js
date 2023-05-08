import jwtDecode from 'jwt-decode';
import React, { useEffect, useState } from 'react';
import { Route, } from 'react-router-dom';
import * as Constants from '../../constants/Constants';
import {ACCESS_TOKEN_KEY} from '../../constants/SystemConstants';
import lockImage from '../../assets/icon-lock.svg';
import './ProtectedRoute.css';


export default function ProtectedRoute({ children, allowedRoles, ...rest }) {
    const [redirect, setRedirect] = useState(false);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        try {
            const accessToken =  localStorage.getItem(ACCESS_TOKEN_KEY);
            const decodedToken = jwtDecode(accessToken);
            const havePass = decodedToken.roles.some((role) => allowedRoles.includes(role));
            if (!havePass) {
                setRedirect(true);
            }
        } catch (err) {
            setRedirect(true);
        } finally {
            setLoading(false);
        }
    }, []);


    return (
        <Route {...rest}
            render = {() => {
                if (loading) {
                    return null;
                }

                if (!redirect) {
                    return children;
                } else {
                    return (
                        <div className = 'forbidden-container'>
                            <img className = 'lock-image' src = {lockImage} alt = {Constants.LOCK_IMAGE_ALT}/>
                            <label className = 'forbidden-message'>{Constants.ROUTE_ACCESS_FORBIDEN_ERROR_MESSAGE}</label>
                        </div>
                    );
                }
            }}
        />
    );
}
