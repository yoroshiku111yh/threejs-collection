
import 'regenerator-runtime/runtime';
import { transformLandmarks } from '../helpers/landmarksHelper';
import SceneBase from '../components/sceneBase';
import PlaneMask2d from './../components/planeMask2d';
import PlaneText from '../components/planeText';

const typeInput = {
    img: "IMAGE",
    video: "VIDEO"
}

export default class MediaPipeFace {
    constructor() {
        this.inputImage = document.getElementById("mediapipe-image-input");
        this.inputVideo = document.getElementById("mediapipe-vid-input");
        this.inputTextImg1 = document.getElementById("mediapipe-text-1");
        this.inputTextImg2 = document.getElementById("mediapipe-text-2");
        this.outputCanvas = document.getElementById("mediapipe-output");
        this.inputFacePlaceHolder = document.getElementById("mediapipe-face-place-holder");
        this.typeInput = typeInput.video;
        this.facesPlaneMask2d = [];
        this.arFaceLandmarks = [];
        this.pickedEffect = false;
        this.time = 0;
        this.isDetectFace = false;
        this.startGame = false;
        this.choiceEffect = 1;
        this.singlePlayer = false;
        this.maxFaces = this.singlePlayer ? 1 : 3;
        this.typeEffect = [
            "MASK_TIGER",
            "HAT"
        ]
        this.initFaceMesh();
        this.init();
    }
    init() {
        this.hiddenOtherType();
        this.mainScene = new SceneBase({
            canvasElm: this.outputCanvas,
            typeTex: this.typeInput,
            callbackAnimate: () => { this.updateAnimateScene() }
        });
        this.createPlaneText();
        switch (this.typeInput) {
            case typeInput.img:
                this.initScanInImage();
                break;
            case typeInput.video:
                this.initScaneInVideo();
                break;
        };
    }
    updateAnimateScene() {
        if (this.pickedEffect) {
            this.planeText.hide();
        }
        this.planeText.update();
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
            maxNumFaces: this.maxFaces,
            refineLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        this.faceMesh.onResults(this.onResults.bind(this));
    }
    onResults(results) {
        if (results.multiFaceLandmarks) {
            this.removeFacesMask();
            for (const landmarks of results.multiFaceLandmarks) {
                const faceLandmarks = transformLandmarks(landmarks);
                this.arFaceLandmarks.push(faceLandmarks);
                this.gameBoxRandomPick();
                if (!this.singlePlayer) {
                    this.addMask2d(faceLandmarks);
                }
            }
            this.modifiedPlaneText(transformLandmarks(results.multiFaceLandmarks[0]));
        }
    }
    gameBoxRandomPick() {
        if (!this.singlePlayer) return;
        this.randomChoiceText();
        if (this.mainScene.typeTex === typeInput.video) {
            this.pickEffect();
        }
    }
    pickEffect() {
        if (this.pickedEffect) {
            switch (this.typeEffect[Number(this.choiceEffect)]) {
                case "HAT":
                    for (let i = 0; i < this.arFaceLandmarks.length; i++) {
                        const faceLandmarks = this.arFaceLandmarks[i];
                        this.addMask2d(faceLandmarks);
                    }
                    break;
                case "MASK_TIGER":
                    for (let i = 0; i < this.arFaceLandmarks.length; i++) {
                        const faceLandmarks = this.arFaceLandmarks[i];
                        this.addMask2d(faceLandmarks);
                    }
                    break;
            }
        }
    }
    createPlaneText() {
        this.planeText = new PlaneText(this.mainScene.scene, this.mainScene.size);
        this.planeText.create();
        this.planeText.createText();
        this.planeText.setTextureText(this.inputTextImg2.src);
        this.planeText.addToScene();
    }
    randomChoiceText() {
        if (this.startGame) return;
        let choiceLeft = false;
        let countdown = 3000;
        let interval = setInterval(() => {
            if (countdown <= 0) {
                this.pickedEffect = true;
                this.pickEffect();
                clearInterval(interval);
                interval = null;
                return;
            }
            if (choiceLeft) {
                this.planeText.setTextureText(this.inputTextImg1.src);
            }
            else {
                this.planeText.setTextureText(this.inputTextImg2.src);
            }
            countdown -= 1000;
            choiceLeft = !choiceLeft
            this.choiceEffect = !this.choiceEffect;
        }, 500);
        this.startGame = true;
    }
    modifiedPlaneText(landmarks) {
        if (!this.planeText) return;
        if (!landmarks || !this.singlePlayer) {
            this.planeText.hide();
            return;
        }
        this.planeText.show();
        this.planeText.scalePlane(landmarks);
        this.planeText.setPosition(landmarks);
        this.planeText.rotationFollow(landmarks);
    }
    addMask2d(landmarks) {
        const mask = new PlaneMask2d(this.mainScene.scene, this.mainScene.size, landmarks);
        mask.setTexture(this.inputFacePlaceHolder.src);
        mask.createPlane();
        this.facesPlaneMask2d.push(mask);
    }
    removeFacesMask() {
        if (this.facesPlaneMask2d.length === 0) return;
        for (let i = 0; i < this.facesPlaneMask2d.length; i++) {
            this.facesPlaneMask2d[i].removePlane();
        }
        this.facesPlaneMask2d = [];
        this.arFaceLandmarks = [];
    }
}
