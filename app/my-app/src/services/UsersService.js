import authenticationService from './AuthenticationService';
import { USER_DELETED_MESSAGE } from '../constants/Constants';
import handleError from './ErrorHandler';
import filesService from './FilesService';

class UsersService {
    usersApiPath = 'api/users/';
    rolesApiPath = 'api/users/roles';
    contentTypeJson = 'application/json';

    constructor() {
        this.getAllUsers = this.getAllUsers.bind(this);
        this.createNewUser = this.createNewUser.bind(this);
        this.deleteUser = this.deleteUser.bind(this);
        this.getAllRoles = this.getAllRoles.bind(this);
        this.updateUser = this.updateUser.bind(this);
        this.getUserById = this.getUserById.bind(this);
    }

    async getAllUsers() {
        return fetch(this.usersApiPath, {
            method: 'GET'
        })
            .then(handleError)
            .then((response) => {
                return response.json();
            });
    }

    async getUserById(userId) {
        return fetch(`/${this.usersApiPath}${userId}`, {
            method: 'GET'
        }).then(handleError)
            .then(response => {
                return response.json();
            });
    }

    async getAllRoles() {
        return fetch(this.rolesApiPath, {
            method: 'GET'
        }).then(handleError)
            .then(response => {
                return response.json();
            });
    }

    async deleteUser(user) {
        return fetch(this.usersApiPath + user.id, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${await authenticationService.getAccessToken()}`
            }
        }).then(handleError)
            .then(() => {
                if (user.imageBlobKey) {
                    filesService.deleteFile(user.imageBlobKey.split('?')[0]); //split to remove updated parameter from url
                }
            });
    }

    async createNewUser(user, file) {
        if (file) {
            user.imageBlobKey = await filesService.createNewFile(file);
        }

        return fetch(this.usersApiPath, {
            method: 'POST',
            headers: {
                'Content-Type': this.contentTypeJson,
                'Authorization': `Bearer ${await authenticationService.getAccessToken()}`
            },
            body: JSON.stringify(user)
        }).then(handleError)
            .then(response => {
                return response.json();
            }).catch((err) => {
                if (file) {
                    filesService.deleteFile(user.imageBlobKey);
                }
                throw err;
            });
    }

    async updateUser(user, file, oldUserImage) {
        if (user.imageBlobKey) {
            user.imageBlobKey = user.imageBlobKey.split('?')[0]; //split to remove updated parameter from url
        }

        if (file && oldUserImage) {
            oldUserImage =  oldUserImage.split('?')[0]; //split to remove updated parameter from url
            user.imageBlobKey = await filesService.updateFile(file, oldUserImage);
        } else if (file && !oldUserImage) {
            user.imageBlobKey = await filesService.createNewFile(file);
        }
        return fetch(this.usersApiPath + user.id, {
            method: 'PUT',
            headers: {
                'Content-Type': this.contentTypeJson,
                'Authorization': `Bearer ${await authenticationService.getAccessToken()}`
            },
            body: JSON.stringify({
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                imageBlobKey: user.imageBlobKey,
                password: user.password,
                roleIds: user.roleIds
            })
        }).then(handleError)
            .then(response => {
                return response.json();
            }).catch(err => {
                if (file && !oldUserImage) {
                    filesService.deleteFile(user.imageBlobKey);
                }
                throw err;
            });

    }

    getUserNameById = (userId, users) => {
        const user = users.find(({id}) => id === userId);
        if (user) {
            return `${user.firstName} ${user.lastName}`;
        }
        return USER_DELETED_MESSAGE;
    };

    getRoleName(roleId, roles) {
        let roleName = null;
        for (const role of roles) {
            if (role.roleId === roleId) {
                roleName = role.name;
            }
        }
        return roleName;
    }
}

const usersService = new UsersService();
export default usersService;
