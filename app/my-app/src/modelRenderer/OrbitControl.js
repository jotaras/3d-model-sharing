import * as THREE from 'three';
import {getDirectionVector, getRightVector, getMousePosition} from './helpers';

export class OrbitControl extends THREE.EventDispatcher {
    cameraUp = new THREE.Vector3(0, 1, 0);

    constructor(camera, domElement, scene) {
        super();
        this.camera = camera;
        this.domElement = domElement;
        this.scene = scene;
        this.domElement.style.touchAction = 'none';
        this.handleClick = this.handleClick.bind(this);
        this.handleDefaultCameraPositions = this.handleDefaultCameraPositions.bind(this);
        this.handleOrbitMotion = this.handleOrbitMotion.bind(this);
        this.handlePanTransformation = this.handlePanTransformation.bind(this);
        this.handleZoom = this.handleZoom.bind(this);
    }

    handleZoom(event) {
        event.preventDefault();
        const directionVector = getDirectionVector(this.camera.position, this.target);
        directionVector.multiplyScalar(0.1); //distance to move on mouse wheel

        //rolling backward
        if (event.deltaY > 0) {
            this.camera.position.add(directionVector);
        } else { //rolling forward
            this.camera.position.add(directionVector.negate());
        }
    }

    handleClick(event) {
        this.mouseRightClickPosition = getMousePosition(this.domElement, event);
        this.mouseLeftClickPosition = getMousePosition(this.domElement, event);
    }

    handlePanTransformation(event) {
        this.mouseRightMovePosition = getMousePosition(this.domElement, event);

        const cameraDirection = getDirectionVector(this.camera.position, this.target);
        const length = cameraDirection.length();
        //normalize vector to move the camera relative to the distance from target, and not relative to right and up vectors
        cameraDirection.normalize();

        const deltaX = (this.mouseRightClickPosition.x - this.mouseRightMovePosition.x) * length;
        const deltaY = (this.mouseRightClickPosition.y - this.mouseRightMovePosition.y) * length;

        const cameraRight = getRightVector(cameraDirection, this.cameraUp);

        const vectorShift = cameraRight.multiplyScalar(deltaX).add(this.cameraUp.clone().multiplyScalar(deltaY));
        this.camera.position.add(vectorShift);
        this.target.add(vectorShift);

        this.mouseRightClickPosition.copy(this.mouseRightMovePosition);
    }

    handleOrbitMotion(event) {
        // {rotate in coordinate system [-1, 1]}
        this.mouseLeftMovePosition = getMousePosition(this.domElement, event);
        const deltaAngleX = Math.PI; // a movement from sides to center = PI = 180 deg
        const deltaAngleY = (Math.PI / 2);  // a movement from top or bottom to center = PI / 2 = 90 deg
        const xAngle = (this.mouseLeftMovePosition.x - this.mouseLeftClickPosition.x) * -deltaAngleX;
        let yAngle = (this.mouseLeftMovePosition.y - this.mouseLeftClickPosition.y) * deltaAngleY;

        //direction vector not normalized, because the camera needs to rotate on distance from target
        //if normalize vector, then camera will rotate on distance 1 from target
        const cameraDirection = new THREE.Vector3().subVectors(this.camera.position, this.target);

        //get camera right for rotation axis
        const cameraRight = getRightVector(cameraDirection, THREE.Camera.DefaultUp).normalize();

        //if dot product = 1 - camera on +y axis
        //if dot product = -1 - camera on -y axis
        //normilize direction vector to get dot product in range [-1, 1]
        const normalizedDirection = cameraDirection.clone().normalize();
        const dotProduct = normalizedDirection.dot(THREE.Camera.DefaultUp);
        const dotProductAfterRotation = dotProduct - yAngle;
        // makes camere not rotate over y axis
        if (dotProductAfterRotation > 1) {
            yAngle = dotProduct - 1;
        } else if (dotProductAfterRotation < -1) {
            yAngle = dotProduct + 1;
        }

        //rotation around up axis
        const rotationMarixX = new THREE.Matrix4().makeRotationAxis(THREE.Camera.DefaultUp, xAngle);

        //rotation around right axis
        const rotationMarixY = new THREE.Matrix4().makeRotationAxis(cameraRight, yAngle);

        this.camera.position.copy(new THREE.Vector3().addVectors(cameraDirection.applyMatrix4(rotationMarixX), this.target));
        this.camera.position.copy(new THREE.Vector3().addVectors(cameraDirection.applyMatrix4(rotationMarixY), this.target));
        this.cameraUp.applyMatrix4(rotationMarixX);
        this.cameraUp.applyMatrix4(rotationMarixY);
        this.camera.lookAt(this.target);

        this.mouseLeftClickPosition.copy(this.mouseLeftMovePosition);
    }

    handleDefaultCameraPositions(event) {
        switch(event.key) {
        case 'ArrowRight': {
            this.rotateAroundYAxisBy(90);
            break;
        }
        case 'ArrowLeft': {
            this.rotateAroundYAxisBy(-90);
            break;
        }
        case 'ArrowUp': {
            if (event.ctrlKey) {
                this.rotateAtYAxisBy(-90);
            } else {
                this.setCameraFrontView();
            }
            break;
        }

        case 'ArrowDown': {
            if (event.ctrlKey) {
                this.rotateAtYAxisBy(-270);
            } else {
                this.rotateAroundYAxisBy(180);
            }
            break;
        }
        }
    }


    setViewingModel(model) {
        this.model = model;
        this.setCameraFrontView();
    }

    rotateAroundYAxisBy(angleDegrees) {
        this.setCameraFrontView();
        const radians = THREE.MathUtils.degToRad(angleDegrees);
        const rotationMatrix = new THREE.Matrix3();
        rotationMatrix.set(Math.cos(radians), 0, Math.sin(radians),
            0, 1, 0,
            -Math.sin(radians), 0, Math.cos(radians));
        this.camera.position.applyMatrix3(rotationMatrix);
        this.camera.lookAt(this.target);
    }

    rotateAtYAxisBy(angleDegrees) {
        this.setCameraFrontView();
        const radians = THREE.MathUtils.degToRad(angleDegrees);
        const rotationMatrix = new THREE.Matrix3();
        rotationMatrix.set(0, 0, 0,
            0, Math.cos(radians), -Math.sin(radians),
            0, 0, 0);
        this.camera.position.applyMatrix3(rotationMatrix);
        this.camera.lookAt(this.target);
    }

    setCameraFrontView() {
        const boundingBox = new THREE.Box3().setFromObject(this.model);
        const center = boundingBox.getCenter(new THREE.Vector3());
        this.target = center;
        const newCameraPosition = new THREE.Vector3(center.x, center.y, center.z + 10);
        this.camera.position.copy(newCameraPosition);
        this.camera.lookAt(center);
    }

}
