export const testRoles = [
    {
        roleId: 1,
        name: 'User'
    },
    {
        roleId: 2,
        name: 'Admin'
    }
];
export const testUserPassword = 'password';
export const testUsers = [
    {
        id: 1,
        firstName: 'FirstUserName',
        lastName: 'FirstUserLName',
        roleIds: [2],
        email: 'admin@gmail.com',
        imageBlobKey: 'image key 1'
    },
    {
        id: 2,
        firstName: 'SecondUserName',
        lastName: 'SecondUserLName',
        roleIds: [1],
        email: 'email1@gmail.com',
        imageBlobKey: null
    }
];

export const testUpdatedUser = {
    id: 1,
    firstName: 'firstUser',
    lastName: 'firstUser',
    roleIds: [1],
    imageBlobKey: '',
    email: 'admin@gmail.com'
};

export const testNotValidUser = {
    firstName: 'firstName1',
    lastName: 'lastName2',
    email: 'email.gmail.com',
};

export const testTags = [
    {
        'tagId': 1,
        'name': 'tag2'
    },
    {
        'tagId': 2,
        'name': 'tag1'
    },
];

export const testNewTag = {
    'tagId': 3,
    'name': 'tag3'
};

export const testModels = [
    {
        'previewBlobKey': 'bd0cd05c-19b7-4ffe-9a2f-03014af3e52c',
        'description': 'first-test-description',
        'name': 'first-test-name',
        'modelId': 1,
        'createdBy': 1,
        'updatedAt': 1637324704867,
        'tagIds': [1, 2],
        'fileKey': '75574fc9-2b49-4799-9eed-707760939b2d',
        'createdAt': 1637324704867,
        'updatedBy': 1
    },
    {
        'previewBlobKey': 'd2dea215-34dc-49e5-985b-eda01cf74e4b',
        'description': 'test-description',
        'name': 'second-test-name',
        'modelId': 2,
        'createdBy': 1,
        'updatedAt': 1637252765192,
        'tagIds': [1],
        'fileKey': 'c941b01d-1b52-4d9e-943c-73e478fa9d76',
        'createdAt': 1637252724959,
        'updatedBy': 1
    }
];

export const testModelHistory = [
    {
        modelHistoryId: 1,
        createdAt: 1637252765582,
        createdBy: 1,
        fileKey: 'c941b01d-1b52-4d9e-943c-73e478fa9d76'
    },
    {
        modelHistoryId: 2,
        createdAt: 1637252765962,
        createdBy: 2,
        fileKey: '75574fc9-2b49-4799-9eed-707760939b2d'
    }
];

export const testModelToCreate = {
    'description': 'descr1',
    'name': 'first',
    'tagIds': [1, 2],
    'file': new File(['content'], 'model.obj', { type: 'model'}),
    'preview': new File(['content'], 'preview.png', { type: 'image/png'}),
};

export const testModelWithFile = {
    modelId: 1,
    name: 'first',
    description: 'descr1',
    tagIds: [1, 2],
    fileKey: 'file key',
    previewBlobKey: 'preview key',
    updatedAt: 1637252765962,
    modelFile: {
        extension: '.obj',
        file: 'file'
    }
};

export const testTokens = {
    accessToken: 'jwt access token',
    refreshToken: 'jwt resfresh token',
    userId: '1',
    decodedToken: {
        exp: 1639760897,
        roles: ['Admin', 'User']
    }
};

export const testAuthenticatedAdmin = {
    firstName: 'Admin',
    lastName: 'Admin',
    testEmail: 'admin@email.com',
    testPass: 'admin'
};

export const testAuthenticatedUser = {
    firstName: 'User',
    lastName: 'User',
    testEmail: 'user@email.com',
    testPass: 'user'
};

