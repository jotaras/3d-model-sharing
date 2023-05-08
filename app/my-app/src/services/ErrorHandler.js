import * as Constants from '../constants/Constants';

export default async function handleError(response) {
    if (response.ok) {
        return response;
    }

    const errorMessage = await response.text();
    switch(response.status) {
    case 401: {
        throw new Error(Constants.AUTHORIZATION_ERROR_MESSAGE);
    }
    default: {
        throw new Error(errorMessage);
    }
    }
}
