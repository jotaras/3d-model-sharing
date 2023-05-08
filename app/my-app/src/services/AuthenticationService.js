import { AUTHENTICATION_FAILED_ERROR_MESSAGE, AUTHORIZATION_ERROR_MESSAGE } from '../constants/Constants';
import * as SystemConstants from '../constants/SystemConstants';
import jwtDecode from 'jwt-decode';
import handleError from './ErrorHandler';

class AuthenticationService {
    accessTokenRoute = 'api/auth/get-token';
    refreshTokenRoute = 'api/auth/refresh-token';
    signUrlRoute = 'api/auth/sign-file-storage-url';

    constructor() {
        this.authenticate = this.authenticate.bind(this);
        this.refreshAccessToken = this.refreshAccessToken.bind(this);
        this.signUrl = this.signUrl.bind(this);
        this.getAccessToken = this.getAccessToken.bind(this);
    }

    async authenticate(email, password) {
        const body = `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;
        const response = await fetch(this.accessTokenRoute, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            },
            body: body
        });

        if (response.ok) {
            return response.json();
        }

        throw new Error(AUTHENTICATION_FAILED_ERROR_MESSAGE);
    }

    async refreshAccessToken() {
        return fetch(this.refreshTokenRoute, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem(SystemConstants.REFRESH_TOKEN_KEY)}`
            }
        }).then(handleError)
            .then(response => {
                return response.json();
            }).then(json => {
                const accessToken = json.accessToken;
                localStorage.setItem(SystemConstants.ACCESS_TOKEN_KEY, accessToken);
                return accessToken;
            });
    }

    //@param path - resource to modify, empty when need to create
    async signUrl(method, path = '') {
        const fileStorageFullPath = 'https://localhost:3010/filestorage';
        const fileStoragePath = 'filestorage';
        const urlToSign = path ? `${fileStorageFullPath}/${path}` : fileStorageFullPath;

        return fetch(this.signUrlRoute, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${await this.getAccessToken()}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                url: urlToSign,
                method: method
            })
        }).then(handleError)
            .then(response => {
                return response.json();
            }).then(data => {
                const signedUrl = data.signedUrl;
                const sign = signedUrl.slice(signedUrl.lastIndexOf('signed=') + 'signed='.length);

                return path ? `${fileStoragePath}/${path}?signed=${sign}` : `${fileStoragePath}?signed=${sign}`;
            });

    }

    async getAccessToken() {
        try {
            const accessToken = localStorage.getItem(SystemConstants.ACCESS_TOKEN_KEY);
            const decodedAccessToken = jwtDecode(accessToken);
            const time = Math.trunc(new Date().getTime() / 1000); //get time in seconds
            if (decodedAccessToken.exp < time - 10) {
                return await this.refreshAccessToken();
            }
            return accessToken;
        } catch(err) {
            console.log(err);
            throw new Error(AUTHORIZATION_ERROR_MESSAGE);
        }

    }
}

const authenticationService = new AuthenticationService();
export default authenticationService;
