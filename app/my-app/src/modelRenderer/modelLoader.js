import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { MODEL_FILE_NOT_SUPPORTED_ERROR_MESSAGE } from '../constants/Constants';
import { SUPPORTED_MODEL_EXTENSIONS } from '../constants/SystemConstants';

const objLoader = new OBJLoader();
const stlLoader = new STLLoader();
const gltfLoader = new GLTFLoader();

export default async function loadModel(modelFile) {
    return new Promise((resolve, reject) => {
        switch (modelFile.extension) {
        case SUPPORTED_MODEL_EXTENSIONS.OBJ: {
            const decoder = new TextDecoder('utf-8');
            const textFile = decoder.decode(modelFile.file);
            resolve(objLoader.parse(textFile));
            break;
        }
        case SUPPORTED_MODEL_EXTENSIONS.STL: {
            const geometry = stlLoader.parse(modelFile.file);
            const material = new THREE.MeshStandardMaterial();
            resolve(new THREE.Mesh(geometry, material));
            break;
        }
        case SUPPORTED_MODEL_EXTENSIONS.GLB: {
            gltfLoader.parse(modelFile.file, null, (model) => {
                resolve(model.scene);
            });
            break;
        }
        case SUPPORTED_MODEL_EXTENSIONS.GLTF: {
            gltfLoader.parse(modelFile.file, null, (model) => {
                resolve(model.scene);
            });
            break;
        }
        default: reject(new Error(MODEL_FILE_NOT_SUPPORTED_ERROR_MESSAGE));
        }
    }).then(model => { //align and scale model
        const object3D = new THREE.Object3D();
        object3D.userData.isModelControllable = true;
        object3D.userData.modelType = modelFile.extension;
        object3D.add(model);
        let boundingBox = new THREE.Box3().setFromObject(object3D);
        //scale object3D
        const size = new THREE.Vector3();
        boundingBox.getSize(size);
        const scaleVec = new THREE.Vector3(5, 5, 5).divide(size);
        const scale = Math.max(scaleVec.x, Math.max(scaleVec.y, scaleVec.z));
        object3D.scale.setScalar(scale);

        //center object3D
        boundingBox = new THREE.Box3().setFromObject(object3D);
        const center = boundingBox.getCenter(new THREE.Vector3());
        object3D.position.x += (object3D.position.x - center.x);
        object3D.position.y += (object3D.position.y - center.y);
        object3D.position.z += (object3D.position.z - center.z);

        //place object3D on grid
        boundingBox = new THREE.Box3().setFromObject(object3D);
        const height = Math.abs(boundingBox.max.y) + Math.abs(boundingBox.min.y);
        object3D.position.y += height / 2;

        return object3D;
    });
}
