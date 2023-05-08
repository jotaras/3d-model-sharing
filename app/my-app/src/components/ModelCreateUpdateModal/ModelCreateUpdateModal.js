import minusIcon from '../../assets/icon-circle-minus.svg';
import React, { useEffect, useRef, useState } from 'react';
import closeIcon from '../../assets/circle-x-icon.svg';
import './ModelCreateUpdateModal.scss';
import * as Constants from '../../constants/Constants.js';
import modelsService from '../../services/ModelsService';
import AutosuggestTagComponent from '../AutosuggestTagComponent/AutosuggestTagComponent';
import useAlert from '../AlertComponent/useAlertHook.js';
import { MODEL_FIELDS, SUPPORTED_IMAGE_EXTENSIONS, SUPPORTED_MODEL_EXTENSIONS } from '../../constants/SystemConstants';
import filesService from '../../services/FilesService';

export default function ModelCreateUpdateModal(props) {
    const [modelPreview, setModelPreview] = useState(null);
    const [modelFile, setModelFile] = useState(null);
    const [newModel, setNewModel] = useState({
        modelId: null,
        name:  '',
        description:  '',
        fileKey: null,
        previewBlobKey: null,
        tagIds: [],

    });
    const [modelTags, setModelTags] = useState([]);
    const [validationErrors, setValidationErrors] = useState({
        name:  '',
        description: '',
        fileKey: '',
        tag: ''
    });
    const {addAlert} = useAlert();
    const tags = useRef(props.tags);
    const submitRef = useRef();

    useEffect(() => {
        if (props.modelToChange) {
            setNewModel({...props.modelToChange});
            setModelTags(props.modelToChange.tagIds.map(tagId => {
                return modelsService.getTagName(tagId, props.tags);
            }));
        }
    }, []);

    const handleInputChange = (event) => {
        const field = event.target.name;
        const value = event.target.value;
        setNewModel({...newModel, [field]: value});
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!isInputValid(newModel, modelFile, setValidationErrors)) {
            return;
        }

        submitRef.current.setAttribute('disabled', true);
        props.closeForm();

        const tagNames = tags.current.map(tag => tag.name);
        const tagsToCreate = modelTags.filter(tag => !tagNames.includes(tag));

        try {
            if (tagsToCreate.length !== 0) {
                const createdTags = await modelsService.createNewTags(tagsToCreate);
                tags.current = [...tags.current, ...createdTags];
                props.setTags([...props.tags, ...createdTags]);
            }

            newModel.tagIds = modelTags.map(tag => {
                return modelsService.getTagId(tag, tags.current);
            });

            if (props.modelToChange) {
                const updatedModel = await modelsService.updateModel(newModel, modelFile, modelPreview, props.modelToChange.previewBlobKey);
                addAlert(Constants.MODEL_UPDATED_MESSAGE);
                if (updatedModel.previewBlobKey) {
                    updatedModel.previewBlobKey = `${updatedModel.previewBlobKey}?updated=${Date.now()}`; //add parameter to force image fetching
                }
                props.setModels((oldModels) => oldModels.map(model => {
                    return model.modelId === updatedModel.modelId ? updatedModel : model;
                }));

            } else {
                const createdModel = await modelsService.createNewModel(newModel, modelFile, modelPreview);
                addAlert(Constants.MODEL_CREATED_MESSAGE);
                props.setModels((oldModels) => [...oldModels, createdModel]);
            }

        } catch(err) {
            addAlert(err.message);
        }
    };

    return(
        <div className = 'form-container'>
            <form className = 'form' onSubmit = {handleSubmit}>
                <button type = 'button' className = 'close-form-button' onClick = {props.closeForm}>
                    <img className = 'close-form-image' src = {closeIcon} alt = {Constants.CLOSE_MODEL_FORM_ALT}></img>
                </button>
                <input
                    className = 'form-name-input'
                    type = 'text'
                    name = {MODEL_FIELDS.NAME}
                    value = {newModel.name}
                    onChange = {handleInputChange}
                    autoComplete = 'off'
                    placeholder = {Constants.FORM_INPUT_NAME_PLACEHOLDER}
                />
                <label className = 'validation-errors'>{validationErrors.name}</label>
                <textarea
                    className = 'form-description-textarea'
                    name = {MODEL_FIELDS.DESCRIPTION}
                    value = {newModel.description}
                    onChange = {handleInputChange}
                    placeholder = {Constants.FORM_INPUT_DESCRIPTION_PLACEHOLDER}
                />
                <label className = 'validation-errors'>{validationErrors.description}</label>
                <label className = 'tags-label'>{Constants.FORM_TAGS_LABEL}</label>
                <div className = 'tag-container'>
                    {
                        modelTags.map((tag, index) => {
                            return(
                                <div className = 'tag-div' key = {index}>
                                    <label>{tag}</label>
                                    <button className = 'remove-tag-button' type = 'button' onClick = {() => {
                                        setModelTags(modelTags.filter(t => t !== tag));
                                    }}>
                                        <img className = 'remove-tag-img' src = {minusIcon} alt = ''></img>
                                    </button>
                                </div>
                            );
                        })
                    }
                </div>
                <AutosuggestTagComponent allTags = {props.tags} chosenTags  = {modelTags} setChosenTags = {setModelTags} />
                <input id = 'load-model-preview' type = 'file' accept = {Object.values(SUPPORTED_IMAGE_EXTENSIONS)} name = 'previewBlobKey' onChange = {
                    (event) => {
                        try {
                            const file = event.target.files[0];
                            if (file) {
                                filesService.getSupportedImageExtension(file.name);
                                setModelPreview(file);
                            }
                        } catch(err) {
                            addAlert(err.message);
                        }
                    }}/>
                <div className = 'choose-file-container'>
                    <button type = 'button' className = 'choose-file-button'>
                        <label className = 'chose-file-button-label' htmlFor = 'load-model-preview'>
                            {Constants.FORM_INPUT_MODEL_PREVIEW_TEXT}
                        </label>
                    </button>
                    <label className = 'choosed-file'>{modelPreview ? modelPreview.name : null}</label>
                </div>
                <input id = 'load-model-file' type = 'file' name = 'fileKey' accept = {Object.values(SUPPORTED_MODEL_EXTENSIONS)}  onChange = {
                    (event) => {
                        try {
                            const file = event.target.files[0];
                            if (file) {
                                filesService.getSupportedModelExtension(file.name);
                                setModelFile(file);
                            }
                        } catch(err) {
                            addAlert(err.message);
                        }
                    }}/>
                <div className = 'choose-file-container'>
                    <button type = 'button' className = 'choose-file-button'>
                        <label className = 'chose-file-button-label' htmlFor = 'load-model-file'>
                            {Constants.FORM_INPUT_MODEL_FILE_TEXT}
                        </label>
                    </button>
                    <label className = 'choosed-file'>{modelFile ? modelFile.name : null}</label>
                </div>
                <label className = 'validation-errors'>{validationErrors.fileKey}</label>
                <input type = 'submit' ref = {submitRef} value = {Constants.SUBMIT_BUTTON_TEXT}/>
            </form>
        </div>
    );
}

const isInputValid = (newModel, modelFile, setValidationErrors) => {
    let isValid = true;
    const validationErrorsObject = {};


    if (!newModel.name) {
        validationErrorsObject.name = Constants.MODEL_NAME_EMPTY_ERROR_MESSAGE;
        isValid = false;
    } else if (newModel.name.length >= 40) {
        validationErrorsObject.name = Constants.MODEL_NAME_SIZE_ERROR_MESSAGE;
        isValid = false;
    }

    if (!newModel.description) {
        validationErrorsObject.description = Constants.MODEL_DESCR_EMPTY_ERROR_MESSAGE;
        isValid = false;
    } else if (newModel.name.length >= 200) {
        validationErrorsObject.name = Constants.MODEL_DESCR_SIZE_ERROR_MESSAGE;
        isValid = false;
    }

    if (!newModel.modelId && !modelFile) {
        validationErrorsObject.fileKey = Constants.MODEL_FILE_EMPTY_ERROR_MESSAGE;
        isValid = false;
    }

    setValidationErrors(validationErrorsObject);
    return isValid;
};
