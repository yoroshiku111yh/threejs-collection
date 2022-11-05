
import 'regenerator-runtime/runtime';
import { transformLandmarks } from '../helpers/landmarksHelper';
import SceneBase from '../components/sceneBase';
import PlaneMask2d from './../components/planeMask2d';
import PlaneText from '../components/planeText';

const typeInput = {
    img : "IMAGE",
    video : "VIDEO"
}

export default class MediaPipeFace {
    constructor() {
        this.inputImage = document.getElementById("mediapipe-image-input");
        this.inputVideo = document.getElementById("mediapipe-vid-input");
        this.outputCanvas = document.getElementById("mediapipe-output");
        this.inputFacePlaceHolder = document.getElementById("mediapipe-face-place-holder");
        this.typeInput = typeInput.img;
        this.facesPlaneMask2d = [];
        this.time = 0;
        this.initFaceMesh();
        this.init();
    }
    init() {
        this.hiddenOtherType();
        this.mainScene = new SceneBase({
            canvasElm : this.outputCanvas,
            typeTex : this.typeInput,
            callbackAnimate : () => {}
        });
        switch (this.typeInput) {
            case typeInput.img:
                this.initScanInImage();
                break;
            case typeInput.video:
                this.initScaneInVideo();
                break;
        };
        this.createPlaneText();

    }
    hiddenOtherType() {
        this.inputImage.parentNode.classList.remove("active");
        this.inputVideo.parentNode.classList.remove("active");
        switch (this.typeInput) {
            case typeInput.img:
                this.inputImage.parentNode.classList.add("active");
                break;
            case typeInput.video:
                this.inputVideo.parentNode.classList.add("active");
                break;
        }
    }
    initScanInImage() {
        this.mainScene.setSize(this.inputImage.width, this.inputImage.height);
        this.mainScene.init();
        this.mainScene.bg.setTexture(this.inputImage.src);
        this.faceMesh.send({
            image: this.inputImage
        });
    }
    initScaneInVideo() {
        this.loadVideo((video) => {
            this.mainScene.setSize(video.videoWidth, video.videoHeight);
            this.mainScene.init();
            this.mainScene.bg.setTexture(video);
        });
        this.eventPlayVideo();
    }
    async getFrameVideo() {
        const video = this.inputVideo;
        if (video.ended || video.paused) return;
        await this.faceMesh.send({
            image: video
        });
        await new Promise(requestAnimationFrame);
        this.getFrameVideo();
    }
    eventPlayVideo() {
        this.inputVideo.addEventListener("play", () => {
            this.getFrameVideo();
        })
    }
    loadVideo(callback) {
        this.inputVideo.addEventListener("loadedmetadata", (e) => {
            const $this = e.target;
            callback && callback($this);
        })
    }
    initFaceMesh() {
        this.faceMesh = new FaceMesh({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
            }
        });

        this.faceMesh.setOptions({
            maxNumFaces: 3,
            refineLandmarks: true,
            minDetectionConfidence: 0.35,
            minTrackingConfidence: 0.35
        });

        this.faceMesh.onResults(this.onResults.bind(this));
    }
    onResults(results) {
        if (results.multiFaceLandmarks) {
            this.removeFacesMask();
            for (const landmarks of results.multiFaceLandmarks) {
                const faceLandmarks = transformLandmarks(landmarks);
                this.addMask2d(faceLandmarks);
            }
            this.modifiedPlaneText(transformLandmarks(results.multiFaceLandmarks[0]));
            this.renderFacesMask();
        }
    }
    createPlaneText(){
        this.planeText = new PlaneText(this.mainScene.scene, this.mainScene.size);
        this.planeText.create();
    }
    modifiedPlaneText(landmarks){
        if(!this.planeText) return;
        if(!landmarks){
            this.planeText.hide();
            return;
        }
        this.planeText.show();
        this.planeText.scalePlane(landmarks);
        this.planeText.setPosition(landmarks);
        this.planeText.rotationFollow(landmarks);
    }
    addMask2d(landmarks){
        const mask = new PlaneMask2d(this.mainScene.scene, this.mainScene.size, landmarks);
        mask.setTexture(this.inputFacePlaceHolder.src);
        this.facesPlaneMask2d.push(mask);
    }
    renderFacesMask() {
        for (let i = 0; i < this.facesPlaneMask2d.length; i++) {
            this.facesPlaneMask2d[i].createPlane();
        }
    }
    removeFacesMask() {
        if(this.facesPlaneMask2d.length === 0) return;
        for (let i = 0; i < this.facesPlaneMask2d.length; i++) {
            this.facesPlaneMask2d[i].removePlane();
        }
        this.facesPlaneMask2d = [];
    }
}
