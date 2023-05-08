import React, { useState, useEffect, useRef, useMemo } from 'react';
import './ModelsListComponent.scss';
import * as Constants from '../../constants/Constants.js';
import defaultPicture from '../../assets/icon-image.svg';
import editIcon from '../../assets/edit-icon.svg';
import trashIcon from '../../assets/trash-icon.svg';
import CreateUpdateModelForm from '../ModelCreateUpdateModal/ModelCreateUpdateModal';
import modelsService from '../../services/ModelsService';
import useAlert from '../AlertComponent/useAlertHook';
import useConfirm  from '../ConfirmComponent/useConfirmHook';
import LoadingComponent from '../LoadingComponent/LoadingComponent';
import usersService from '../../services/UsersService';
import useSort from '../useSortHook';
import useSearch from '../useSearchHook';
import { MODEL_FIELDS } from '../../constants/SystemConstants';


export default function ModelsListComponent() {
    const [models, setModels] = useState([]);
    const [tags, setTags] = useState([]);
    const [users, setUsers] = useState([]);
    const [loadError, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const modelToChange = useRef(null);
    const {confirmDialog} = useConfirm();
    const {addAlert} = useAlert();
    const {sort, handleSortOptionChange, sortOption, displaySortChevrons} = useSort();
    const {searchOption, setSearchOption, find} = useSearch();


    const handleDelete = async (model) => {
        const confrimed = await confirmDialog(Constants.DELETE_MODEL_CONFIRM_TEXT);
        if (confrimed) {
            modelsService.deleteModel(model)
                .then(() => {
                    setModels((oldModels) =>  {
                        return oldModels.filter((m) => {
                            return m.modelId !== model.modelId;
                        });
                    });
                    addAlert(Constants.MODEL_DELETED_MESSAGE);

                })
                .catch(err => {
                    addAlert(err.message);
                });
        }
    };

    const modelsToMap = useMemo(() => {
        const newModels = find(models, MODEL_FIELDS.NAME, MODEL_FIELDS.DESCRIPTION);
        sort(newModels);
        return newModels;
    }, [models, searchOption, sortOption]);

    async function getData() {
        try {
            setModels(await modelsService.getAllModels());
            setTags(await modelsService.getAllTags());
            setUsers(await usersService.getAllUsers());
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getData();
    }, []);

    if (loadError) {
        return(<p>{loadError.message}</p>);
    }

    if (loading) {
        return <LoadingComponent loadingMessage = {Constants.MODELS_LOADING_TEXT}/>;
    }


    return(
        <div>
            {
                showForm && <CreateUpdateModelForm closeForm = {() => setShowForm(false)} modelToChange = {modelToChange.current} tags = {tags}
                    setTags = {setTags} models = {models} setModels = {setModels} />
            }
            <div className = 'models-list-tools'>
                <button className = 'create-new-model-button' onClick = {() => {
                    modelToChange.current = null;
                    setShowForm(true);}}>
                    {Constants.NEW_MODEL_BUTTON_NAME}</button>
                <input className = 'search-model-input' placeholder = {Constants.SEARCH_MODEL_PLACEHOLDER} onChange =
                    {event => setSearchOption(event.target.value.toLowerCase())}>
                </input>
            </div>
            <div className = 'models-table-container'>
                <table className = 'models-table'>
                    <thead>
                        <tr>
                            <th>
                                <button className = 'sort-button'>
                                    {Constants.PICTURE_SORT_BUTTON_TEXT}
                                </button>
                            </th>
                            <th>
                                <button className = 'sort-button' onClick = {() => handleSortOptionChange(MODEL_FIELDS.NAME)}>
                                    {displaySortChevrons(MODEL_FIELDS.NAME)}
                                    {Constants.NAME_SORT_BUTTON_TEXT}
                                </button>
                            </th>
                            <th>
                                <button className = 'sort-button' onClick = {() => handleSortOptionChange(MODEL_FIELDS.DESCRIPTION)}>
                                    {displaySortChevrons(MODEL_FIELDS.DESCRIPTION)}
                                    {Constants.DECRIPTION_SORT_BUTTON_TEXT}
                                </button>
                            </th>
                            <th>
                                <button className = 'sort-button' >
                                    {Constants.TAGS_SORT_BUTTON_TEXT}
                                </button>
                            </th>
                            <th>
                                <button className = 'sort-button'  onClick = {() => handleSortOptionChange(MODEL_FIELDS.UPDATED_AT)}>
                                    {displaySortChevrons(MODEL_FIELDS.UPDATED_AT)}
                                    {Constants.LAST_UPDATE_SORT_BUTTON_TEXT}
                                </button>
                            </th>
                            <th>
                                <button className = 'sort-button'>
                                    {Constants.ACTIONS_SORT_BUTTON_TEXT}
                                </button>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {modelsToMap.map((model, index) => {
                            const imageSrc = (model.previewBlobKey) ? ('filestorage/' + model.previewBlobKey) : (defaultPicture);
                            const date = new Date(model.updatedAt);
                            const userName =  usersService.getUserNameById(model.updatedBy, users);
                            const lastUpdate = `${date.toLocaleString()} by ${userName}`;
                            return(
                                <tr key = {index}>
                                    <td> <img className = 'model-preview' src = {imageSrc} alt = {Constants.PREVIEW_IMAGE_ALT}></img>  </td>
                                    <td> {model.name} </td>
                                    <td>{model.description}</td>
                                    <td>
                                        <div className = 'tags-container'>
                                            {
                                                model.tagIds.map(tagId => {
                                                    return(modelsService.getTagName(tagId, tags));
                                                }).join(', ')
                                            }
                                        </div>
                                    </td>
                                    <td> {lastUpdate} </td>
                                    <td>
                                        <button className = 'action-buttons' onClick = {() => {
                                            setShowForm(true);
                                            modelToChange.current = model;
                                        }}>
                                            <img className = 'update-model-image' src = {editIcon} alt = {Constants.UPDATE_MODEL_IMAGE_ALT}></img>
                                        </button>

                                        <button className = 'action-buttons' onClick = {() => handleDelete(model)}>
                                            <img key = {Date.now()} className = 'delete-model-image' src = {trashIcon} alt = {Constants.DELETE_MODEL_IMAGE_ALT}></img>
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
