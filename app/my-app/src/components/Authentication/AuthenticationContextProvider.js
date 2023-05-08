import React, { createContext, useState } from 'react';
import * as Constants from '../../constants/SystemConstants';

export const AuthenticationContext = createContext();

export default function AuthenticationContextProvider({children}) {
    const [accessToken, setAccessToken] = useState(localStorage.getItem(Constants.ACCESS_TOKEN_KEY));
    const [refrshToken, setRefreshToken] = useState(localStorage.getItem(Constants.REFRESH_TOKEN_KEY));
    const [userId, setUserId] = useState(localStorage.getItem(Constants.USER_ID_KEY));

    const logout = () => {
        localStorage.removeItem(Constants.ACCESS_TOKEN_KEY);
        localStorage.removeItem(Constants.REFRESH_TOKEN_KEY);
        localStorage.removeItem(Constants.USER_ID_KEY);
        setAccessToken(null);
        setRefreshToken(null);
        setUserId(null);
    };

    return (
        <AuthenticationContext.Provider value={[accessToken, setAccessToken, refrshToken, setRefreshToken, userId, setUserId, logout]}>
            {children}
        </AuthenticationContext.Provider>
    );

}
