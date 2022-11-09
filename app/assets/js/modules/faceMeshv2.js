
import 'regenerator-runtime/runtime';

import modelHatXMas from '../../mediapipe/models/hat/hat-2.glb';
import modelGlasses from '../../mediapipe/models/glass/scene.gltf';
import FaceMeshFeaturev1 from '../components/faceMeshFeaturev1';

const materialsEffect = [
    {
        type: "3d",
        src: modelHatXMas,
        name: "hat"
    },
    {
        type: "3d",
        src: modelGlasses,
        name: "glasses"
    },
    {
        type: "2d",
        src: document.getElementById("mediapipe-face-place-holder").src,
        name: "mask-tiger"
    }
]

export default class MediaPipeFace {
    constructor() {
        this.sizeVideoOutPut = {
            height : 1920,
            width : 1080
        }
        this.init();
    }
    init() {
        this.initFaceMesh1();
    }
    initFaceMesh1() {
        this.faceMesh1 = new FaceMeshFeaturev1({
            size: {
                width: this.sizeVideoOutPut.width,
                height: this.sizeVideoOutPut.height
            },
            canvasElm : document.getElementById("canvas-output"),
            inputTracking : document.getElementById("video-test"),
            afterLoadedAllEventName : "loadedAllMaterial1"
        });
        this.faceMesh1.loadTextures(materialsEffect);
        this.faceMesh1.setBg();
        this.listenerEventLoadedAll();
    }
    listenerEventLoadedAll(){
        document.addEventListener("loadedAllMaterial1", this.hiddenLoadingScene.bind(this));
    }
    hiddenLoadingScene(){
        this.loadingElm1 = document.getElementById("loading1");
        this.loadingElm1.classList.remove("active");
        document.removeEventListener("loadedAllMaterial1", this.hiddenLoadingScene, false);
    }
}