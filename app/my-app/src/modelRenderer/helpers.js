import { Vector2, Vector3 } from 'three';

export function getMousePosition(domElement, event) {
    // transform window coordinates to canvas coordinates
    const rect = domElement.getBoundingClientRect();
    const canvasX = (event.clientX - rect.left) * domElement.width  / rect.width;
    const canvasY = (event.clientY - rect.top ) * domElement.height / rect.height;

    //convert coordinates to [-1, 1] x [1, -1]
    const scenePosX = (canvasX / domElement.width ) *  2 - 1;
    const scenePosY = (canvasY / domElement.height) * -2 + 1;
    return new Vector2(scenePosX, scenePosY);
}

export function getDirectionVector(cameraPosition, target) {
    return new Vector3().subVectors(cameraPosition, target);
}

export function getRightVector(cameraDirection, cameraUp) {
    return new Vector3().crossVectors(cameraUp, cameraDirection);
}

export function getUpVector(cameraDirection, cameraRight) {
    return new Vector3().crossVectors(cameraDirection, cameraRight);
}

export function getControllableModel(model) {
    if (model.userData.isModelControllable) {
        return model;
    } else if(model.parent != null) {
        return getControllableModel(model.parent);
    }
    else return null;
}
