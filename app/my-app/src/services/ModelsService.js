import authenticationService from './AuthenticationService';
import handleError from './ErrorHandler';
import filesService from './FilesService';

class ModelsService {
    modelsApiPath = 'api/models/';
    tagsApiPath = 'api/models/tags';
    contentTypeJson = 'application/json';

    constructor() {
        this.getAllModels = this.getAllModels.bind(this);
        this.getAllTags = this.getAllTags.bind(this);
        this.deleteModel = this.deleteModel.bind(this);
        this.createNewTags = this.createNewTags.bind(this);
        this.createNewModel = this.createNewModel.bind(this);
        this.updateModel = this.updateModel.bind(this);
        this.getModelHistory = this.getModelHistory.bind(this);
        this.getModel = this.getModel.bind(this);
    }


    async getAllModels() {
        return fetch(this.modelsApiPath, {
            method: 'GET'
        }).then(handleError)
            .then(response => {
                return response.json();
            });
    }

    async getModel(modelId) {
        return fetch(`/${this.modelsApiPath}${modelId}`, {
            method: 'GET'
        }).then(handleError)
            .then(response => {
                return response.json();
            });
    }

    async getModelHistory(modelId) {
        return fetch(`${this.modelsApiPath}${modelId}/history`, {
            method: 'GET'
        }).then(handleError)
            .then(response => {
                return response.json();
            });
    }

    async getAllTags() {
        return fetch(this.tagsApiPath, {
            method: 'GET'
        }).then(handleError)
            .then(response => {
                return response.json();
            });
    }

    async deleteModel(model) {
        const modelHistory = await this.getModelHistory(model.modelId);
        return fetch(this.modelsApiPath + model.modelId, {
            headers: {
                'Authorization': `Bearer ${await authenticationService.getAccessToken()}`
            },
            method: 'DELETE'
        }).then(handleError)
            .then(() => {
                filesService.deleteFile(model.fileKey);
                if (model.previewBlobKey) {
                    filesService.deleteFile(model.previewBlobKey.split('?')[0]); //split to remove updated parameter from url
                }
                const modelKeys = new Set();
                for (const history of modelHistory) {
                    modelKeys.add(history.fileKey);
                }
                modelKeys.forEach((fileKey) => {
                    filesService.deleteFile(fileKey);
                });
            });
    }

    async createNewTags(tags) {
        const requestToCreateTag = async (tagName) =>
            fetch(this.tagsApiPath, {
                method: 'POST',
                headers: {
                    'Content-Type': this.contentTypeJson,
                    'Authorization': `Bearer ${await authenticationService.getAccessToken()}`
                },
                body: JSON.stringify({name: tagName.toString()})
            });

        const requests = tags.map(tagName => requestToCreateTag(tagName));

        return Promise.all(requests).then(async responses => {
            const handledResponses = [];
            for (const response of responses) {
                handledResponses.push(await handleError(response));
            }
            return Promise.all(handledResponses.map(res => res.json()));
        });
    }

    async createNewModel(model, modelFile, modelPreview) {
        if (modelFile) {
            model.fileKey = await filesService.createNewFile(modelFile);
        }

        if (modelPreview) {
            model.previewBlobKey = await filesService.createNewFile(modelPreview);
        }

        return fetch(this.modelsApiPath, {
            method: 'POST',
            headers: {
                'Content-Type': this.contentTypeJson,
                'Authorization': `Bearer ${await authenticationService.getAccessToken()}`
            },
            body: JSON.stringify({
                'name': model.name,
                'description': model.description,
                'tagIds': model.tagIds,
                'fileKey': model.fileKey,
                'previewBlobKey': model.previewBlobKey
            })
        }).then(handleError)
            .then((response) => {
                return response.json();
            }).catch((err) => {
                if (modelFile) {
                    filesService.deleteFile(model.previewBlobKey);
                }
                if (modelPreview) {
                    filesService.deleteFile(model.fileKey);
                }
                throw err;
            });
    }

    async updateModel(model, modelFile, modelPreview, oldModelPreview) {
        if (modelFile) {
            model.fileKey = await filesService.createNewFile(modelFile);
        }

        if (model.previewBlobKey) {
            model.previewBlobKey = model.previewBlobKey.split('?')[0]; //split to remove updated parameter from url
        }

        if (modelPreview && oldModelPreview) {
            oldModelPreview = oldModelPreview.split('?')[0]; //split to remove updated parameter from url
            model.previewBlobKey = await filesService.updateFile(modelPreview, oldModelPreview);
        } else if (modelPreview && !oldModelPreview) {
            model.previewBlobKey = await filesService.createNewFile(modelPreview);
        }

        return fetch(this.modelsApiPath + model.modelId, {
            method: 'PUT',
            headers: {
                'Content-Type': this.contentTypeJson,
                'Authorization': `Bearer ${await authenticationService.getAccessToken()}`
            },
            body: JSON.stringify({
                'name': model.name,
                'description': model.description,
                'tagIds': model.tagIds,
                'fileKey': model.fileKey,
                'previewBlobKey': model.previewBlobKey
            })
        }).then(handleError)
            .then(response => {
                return response.json();
            }).catch(err => {
                if (modelPreview && !oldModelPreview) {
                    filesService.deleteFile(model.previewBlobKey);
                }
                if (modelFile) {
                    filesService.deleteFile(model.fileKey);
                }
                throw err;
            });
    }


    getTagName(tagId, tags) {
        let tagName = null;
        for (const tag of tags) {
            if (tag.tagId === tagId) {
                tagName =  tag.name;
            }
        }
        return tagName;
    }

    getTagId(tagName, tags) {
        let tagId = null;
        for (const tag of tags) {
            if (tag.name === tagName) {
                tagId = tag.tagId;
            }
        }
        return tagId;
    }
}

const modelsService = new ModelsService();
export default modelsService;
