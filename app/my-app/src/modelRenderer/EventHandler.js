
export class EventHandler {

    constructor(domElement, orbitControll, triadControl, meshCutter) {
        this.domElement = domElement;
        this.orbitControll = orbitControll;
        this.triadControl = triadControl;
        this.meshCutter = meshCutter;

        const onPointerDown = (event) => {
            this.domElement.setPointerCapture(event.pointerId);
            this.domElement.addEventListener('pointerup', onPointerUp);
            this.orbitControll.handleClick(event);
            this.triadControl.handleClick(event);

            // when mouse right click
            if (event.which === 3) {
                this.pointerMoveEvent = this.orbitControll.handlePanTransformation;
            } else {
                const triadHandler = triadControl.getTriadHandler(event);
                if (triadHandler) {
                    this.pointerMoveEvent = triadHandler;
                } else {
                    this.pointerMoveEvent = this.orbitControll.handleOrbitMotion;
                }
            }
            this.domElement.addEventListener('pointermove', this.pointerMoveEvent);
        };

        const onPointerUp = (event) => {
            this.domElement.releasePointerCapture(event.pointerId);
            this.domElement.removeEventListener('pointerup', onPointerUp);
            this.domElement.removeEventListener('pointermove', this.pointerMoveEvent);
        };

        this.domElement.addEventListener('dblclick', (event) => {
            event.preventDefault();
            this.triadControl.handleDoubleClick(event);
            if (window.getSelection)
                window.getSelection().removeAllRanges();
            else if (this.domElement.selection)
                this.domElement.selection.empty();
        });

        this.domElement.addEventListener('pointerdown', onPointerDown);

        this.domElement.addEventListener('keyup',  orbitControll.handleDefaultCameraPositions);

        this.domElement.addEventListener('contextmenu', (event) => {
            event.preventDefault();
        });

        this.domElement.addEventListener('wheel', orbitControll.handleZoom);
    }

    async deleteModel() {
        this.triadControl.deleteModelFromScene();
    }

    async cutModel() {
        this.meshCutter.cutByPlane(this.triadControl.model);
    }

    async addPlaneToScene() {
        this.meshCutter.addPlaneToScene();
    }

}
