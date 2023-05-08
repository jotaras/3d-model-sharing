import { useContext } from 'react';
import { AuthenticationContext} from './AuthenticationContextProvider';
import * as Constants from '../../constants/SystemConstants';

const useAuthenticationHook = () => {
    const [accessToken, setAccessToken, refrshToken, setRefreshToken, userId, setUserId, logout] = useContext(AuthenticationContext);

    const saveAccessToken = (token) => {
        localStorage.setItem(Constants.ACCESS_TOKEN_KEY, token);
        setAccessToken(token);
    };

    const saveRefreshToken = (token) => {
        localStorage.setItem(Constants.REFRESH_TOKEN_KEY, token);
        setRefreshToken(token);
    };

    const saveUserId = (loggedUserId) => {
        localStorage.setItem(Constants.USER_ID_KEY, loggedUserId);
        setUserId(loggedUserId);
    };

    return {
        accessToken,
        saveAccessToken,
        refrshToken,
        saveRefreshToken,
        userId,
        saveUserId,
        logout
    };
};

export default useAuthenticationHook;
