export const HOME_LINK_PATH = '/home';
export const MODELS_LINK_PATH = '/models';
export const USERS_LINK_PATH = '/users';
export const LOGIN_LINK_PATH = '/login';
export const MODEL_VIEWER_PATH = '/model-viewer';
export const ACCESS_TOKEN_KEY = 'accessToken';
export const REFRESH_TOKEN_KEY = 'refreshToken';
export const USER_ID_KEY = 'userId';
export const ROLES_THAT_HAVE_ACCESS_TO_PRIVATE_ROUTES = ['Admin'];
export const ALERT_DISPOSAL_TIME_OUT = 3000;

export const SUPPORTED_MODEL_EXTENSIONS = Object.freeze({
    OBJ: '.obj',
    STL: '.stl',
    GLTF: '.gltf',
    GLB: '.glb',
});

export const SUPPORTED_IMAGE_EXTENSIONS = Object.freeze({
    JPG: '.jpg',
    JPEG: '.jpeg',
    JFIF: '.jfif',
    PJPEG: '.pjpeg',
    PJP: '.pjp',
    GIF: '.gif',
    PNG: '.png'
});

export const MODEL_FIELDS = Object.freeze({
    NAME: 'name',
    DESCRIPTION: 'description',
    TAG_IDS: 'tagIds',
    UPDATED_AT: 'updatedAt',
    UPDATED_BY: 'updatedBt',
    CREATED_AT: 'updatedAt',
    CREATED_BY: 'updatedBt',
    PREVIEW_BLOB_KEY: 'previewBlobKey',
    FILE_KEY: 'fileKey'
});

export const USER_FIELDS = Object.freeze({
    PASSWORD: 'password',
    FIRST_NAME: 'firstName',
    LAST_NAME: 'lastName',
    EMAIL: 'email',
    IMAGE_BLOB_KEY: 'imageBlobKey',
    ROLE_IDS: 'roleIds',
});
