import * as THREE from 'three';
import * as Constants from '../constants/Constants';
import { SUPPORTED_MODEL_EXTENSIONS } from '../constants/SystemConstants';
import { getDirectionVector } from './helpers';

export class MeshCutter {
    raycaster = new THREE.Raycaster();
    isPlaneOnScene = false;
    plane = null;

    constructor(domElement, camera, scene, triadControl) {
        this.domElement = domElement;
        this.camera = camera;
        this.scene = scene;
        this.triadControl = triadControl;
    }

    addPlaneToScene() {
        this.isPlaneOnScene = !this.isPlaneOnScene;
        if (this.isPlaneOnScene) {
            const planeGeometry = new THREE.PlaneBufferGeometry(10, 10);
            const planeMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide});

            const points = [];
            points.push( new THREE.Vector3( 0, 0, 0 ));
            points.push( new THREE.Vector3( 0, 0, 1));

            const material = new THREE.LineBasicMaterial({
                color: 0x0000ff
            });
            const geometry = new THREE.BufferGeometry().setFromPoints( points );
            const line = new THREE.Line( geometry, material );

            planeMaterial.transparent = true;
            planeMaterial.opacity = 0.5;
            this.plane = new THREE.Mesh(planeGeometry, planeMaterial);
            this.plane.add(line);
            this.plane.userData.isModelControllable = true;
            this.plane.position.y = 5;
            this.plane.rotateX(-Math.PI / 2);
            this.scene.add(this.plane);
        } else {
            if (this.plane === this.triadControl.model) {
                this.triadControl.deleteModelFromScene();
            } else {
                this.scene.remove(this.plane);
            }
        }
    }

    cutByPlane(model) {
        if (!this.isPlaneOnScene) {
            throw new Error(Constants.PLANE_NOT_AT_SCENE_ERROR_MESSAGE);
        }
        if (!model || model === this.plane) {
            throw new Error(Constants.MODEL_NOT_SELECTED_ERROR_MESSAGE);
        } else if (model.userData.modelType !== SUPPORTED_MODEL_EXTENSIONS.OBJ && model.userData.modelType !== SUPPORTED_MODEL_EXTENSIONS.STL) {
            console.log(model.userData.modelType);
            console.log(SUPPORTED_MODEL_EXTENSIONS.OBJ);
            console.log(model.userData.modelType !== SUPPORTED_MODEL_EXTENSIONS.STL);
            console.log(model.userData.modelType !== SUPPORTED_MODEL_EXTENSIONS.OBJ);
            throw new Error(Constants.MODEL_NOT_SUPPORTED_FOR_CUTTING_ERROR_MESSAGE);
        }

        const planeNormal = new THREE.Vector3(0, 0, 1);
        planeNormal.applyEuler(this.plane.rotation);

        //get mesh from model
        let mesh = model;
        while (mesh.type !== 'Mesh') {
            mesh = mesh.children[0];
        }

        //update model geometry and then transform plane to local space of model
        const updatedGeometry =  mesh.geometry.clone().applyMatrix4(model.matrix);
        const planePoint = new THREE.Vector3().copy(this.plane.position);
        mesh.worldToLocal(planePoint);
        planePoint.applyMatrix4(model.matrix);

        //model polygons
        const vertex = updatedGeometry.attributes.position.array;
        const normal = updatedGeometry.attributes.normal.array;

        const forwardVertex = [];
        const forwardNormal = [];

        const backwardVertex = [];
        const backwardNormal = [];

        for (let i = 0; i < vertex.length; i+=9) {
            const trianglePointA = new THREE.Vector3(vertex[i], vertex[i+1], vertex[i+2]);
            const trianglePointB = new THREE.Vector3(vertex[i+3], vertex[i+4], vertex[i+5]);
            const trianglePointC = new THREE.Vector3(vertex[i+6], vertex[i+7], vertex[i+8]);
            const pointsPosition = this.getPointsLocation(planeNormal, planePoint, trianglePointA, trianglePointB, trianglePointC);

            switch (pointsPosition) {
            case '111' : {
                forwardVertex.push(...vertex.slice(i, i+9));
                forwardNormal.push(...normal.slice(i, i+9));
                break;
            }
            case '110': {
                const intersectionPointD = this.getPlaneIntersectionPoint(trianglePointA, trianglePointC, planeNormal, planePoint);
                const intersectionPointE = this.getPlaneIntersectionPoint(trianglePointB, trianglePointC, planeNormal, planePoint);
                forwardVertex.push(...trianglePointA.toArray());
                forwardVertex.push(...intersectionPointD.toArray());
                forwardVertex.push(...trianglePointB.toArray());

                forwardVertex.push(...trianglePointB.toArray());
                forwardVertex.push(...intersectionPointD.toArray());
                forwardVertex.push(...intersectionPointE.toArray());


                backwardVertex.push(...trianglePointC.toArray());
                backwardVertex.push(...intersectionPointD.toArray());
                backwardVertex.push(...intersectionPointE.toArray());

                //calculate new vertex normals
                const normalADB = this.getPlaneNormal(trianglePointA, intersectionPointD, trianglePointB);
                const normalBDE = this.getPlaneNormal(trianglePointB, intersectionPointD, intersectionPointE);
                const normalCDE = this.getPlaneNormal(trianglePointC, intersectionPointD, intersectionPointE);

                forwardNormal.push(...normalADB, ...normalADB, ...normalADB);
                forwardNormal.push(...normalBDE, ...normalBDE, ...normalBDE);
                backwardNormal.push(...normalCDE, ...normalCDE, ...normalCDE);
                break;
            }
            case '101' : {
                const intersectionPointD = this.getPlaneIntersectionPoint(trianglePointA, trianglePointB, planeNormal, planePoint);
                const intersectionPointE = this.getPlaneIntersectionPoint(trianglePointC, trianglePointB, planeNormal, planePoint);
                forwardVertex.push(...trianglePointA.toArray());
                forwardVertex.push(...intersectionPointD.toArray());
                forwardVertex.push(...trianglePointC.toArray());

                forwardVertex.push(...trianglePointC.toArray());
                forwardVertex.push(...intersectionPointD.toArray());
                forwardVertex.push(...intersectionPointE.toArray());

                backwardVertex.push(...trianglePointB.toArray());
                backwardVertex.push(...intersectionPointD.toArray());
                backwardVertex.push(...intersectionPointE.toArray());

                //calculate new vertex normals
                const normalADC = this.getPlaneNormal(trianglePointA, intersectionPointD, trianglePointC);
                const normalCDE = this.getPlaneNormal(trianglePointC, intersectionPointD, intersectionPointE);
                const normalBDE = this.getPlaneNormal(trianglePointB, intersectionPointD, intersectionPointE);

                forwardNormal.push(...normalADC, ...normalADC, ...normalADC);
                forwardNormal.push(...normalCDE, ...normalCDE, ...normalCDE);
                backwardNormal.push(...normalBDE, ...normalBDE, ...normalBDE);

                break;
            }
            case '100': {
                const intersectionPointD = this.getPlaneIntersectionPoint(trianglePointA, trianglePointB, planeNormal, planePoint);
                const intersectionPointE = this.getPlaneIntersectionPoint(trianglePointA, trianglePointC, planeNormal, planePoint);

                forwardVertex.push(...trianglePointA.toArray());
                forwardVertex.push(...intersectionPointD.toArray());
                forwardVertex.push(...intersectionPointE.toArray());


                backwardVertex.push(...trianglePointB.toArray());
                backwardVertex.push(...intersectionPointD.toArray());
                backwardVertex.push(...intersectionPointE.toArray());

                backwardVertex.push(...trianglePointC.toArray());
                backwardVertex.push(...trianglePointB.toArray());
                backwardVertex.push(...intersectionPointE.toArray());

                //calculate new vertex normals
                const normalADE = this.getPlaneNormal(trianglePointA, intersectionPointD, intersectionPointE);
                const normalBDE = this.getPlaneNormal(trianglePointB, intersectionPointD, intersectionPointE);
                const normalCBE = this.getPlaneNormal(trianglePointC, trianglePointB, intersectionPointE);

                forwardNormal.push(...normalADE, ...normalADE, ...normalADE);
                backwardNormal.push(...normalBDE, ...normalBDE, ...normalBDE);
                backwardNormal.push(...normalCBE, ...normalCBE, ...normalCBE);
                break;
            }
            case '011': {
                const intersectionPointD = this.getPlaneIntersectionPoint(trianglePointB, trianglePointA, planeNormal, planePoint);
                const intersectionPointE = this.getPlaneIntersectionPoint(trianglePointC, trianglePointA, planeNormal, planePoint);

                forwardVertex.push(...trianglePointB.toArray());
                forwardVertex.push(...intersectionPointD.toArray());
                forwardVertex.push(...trianglePointC.toArray());

                forwardVertex.push(...trianglePointC.toArray());
                forwardVertex.push(...intersectionPointD.toArray());
                forwardVertex.push(...intersectionPointE.toArray());

                backwardVertex.push(...trianglePointA.toArray());
                backwardVertex.push(...intersectionPointD.toArray());
                backwardVertex.push(...intersectionPointE.toArray());

                //calculate new vertex normals
                const normalBDC = this.getPlaneNormal(trianglePointB, intersectionPointD, trianglePointC);
                const normalCDE = this.getPlaneNormal(trianglePointC, intersectionPointD, intersectionPointE);
                const normalADE = this.getPlaneNormal(trianglePointA, intersectionPointD, intersectionPointE);

                forwardNormal.push(...normalBDC, ...normalBDC, ...normalBDC);
                forwardNormal.push(...normalCDE, ...normalCDE, ...normalCDE);
                backwardNormal.push(...normalADE, ...normalADE, ...normalADE);

                break;
            }
            case '010': {
                const intersectionPointD = this.getPlaneIntersectionPoint(trianglePointB, trianglePointA, planeNormal, planePoint);
                const intersectionPointE = this.getPlaneIntersectionPoint(trianglePointB, trianglePointC, planeNormal, planePoint);

                forwardVertex.push(...trianglePointB.toArray());
                forwardVertex.push(...intersectionPointD.toArray());
                forwardVertex.push(...intersectionPointE.toArray());

                backwardVertex.push(...trianglePointA.toArray());
                backwardVertex.push(...intersectionPointD.toArray());
                backwardVertex.push(...intersectionPointE.toArray());

                backwardVertex.push(...trianglePointC.toArray());
                backwardVertex.push(...trianglePointA.toArray());
                backwardVertex.push(...intersectionPointE.toArray());

                //calculate new vertex normals
                const normalBDE = this.getPlaneNormal(trianglePointB, intersectionPointD, intersectionPointE);
                const normalADE = this.getPlaneNormal(trianglePointA, intersectionPointD, intersectionPointE);
                const normalCAE = this.getPlaneNormal(trianglePointC, trianglePointA, intersectionPointE);

                forwardNormal.push(...normalBDE, ...normalBDE, ...normalBDE);
                backwardNormal.push(...normalADE, ...normalADE, ...normalADE);
                backwardNormal.push(...normalCAE, ...normalCAE, ...normalCAE);

                break;
            }
            case '001': {
                const intersectionPointD = this.getPlaneIntersectionPoint(trianglePointC, trianglePointA, planeNormal, planePoint);
                const intersectionPointE = this.getPlaneIntersectionPoint(trianglePointC, trianglePointB, planeNormal, planePoint);

                forwardVertex.push(...trianglePointC.toArray());
                forwardVertex.push(...intersectionPointD.toArray());
                forwardVertex.push(...intersectionPointE.toArray());

                backwardVertex.push(...trianglePointA.toArray());
                backwardVertex.push(...intersectionPointD.toArray());
                backwardVertex.push(...intersectionPointE.toArray());

                backwardVertex.push(...trianglePointA.toArray());
                backwardVertex.push(...trianglePointB.toArray());
                backwardVertex.push(...intersectionPointE.toArray());

                //calculate new vertex normals
                const normalCDE = this.getPlaneNormal(trianglePointC, intersectionPointD, intersectionPointE);
                const normalADE = this.getPlaneNormal(trianglePointA, intersectionPointD, intersectionPointE);
                const normalABE = this.getPlaneNormal(trianglePointA, trianglePointB, intersectionPointE);

                forwardNormal.push(...normalCDE, ...normalCDE, ...normalCDE);
                backwardNormal.push(...normalADE, ...normalADE, ...normalADE);
                backwardNormal.push(...normalABE, ...normalABE, ...normalABE);
                break;
            }
            case '000': {
                backwardVertex.push(...vertex.slice(i, i+9));
                backwardNormal.push(...normal.slice(i, i+9));
                break;
            }
            }
        }

        //create new objects from buffer geometry
        const backwardMesh = this.makeNewMesh(backwardVertex, backwardNormal);
        const forwardMesh = this.makeNewMesh(forwardVertex, forwardNormal);

        const worldPosition = new THREE.Vector3();
        model.getWorldPosition(worldPosition);
        backwardMesh.position.set(10, 0, 0).add(worldPosition);
        forwardMesh.position.set(-10, 0, 0).add(worldPosition);

        backwardMesh.userData = model.userData;
        forwardMesh.userData = model.userData;

        this.scene.add(forwardMesh, backwardMesh);
    }

    getPointsLocation(normal, planePoint, ...points) {
        const pointsPosition = points
            .map((point) => new THREE.Vector3().subVectors(point, planePoint))
            .map(directionVector => directionVector.dot(normal))
            .map(dot => dot >= 0 ? 1 : 0); //if dot < 0 point from right side of plane, > 0 from left side
        return pointsPosition.join('');
    }

    getPlaneNormal(pointA, pointB, pointC) {
        const vectorBA = getDirectionVector(pointB, pointA);
        const vectorCA = getDirectionVector(pointC, pointA);
        const normal = new THREE.Vector3().crossVectors(vectorBA, vectorCA);
        return normal;
    }

    getPlaneIntersectionPoint(point1, point2, planeNormal, planePoint) {
        const lineDirection = getDirectionVector(point2, point1);
        const dot = lineDirection.dot(planeNormal);
        const p0l0 = new THREE.Vector3().subVectors(point1, planePoint);
        if (Math.abs(dot) > 1e-5) {
            const t = -planeNormal.dot(p0l0) / dot;
            const u =  new THREE.Vector3().copy(lineDirection).multiplyScalar(t);
            return  new THREE.Vector3().copy(point1).add(u);
        }
    }

    makeNewMesh(position, normal) {
        const geometry = new THREE.BufferGeometry();
        const positionNumComponents = 3;
        const normalNumComponents = 3;
        geometry.setAttribute(
            'position',
            new THREE.BufferAttribute(new Float32Array(position), positionNumComponents));
        geometry.setAttribute(
            'normal',
            new THREE.BufferAttribute(new Float32Array(normal), normalNumComponents));


        const material = new THREE.MeshPhongMaterial();
        material.side = THREE.DoubleSide;
        const mesh = new THREE.Mesh(geometry, material);
        const newObject = new THREE.Object3D();
        newObject.add(mesh);
        return newObject;
    }

}
