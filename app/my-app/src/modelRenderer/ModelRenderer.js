import loadModel from './modelLoader.js';
import * as THREE from 'three';
import { OrbitControl } from './OrbitControl.js';
import { TriadControl } from './TriadControl.js';
import { EventHandler } from './EventHandler.js';
import { MeshCutter } from './MeshCutter.js';

const cameraFov = 75;
const cameraAspect = 1;
const cameraNear = 0.1;
const cameraFar = 200;
const gridSize = 40;

class ModelRenderer {
    //modelFile param contains file and extension
    constructor(canvas, modelFile) {
        this.canvas = canvas;
        this.modelFile = modelFile;
        this.camera = new THREE.PerspectiveCamera(
            cameraFov,
            cameraAspect,
            cameraNear,
            cameraFar,
        );

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1f3f3f);
        const gridHelper = new THREE.GridHelper(gridSize, gridSize);
        this.scene.add(gridHelper);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvas });

        const light = new THREE.PointLight(0xffffff, 1);
        light.position.set(0, 10, 10);
        this.scene.add(light);

        this.orbitControl = new OrbitControl(this.camera, this.canvas, this.scene);

        this.triadControl = new TriadControl(this.canvas, this.camera, this.scene);
        this.meshCutter = new MeshCutter(this.canvas, this.camera, this.scene, this.triadControl);
        this.eventHandler = new EventHandler(this.canvas, this.orbitControl, this.triadControl, this.meshCutter);

        this.setSize();
        window.addEventListener('resize', () => {
            this.setSize();
            this.render();
        });
    }

    setSize() {
        this.camera.aspect = this.canvas.clientWidth / this.canvas.clientHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight, false);
        this.renderer.setPixelRatio(window.devicePixelRatio);
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    start() {
        loadModel(this.modelFile)
            .then((model) => {
                this.orbitControl.setViewingModel(model);
                this.scene.add(model);
            });
        this.renderer.setAnimationLoop(() => {
            this.renderer.render(this.scene, this.camera);
        });
    }

    stop() {
        this.renderer.setAnimationLoop(null);
        this.renderer.forceContextLoss();
        this.renderer.dispose();
    }
}

export { ModelRenderer };
