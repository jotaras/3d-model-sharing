import React, { useEffect, useRef, useState } from 'react';
import './ModelViewerComponent.scss';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import modelsService from '../../services/ModelsService';
import LoadingComponent from '../LoadingComponent/LoadingComponent';
import useAlert from '../AlertComponent/useAlertHook';
import chevronLeftIcon from '../../assets/icon-chevron-left.svg';
import { HOME_LINK_PATH } from '../../constants/SystemConstants';
import fileService from '../../services/FilesService';
import { ModelRenderer } from '../../modelRenderer/ModelRenderer';
import planeImage from '../../assets/perspective.svg';
import cutImage from '../../assets/cut.svg';
import trashIcon from '../../assets/trash-icon-white.svg';
import * as Constants from '../../constants/Constants';

export default function ModelViewerComponent() {
    const [loading, setLoading] = useState(true);
    const containerRef = useRef();
    const {modelFromLink} = useLocation();
    const {addAlert}  = useAlert();
    const {modelId} = useParams();
    const modelFile = useRef(null);
    const [model, setModel] = useState(null);
    const renderer = useRef(null);
    const history = useHistory();

    const loadModelFile = async () => {
        try {
            if (modelFromLink) {
                modelFile.current = modelFromLink.modelFile;
                setModel(modelFromLink);
            } else {
                const fetchedModel = await modelsService.getModel(modelId);
                setModel(fetchedModel);
                modelFile.current = await fileService.getModelFile(fetchedModel.fileKey);
            }

            renderer.current = new ModelRenderer(containerRef.current, modelFile.current);
            await renderer.current.start();
        } catch (err) {
            addAlert(err.message);
            history.push(HOME_LINK_PATH);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadModelFile();
        return () => {
            if (renderer.current) {
                renderer.current.stop();
            }
        };
    }, []);


    return (
        <React.Fragment>
            {loading &&  <LoadingComponent loadingMessage = {Constants.MODELS_LOADING_TEXT}/>}
            <div className = 'page-container'>
                <div className = 'model-description'>
                    <button className = 'go-back-button' onClick = {() => {
                        history.push(HOME_LINK_PATH);
                    }}>
                        <img className = 'go-back-image' src = {chevronLeftIcon} alt = {Constants.BACK_IMAGE_ALT}></img>
                    </button>
                    {model && <h2 className = 'model-description-header'>{model.name}
                        <span className = 'model-version-span'>{`(version from ${new Date(model.updatedAt).toLocaleString()})`}</span>
                    </h2>}
                </div>
                <div className = 'scene-options-menu'>
                    <button className = 'add-plane-button' onClick = {() => {
                        console.log(renderer.current);
                        renderer.current.eventHandler.addPlaneToScene();}}>
                        <img className = 'add-plane-button-image' src = {planeImage}></img>
                        {Constants.ADD_PLANE_BUTTON_TEXT}
                    </button>
                    <button className = 'cut-model-button' onClick = {() => {
                        renderer.current.eventHandler.cutModel().catch((err) => addAlert(err.message));
                    }}>
                        <img className = 'cut-model-button-image' src = {cutImage}></img>
                        {Constants.CUT_MODEL_BUTTON_TEXT}
                    </button>
                    <button className = 'delete-model-button' onClick = {() => {
                        renderer.current.eventHandler.deleteModel().catch((err) => addAlert(err.message));
                    }}>
                        <img className = 'delete-model-button-image' src = {trashIcon}></img>
                        {Constants.DELETE_MODEL_BUTTON_TEXT}
                    </button>
                </div>
                <canvas id = 'scenne-canvas' tabIndex = {0} ref = {containerRef}></canvas>
            </div>
        </React.Fragment>
    );
}
