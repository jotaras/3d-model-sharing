import * as THREE from 'three';
import { MODEL_NOT_SELECTED_ERROR_MESSAGE } from '../constants/Constants';
import { getDirectionVector, getRightVector, getUpVector, getMousePosition, getControllableModel } from './helpers';

export class TriadControl {
    ARROW_SIZE = 5;
    ARROW_RADIUS = 0.05;
    ARROW_CONE_RADIUS = 0.4;
    TORUS_RADIUS = 4;
    TORUS_RADIAL_SEGMENTS = 8;
    TORUS_TUBE = 0.05;
    TORUS_TUBULAR_SEGMENTS = 64;
    X_ARROW_NAME = 'xArrow';
    Y_ARROW_NAME = 'yArrow';
    Z_ARROW_NAME = 'zArrow';
    X_TORUS_NAME = 'xTorus';
    Y_TORUS_NAME = 'yTorus';
    Z_TORUS_NAME = 'zTorus';
    raycaster = new THREE.Raycaster();
    circleForRotationMesh = null;
    currentRotationAxisObject = null;

    constructor(domElement, camera, scene) {
        this.handleXArrowMove = this.handleXArrowMove.bind(this);
        this.handleYArrowMove = this.handleYArrowMove.bind(this);
        this.handleZArrowMove = this.handleZArrowMove.bind(this);
        this.handleRotation = this.handleRotation.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.deleteModelFromScene = this.deleteModelFromScene.bind(this);
        this.handleDoubleClick = this.handleDoubleClick.bind(this);

        this.domElement = domElement;
        this.camera = camera;
        this.scene = scene;

        this.xArrow = new THREE.Object3D();
        this.xArrow.rotateZ(-Math.PI / 2); //place arrow horizontally on X axis
        this.yArrow = new THREE.Object3D();
        this.zArrow = new THREE.Object3D();
        this.zArrow.rotateX(Math.PI / 2); //place arrow horizontally on Z axis

        this.xArrow.name = this.X_ARROW_NAME;
        this.yArrow.name = this.Y_ARROW_NAME;
        this.zArrow.name = this.Z_ARROW_NAME;

        this.xTorus = new THREE.Object3D();
        this.yTorus = new THREE.Object3D();
        this.zTorus = new THREE.Object3D();

        this.xTorus.rotateY(Math.PI / 2);
        this.yTorus.rotateX(Math.PI / 2);

        this.xTorus.name = this.X_TORUS_NAME;
        this.yTorus.name = this.Y_TORUS_NAME;
        this.zTorus.name = this.Z_TORUS_NAME;
    }

    handleClick(event) {
        this.mouseLeftClickPosition = getMousePosition(this.domElement, event);
    }

    handleDoubleClick(event) {
        this.raycaster.setFromCamera(getMousePosition(this.domElement, event), this.camera);
        const intersects = this.raycaster.intersectObject(this.scene);

        if (intersects.length > 0) {
            const intersectObject = intersects.shift().object;

            const modelObject = getControllableModel(intersectObject);
            const triadGroup = this.isModelWithTriad(intersectObject);
            if (triadGroup) {
                console.log(this.model);
                this.removeTriadFromModel();
            } else if (modelObject) {
                if (this.model) {
                    this.removeTriadFromModel();
                }
                this.setTriadToModel(modelObject);
            }
        }
    }

    deleteModelFromScene() {
        if (!this.model) {
            throw new Error(MODEL_NOT_SELECTED_ERROR_MESSAGE);
        }
        this.triadContainer.clear();
        this.triadContainer = null;
        this.model = null;
    }


    getTriadHandler() {
        if (!this.triadContainer) {
            return;
        }
        this.raycaster.setFromCamera(this.mouseLeftClickPosition, this.camera);
        const intersects = this.raycaster.intersectObject(this.triadContainer);

        if (intersects.length > 0) {
            const firstIntersect = intersects.shift();
            this.clickedIntersectPoint = new THREE.Vector3().copy(firstIntersect.point);
            const objectName = firstIntersect.object.name || firstIntersect.object.parent.name;
            switch(objectName) {
            case this.X_ARROW_NAME: {
                return this.handleXArrowMove;
            }
            case this.Y_ARROW_NAME: {
                return this.handleYArrowMove;
            }
            case this.Z_ARROW_NAME: {
                return this.handleZArrowMove;
            }
            case this.X_TORUS_NAME: {
                this.currentRotationAxisObject = this.xTorus;
                this.clickedIntersectPoint = this.currentRotationAxisObject.worldToLocal(this.clickedIntersectPoint);
                this.currentRotationAxisObject.add(this.circleForRotationMesh);
                return this.handleRotation;
            }
            case this.Y_TORUS_NAME: {
                this.currentRotationAxisObject = this.yTorus;
                this.clickedIntersectPoint = this.currentRotationAxisObject.worldToLocal(this.clickedIntersectPoint);
                this.currentRotationAxisObject.add(this.circleForRotationMesh);
                return this.handleRotation;
            }
            case this.Z_TORUS_NAME: {
                this.currentRotationAxisObject = this.zTorus;
                this.clickedIntersectPoint = this.currentRotationAxisObject.worldToLocal(this.clickedIntersectPoint);
                this.currentRotationAxisObject.add(this.circleForRotationMesh);
                return this.handleRotation;
            }
            }
        }
        return null;
    }


    setTriadToModel(model) {
        this.model = model;
        const worldModelPosition = new THREE.Vector3().copy(this.model.position);
        this.model.position.set(0,0,0);
        const boundingBox = new THREE.Box3().setFromObject(model);
        const center = boundingBox.getCenter(new THREE.Vector3());

        this.xArrow.clear();
        this.yArrow.clear();
        this.zArrow.clear();
        this.xTorus.clear();
        this.yTorus.clear();
        this.zTorus.clear();

        const xAxisMaterial = new THREE.MeshStandardMaterial({color: 0xff0000});
        const yAxisMaterial = new THREE.MeshStandardMaterial({color: 0x00ff00});
        const zAxisMaterial = new THREE.MeshStandardMaterial({color: 0x0000ff});

        //triad arrows
        const cylinderGeometry = new THREE.CylinderGeometry(this.ARROW_RADIUS, this.ARROW_RADIUS, this.ARROW_SIZE);
        const coneGeometry = new THREE.ConeGeometry(this.ARROW_CONE_RADIUS, this.ARROW_SIZE / 5);

        const xCylinder = new THREE.Mesh(cylinderGeometry, xAxisMaterial);
        const yCylinder = new THREE.Mesh(cylinderGeometry, yAxisMaterial);
        const zCylinder = new THREE.Mesh(cylinderGeometry, zAxisMaterial);

        const conePosition = this.ARROW_SIZE / 2; //place at the end of cylinder

        const xArrowCone = new THREE.Mesh(coneGeometry, xAxisMaterial);
        xArrowCone.position.setY(conePosition);
        const yArrowCone = new THREE.Mesh(coneGeometry, yAxisMaterial);
        yArrowCone.position.setY(conePosition);
        const zArrowCone = new THREE.Mesh(coneGeometry, zAxisMaterial);
        zArrowCone.position.setY(conePosition);

        this.xArrow.add(xCylinder, xArrowCone);
        this.yArrow.add(yCylinder, yArrowCone);
        this.zArrow.add(zCylinder, zArrowCone);

        //triad circles
        const torusGeometry = new THREE.TorusGeometry(this.TORUS_RADIUS, this.TORUS_TUBE, this.TORUS_RADIAL_SEGMENTS, this.TORUS_TUBULAR_SEGMENTS);
        const xTorusMesh = new THREE.Mesh(torusGeometry, xAxisMaterial);
        const yTorusMesh = new THREE.Mesh(torusGeometry, yAxisMaterial);
        const zTorusMesh = new THREE.Mesh(torusGeometry, zAxisMaterial);

        this.xTorus.add(xTorusMesh);
        this.yTorus.add(yTorusMesh);
        this.zTorus.add(zTorusMesh);

        const circleForRotationMaterial = new THREE.MeshBasicMaterial();
        // -1 of inner radius and +1 to outer radius of torus to allow user move mouse not exactly on visible torus
        const circleForRotationGeometry = new THREE.RingGeometry(this.TORUS_RADIUS - 1, this.TORUS_RADIUS + 1, 10);
        circleForRotationMaterial.side = THREE.DoubleSide;
        this.circleForRotationMesh = new THREE.Mesh(circleForRotationGeometry, circleForRotationMaterial);
        this.circleForRotationMesh.visible = false;

        this.xArrow.position.setX(this.ARROW_SIZE / 2);
        this.yArrow.position.setY(this.ARROW_SIZE / 2);
        this.zArrow.position.setZ(this.ARROW_SIZE / 2);

        const xArrowPosition = new THREE.Vector3().copy(center);
        xArrowPosition.setX(xArrowPosition.x + this.ARROW_SIZE / 2);

        const yArrowPosition = new THREE.Vector3().copy(center);
        yArrowPosition.setY(yArrowPosition.y + this.ARROW_SIZE / 2);

        const zArrowPosition = new THREE.Vector3().copy(center);
        zArrowPosition.setZ(zArrowPosition.z + this.ARROW_SIZE / 2);

        this.xArrow.position.copy(xArrowPosition);
        this.yArrow.position.copy(yArrowPosition);
        this.zArrow.position.copy(zArrowPosition);

        this.xTorus.position.copy(center);
        this.yTorus.position.copy(center);
        this.zTorus.position.copy(center);

        this.triadContainer = new THREE.Group();
        this.triadContainer.position.copy(worldModelPosition);
        this.triadContainer.add(this.model, this.xArrow, this.yArrow, this.zArrow, this.xTorus, this.yTorus, this.zTorus);
        this.scene.add(this.triadContainer);
    }

    isModelWithTriad(object) {
        if (!this.triadContainer) {
            return null;
        }
        if (object.uuid === this.triadContainer.uuid) {
            return object;
        } else if (object.parent) {
            return this.isModelWithTriad(object.parent);
        } else {
            return null;
        }
    }

    removeTriadFromModel() {
        this.model.getWorldPosition(this.model.position);
        this.scene.add(this.model);
        this.triadContainer.clear();
        this.triadContainer = null;
        this.model = null;
    }

    handleXArrowMove(event) {
        this.mouseLeftMovePosition = getMousePosition(this.domElement, event);

        const directionVector = getDirectionVector(this.camera.position, this.triadContainer.position);
        const length = directionVector.length();
        const deltaX = (this.mouseLeftMovePosition.x - this.mouseLeftClickPosition.x) * length;
        directionVector.normalize();
        const cameraRight = getRightVector(directionVector, THREE.Camera.DefaultUp);

        this.triadContainer.position.setX(this.triadContainer.position.x + cameraRight.x * deltaX);
        this.mouseLeftClickPosition.copy(this.mouseLeftMovePosition);
    }

    handleYArrowMove(event) {
        this.mouseLeftMovePosition = getMousePosition(this.domElement, event);

        const directionVector = getDirectionVector(this.camera.position, this.triadContainer.position);
        const length = directionVector.length();
        const deltaY = (this.mouseLeftMovePosition.y - this.mouseLeftClickPosition.y) * length;
        directionVector.normalize();
        const cameraRight = getRightVector(directionVector, THREE.Camera.DefaultUp);
        const cameraUp = getUpVector(directionVector, cameraRight);

        this.triadContainer.position.setY(this.triadContainer.position.y + cameraUp.y * deltaY);
        this.mouseLeftClickPosition.copy(this.mouseLeftMovePosition);
    }

    handleZArrowMove(event) {
        this.mouseLeftMovePosition = getMousePosition(this.domElement, event);

        const directionVector = getDirectionVector(this.camera.position, this.triadContainer.position);
        const length = directionVector.length();
        const deltaZ = (this.mouseLeftMovePosition.x - this.mouseLeftClickPosition.x) * length;
        directionVector.normalize();
        const cameraRight = getRightVector(directionVector, THREE.Camera.DefaultUp);


        this.triadContainer.position.setZ(this.triadContainer.position.z + cameraRight.z * deltaZ);
        this.mouseLeftClickPosition.copy(this.mouseLeftMovePosition);
    }

    handleRotation(event) {
        this.mouseLeftMovePosition = getMousePosition(this.domElement, event);
        this.raycaster.setFromCamera(this.mouseLeftMovePosition, this.camera);
        const intersects = this.raycaster.intersectObject(this.currentRotationAxisObject);
        if (intersects.length < 1) {
            return;
        }
        this.movedIntersectPoint = this.currentRotationAxisObject.worldToLocal(intersects.shift().point);
        const crossProduct = new THREE.Vector3().crossVectors(this.clickedIntersectPoint, this.movedIntersectPoint);

        let angle = this.clickedIntersectPoint.angleTo(this.movedIntersectPoint);
        if (crossProduct.z < 0) {
            angle = angle * -1;
        }

        switch (this.currentRotationAxisObject.name) {
        case this.X_TORUS_NAME: {
            const rotationMarix = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(1, 0, 0), angle);
            this.model.applyMatrix4(rotationMarix);
            break;
        }
        case this.Y_TORUS_NAME: {
            const rotationMarix = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 1, 0), -angle);
            this.model.applyMatrix4(rotationMarix);
            break;
        }
        case this.Z_TORUS_NAME: {
            const rotationMarix = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 0, 1), angle);
            this.model.applyMatrix4(rotationMarix);
        }
        }

        this.clickedIntersectPoint.copy(this.movedIntersectPoint);
    }
}
