
import 'regenerator-runtime/runtime';

import modelHatXMas from '../../mediapipe/models/hat/hat-2.glb';
import modelGlasses from '../../mediapipe/models/glass/scene.gltf';
import FaceMeshFeaturev1 from '../components/faceMeshFeaturev1';

const materialsEffect = [
    {
        type: "3d",
        src: modelHatXMas,
        name: "hat",
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
        this.loadDone = false;
        this.calcSizeCanvas();
        this.init();
    }
    init() {
        this.initFaceMesh1();
        this.eventLoadedVideo();
    }
    calcSizeCanvas(){
        this.sizeVideoOutPut = {
            height : 1920,
            width : 1080
        };
        if(window.innerWidth < 1180){
            const wrapper = document.getElementById("sparkArWrapper");
            let multiWidth = Math.floor(this.sizeVideoOutPut.width / wrapper.offsetWidth);
            let multiHeight = Math.floor(this.sizeVideoOutPut.height / wrapper.offsetHeight);
            this.sizeVideoOutPut.width = multiWidth* wrapper.offsetWidth;
            this.sizeVideoOutPut.height = multiHeight* wrapper.offsetHeight;
        }
        
    }
    initFaceMesh1() {
        this.faceMesh1 = new FaceMeshFeaturev1({
            size: {
                width: this.sizeVideoOutPut.width,
                height: this.sizeVideoOutPut.height
            },
            canvasElm : document.getElementById("canvas-output"),
            inputTracking : null ,//document.getElementById("video-test"),
            afterLoadedAllEventName : "loadedAllMaterial1",
            updateCallback : this.renderEffect.bind(this),
        });
        this.faceMesh1.pickEffect("mask-tiger");
        this.faceMesh1.loadTextures(materialsEffect);
        this.listenerEventLoadedAll();
    }
    listenerEventLoadedAll(){
        document.addEventListener("loadedAllMaterial1", () => {
            this.hiddenLoadingScene();
            this.eventPlayEffect();
        });
    }
    hiddenLoadingScene(){
        this.loadDone = true;
        this.loadingElm1 = document.getElementById("loading1");
        this.loadingElm1.classList.remove("active");
        document.removeEventListener("loadedAllMaterial1", this.hiddenLoadingScene, false);
    }
    eventLoadedVideo(){
        const vid = document.getElementById("video-test");
        vid.addEventListener("loadedmetadata", (e) => {
            this.faceMesh1.setInputTracking(vid, "VIDEO");
            this.faceMesh1.setBg();
            //vid.play();
        });
        vid.addEventListener("ended", () => {
            this.faceMesh1.isStop = true;
        })
    }
    eventPlayEffect(){
        this.faceMesh1.sendFrames();
    }
    renderEffect(){
        if(!this.loadDone) return false;
        this.faceMesh1.removeEffects();
        this.faceMesh1.addEffects();
    }
}