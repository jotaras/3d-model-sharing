import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as Constants from '../../constants/Constants';
import './ModelHistoryComponent.scss';
import addIcon from '../../assets/icon-plus.svg';
import closeIcon from '../../assets/icon-x.svg';
import chevronDownIcon from '../../assets/icon-chevron-down.svg';
import chevronRightIcon from '../../assets/icon-chevron-right.svg';
import AutoSuggestTagComponent from '../AutosuggestTagComponent/AutosuggestTagComponent';
import modelsService from '../../services/ModelsService';
import usersService from '../../services/UsersService';
import LoadingComponent from '../LoadingComponent/LoadingComponent';
import { Link, useHistory } from 'react-router-dom';
import defaultPreview from '../../assets/icon-image.svg';
import { HOME_LINK_PATH, MODEL_FIELDS, MODEL_VIEWER_PATH } from '../../constants/SystemConstants';
import useAlert from '../AlertComponent/useAlertHook';
import useSortHook from '../useSortHook';
import useSearchHook from '../useSearchHook';
import filesService from '../../services/FilesService';

export default function ModelHistoryComponent() {
    const [models, setModels] = useState([]);
    const [tags, setTags] = useState([]);
    const [users, setUsers] = useState([]);
    const [loadError, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [modelPreviewDisplay, setModelPreviewDisplay] = useState(null);
    const [showTags, setShowTags] = useState(false);
    const [tagsToFilter, setTagsTofilter] = useState([]);
    const {addAlert} = useAlert();
    const {sortOption, handleSortOptionChange, sort, displaySortChevrons} = useSortHook();
    const {searchOption, setSearchOption, find} = useSearchHook();
    const fetchingModelHistory = useRef(false);
    const fetchingModelFile = useRef(false);
    const history = useHistory();

    const handleExpandClick = async (model) => {
        if (model.modelHistory) {
            setModels(models.map((oldModel) => {
                return oldModel.modelId === model.modelId ? {...oldModel, expanded: !oldModel.expanded} : oldModel;
            }));
        } else if (!fetchingModelHistory.current) {
            fetchingModelHistory.current = true;
            await modelsService.getModelHistory(model.modelId).then((modelHistory) => {
                setModels(models.map((oldModel) => {
                    return oldModel.modelId === model.modelId ? {...oldModel, expanded: !oldModel.expanded, modelHistory: modelHistory.reverse()} : oldModel;
                }));
            }).catch((err) => {
                setModels(models.map((oldModel) => {
                    return oldModel.modelId === model.modelId ? {...oldModel, expanded: !oldModel.expanded, modelHistory: []} : oldModel;
                }));
                addAlert(err.message);
            }).finally(() => {
                fetchingModelHistory.current = false;
            });
        }
    };

    const modelsToMap = useMemo(() => {
        let newModelsList = find(models, MODEL_FIELDS.NAME, MODEL_FIELDS.DESCRIPTION);

        if (tagsToFilter.length > 0) {
            const tagsToFilterIds = tagsToFilter.map(tagName => modelsService.getTagId(tagName, tags));
            newModelsList = newModelsList.filter(model => {
                let isTag = true;
                for (const tagId of tagsToFilterIds) {
                    if (!model.tagIds.includes(tagId)) {
                        isTag = false;
                        break;
                    }
                }
                return isTag;
            });
        }

        sort(newModelsList);
        return newModelsList;
    }, [models, sortOption, searchOption,  tagsToFilter]);


    async function getData() {
        try {
            const fetchedModels = await modelsService.getAllModels();
            const modelsWithExpandParam = fetchedModels.map((model => {
                return {...model, expanded: false};
            }));
            setModels(modelsWithExpandParam);
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


    const actionButtons = (model, modelHistory) => {
        const modelCopy = {...model};
        if (modelHistory) {
            modelCopy.fileKey = modelHistory.fileKey;
            modelCopy.updatedAt = modelHistory.createdAt;
        }
        return (
            <td>
                <Link to = {HOME_LINK_PATH} className = 'action-buttons' onClick = {() => {
                    const previewSrc = modelCopy.previewBlobKey ? 'filestorage/' + modelCopy.previewBlobKey : defaultPreview;
                    setModelPreviewDisplay(previewSrc);
                }}>{Constants.PREVIEW_MODEL_BUTTON_TEXT}</Link>

                <Link to = {`filestorage/${modelCopy.fileKey}`} download target = '_blank' className = 'action-buttons'>{Constants.DOWNLOAD_MODEL_BUTTON_TEXT}</Link>

                <Link to = {`${MODEL_VIEWER_PATH}/${modelCopy.modelId}`} className = 'action-buttons' onClick={(event) => {
                    event.preventDefault();
                    if (fetchingModelFile.current !== modelCopy.modelId) {
                        filesService.getModelFile(modelCopy.fileKey)
                            .then((modelFile) => {
                                fetchingModelFile.current = modelCopy.modelId;
                                modelCopy.modelFile = modelFile;
                                history.push({pathname: `${MODEL_VIEWER_PATH}/${modelCopy.modelId}`, modelFromLink: modelCopy});
                            }).catch((err) => {
                                addAlert(err.message);
                            });
                    }
                }}>{Constants.VIEW_MODEL_BUTTON_TEXT}</Link>
            </td>
        );
    };


    return (
        <div>
            {
                modelPreviewDisplay && <div className = 'moled-preview-container'>
                    <button className = 'close-model-preview-button' onClick = {() => {
                        setModelPreviewDisplay(null);
                    }}>
                        <img className = 'close-model-preview-image' src = {closeIcon} alt = {Constants.CLOSE_IMG_ALT}/>
                    </button>
                    <img className = 'model-preview-image' alt = {Constants.PREVIEW_IMAGE_ALT} src = {modelPreviewDisplay}/>
                </div>
            }

            <div className = 'model-history-tools'>
                <label className = 'add-tag-filter-label'>{Constants.SELECTED_TAGS_LABEL}</label>
                <div className = 'filter-tags-container'>
                    {tagsToFilter.map((tag, index) => {
                        return (
                            <div className = 'filter-tag-container' key = {index}>
                                <label className = 'filter-tag-label'>{tag}</label>
                                <button className = 'remove-filter-tag-button' onClick = {() => {
                                    setTagsTofilter(tagsToFilter.filter((oldTag) => {
                                        return oldTag !== tag;
                                    }));
                                }}>
                                    <img className = 'remove-filter-tag-image' src = {closeIcon} alt = {Constants.CLOSE_IMG_ALT}/>
                                </button>
                            </div>
                        );
                    })}
                </div>
                <div className = 'add-tag-search-model-container'>
                    <div style = {{display: 'flex'}}>
                        <label className = 'add-tag-filter-label'>{Constants.ADD_TAG_LABEL_TEXT}</label>
                        <button className = 'add-tag-filter-button' onClick = {() => setShowTags(!showTags)}>
                            <img src = {showTags ? closeIcon : addIcon} alt = {Constants.ADD_TAG_IMAGE_ALT}/>
                        </button>
                    </div>
                    <div className = 'add-tag-filter-container'>
                        {showTags && <AutoSuggestTagComponent allTags = {tags} setChosenTags = {setTagsTofilter} chosenTags = {tagsToFilter}/>}
                    </div>
                    <input className = 'search-model-history' placeholder = {Constants.SEARCH_MODEL_PLACEHOLDER} onChange = {(event) => setSearchOption(event.target.value.toLowerCase())}>
                    </input>
                </div>
            </div>
            <div className = 'model-history-table-container'>
                <table className = 'model-history-table'>
                    <thead>
                        <tr>
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
                                <button className = 'sort-button'>
                                    {Constants.ACTIONS_SORT_BUTTON_TEXT}
                                </button>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {modelsToMap.map((model, index) => {
                            const chevronIcon = model.expanded ? chevronDownIcon : chevronRightIcon;
                            return(
                                <React.Fragment key = {index}>
                                    <tr className = 'model-history-body'>
                                        <td>
                                            <button className = 'expand-model-button' onClick = {() => handleExpandClick(model)}>
                                                <img src = {chevronIcon} alt = {Constants.EXPAND_MODEL_IMAGE_ALT} />
                                            </button>
                                            {model.name}
                                        </td>
                                        <td> {model.description}</td>
                                        <td>
                                            {
                                                model.tagIds.map(tagId => {
                                                    return(modelsService.getTagName(tagId, tags));
                                                }).join(', ')
                                            }
                                        </td>
                                        {actionButtons(model)}
                                    </tr>
                                    {model.expanded &&
                                        <React.Fragment>
                                            <tr className = 'expanded-model-head'>
                                                <th>{Constants.UPDATED_DATE_LABEL}</th>
                                                <th>{Constants.UPDATED_BY_LABEL}</th>
                                                <th></th>
                                            </tr>
                                            <tr className = 'expanded-model-body'>
                                                <td>
                                                    <label className = 'last-update-label'>{Constants.LAST_UPDATED_LABEL}</label>
                                                    {new Date(model.updatedAt).toLocaleString()}
                                                </td>
                                                <td>
                                                    {usersService.getUserNameById(model.updatedBy, users)}
                                                </td>
                                                {actionButtons(model)}
                                            </tr>
                                            {model.modelHistory.map((history, historyIndex) => {
                                                return (
                                                    <tr className = 'expanded-model-body' key = {historyIndex}>
                                                        <td>
                                                            {new Date(history.createdAt).toLocaleString()}
                                                        </td>
                                                        <td>
                                                            {usersService.getUserNameById(history.createdBy, users)}
                                                        </td>
                                                        {actionButtons(model, history)}
                                                    </tr>
                                                );
                                            })}
                                        </React.Fragment>
                                    }
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
