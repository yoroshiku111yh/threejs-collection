
import 'regenerator-runtime/runtime';

import FaceMeshFeaturev1 from '../components/faceMeshFeaturev1';
import { materialsEffectGlasses, materialsEffectHat, materialsEffectMask } from '../utils/variable/index';

export default class MediaPipeFace {
    constructor() {
        this.loadDone = false;
        this.calcSizeCanvas();
        this.init();
    }
    init() {
        this.listenerEventLoadedAll();
        this.initFaceMesh1();
        //this.accessWebcam();
        this.eventLoadedVideoSample();
    }
    calcSizeCanvas() {
        this.sizeVideoOutPut = {
            height: 1920,
            width: 1080
        };
        if (window.innerWidth < 1180) {
            const wrapper = document.getElementById("sparkArWrapper");
            let multiWidth = Math.floor(this.sizeVideoOutPut.width / wrapper.offsetWidth);
            let multiHeight = Math.floor(this.sizeVideoOutPut.height / wrapper.offsetHeight);
            this.sizeVideoOutPut.width = multiWidth * wrapper.offsetWidth;
            this.sizeVideoOutPut.height = multiHeight * wrapper.offsetHeight;
        }

    }
    initFaceMesh1() {
        this.faceMesh1 = new FaceMeshFeaturev1({
            size: {
                width: this.sizeVideoOutPut.width,
                height: this.sizeVideoOutPut.height
            },
            canvasElm: document.getElementById("canvas-output"),
            inputTracking: null,//document.getElementById("video-test"),
            afterLoadedAllEventName: "loadedAllMaterial1",
            updateCallback: this.renderEffect.bind(this),
        });
        this.selectEffect({
            name : "mask-tiger",
            resource : materialsEffectMask
        });
        // setTimeout(() => {
        //     this.selectEffect({
        //         name : "glasses",
        //         resource : materialsEffectGlasses
        //     });
        // },2000);
    }
    selectEffect({name, resource}){
        this.faceMesh1.pickEffect(name);
        this.faceMesh1.loadTextures(resource); 
    }
    listenerEventLoadedAll() {
        document.addEventListener("loadedAllMaterial1", () => {
            this.hiddenLoadingScene();
            this.eventPlayEffect();
        });
    }
    hiddenLoadingScene() {
        this.loadDone = true;
        this.loadingElm1 = document.getElementById("loading1");
        this.loadingElm1.classList.remove("active");
    }
    eventLoadedVideoSample() {
        const vid = document.getElementById("video-test");
        vid.addEventListener("loadedmetadata", (e) => {
            this.videoShow = vid;
            this.setInputTracking();
        });
        vid.addEventListener("ended", () => {
            this.faceMesh1.isStop = true;
        })
    }
    accessWebcam() {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            const constraints = {
                video: {
                    width: { ideal: 720 },
                    height: { ideal: 1280 },
                    facingMode: 'user'
                }
            };
            const video = document.createElement("video");
            video.setAttribute('autoplay', '');
            video.setAttribute('muted', '');
            video.setAttribute('playsinline', '');
            navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
                video.srcObject = stream;
                video.addEventListener("loadedmetadata", (e) => {
                    this.videoShow = video;
                    this.setInputTracking();
                });

            }).catch(function (error) {
                console.error('Unable to access the camera/webcam.', error);
            });

        } else {
            console.error('MediaDevices interface not available.');
        }
    }
    setInputTracking(){
        if(!this.videoShow) return;
        this.faceMesh1.setInputTracking(this.videoShow, "VIDEO");
        this.faceMesh1.setBg();
        this.videoShow.play();
        this.faceMesh1.sendFrames();
    }
    eventPlayEffect() {
        this.faceMesh1.createEffectLayers();
    }
    renderEffect() {
        if (!this.loadDone) return false;
        this.faceMesh1.hideEffects();
        this.faceMesh1.addEffects();
    }
}