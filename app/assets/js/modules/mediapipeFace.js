
import 'regenerator-runtime/runtime';
import { transformLandmarks } from '../helpers/landmarksHelper';
import SceneBase from '../components/sceneBase';
import PlaneMask2d from './../components/planeMask2d';
import PlaneText from '../components/planeText';
import FaceMeshMediapipe from '../components/faceMeshMediapipe';

import modelHatXMas from '../../mediapipe/models/hat/hat-2.glb';
import Object3dModel from './../components/obj3d';
import HatOnTheHead from '../components/hatOnTheHead';

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
        this.singlePlayer = true;
        this.facesPlaneMask2d = [];
        this.arFaceLandmarks = [];
        this.objectModels3dRendered = [];
        this.mask2dRendered = [];
        this.pickedEffect = false;
        this.time = 0;
        this.isDetectFace = false;
        this.startGame = false;
        this.isPlayGame = false;
        this.hatsPutted = [];
        this.maxFaces = this.singlePlayer ? 1 : 3;
        this.typeEffect = [
            "MASK_TIGER",
            "HAT"
        ];
        this.choiceEffect = this.typeEffect[0];
        this.faceMesh;
        this.trackingFaceMesh = new FaceMeshMediapipe(this.onResults.bind(this), {
            maxNumFaces: this.maxFaces
        });
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
        this.createModel3dCore(); /// we will need load all model before start game
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
        this.removeHats();
        this.removeFacesMask();
        if (!this.singlePlayer) {
            this.pickEffect();
        }
        else {
            if (this.isPlayGame) {
                this.gameBoxRandomPick();
                this.pickEffect();
            }
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
        this.trackingFaceMesh.faceMesh.send({
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
        await this.trackingFaceMesh.faceMesh.send({
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
            console.log("loadmetadata");
            const $this = e.target;
            callback && callback($this);
        })
    }
    onResults(results) {
        if (results.multiFaceLandmarks) {
            this.arFaceLandmarks = [];
            for (const landmarks of results.multiFaceLandmarks) {
                const faceLandmarks = transformLandmarks(landmarks);
                this.arFaceLandmarks.push(faceLandmarks);
                this.isPlayGame = true;
            }
            this.modifiedPlaneText(transformLandmarks(results.multiFaceLandmarks[0]));
        }
    }
    gameBoxRandomPick() {
        if (!this.singlePlayer) return;
        this.randomChoiceText();
    }
    pickEffect() {
        if (this.pickedEffect || !this.singlePlayer) {
            switch (this.choiceEffect) {
                case "HAT":
                    for (let i = 0; i < this.arFaceLandmarks.length; i++) {
                        const faceLandmarks = this.arFaceLandmarks[i];
                        this.putHatOnTheHead(this.objectModels3dRendered[0].cloneModel(), faceLandmarks);
                    }
                    break;
                case "MASK_TIGER":
                    for (let i = 0; i < this.arFaceLandmarks.length; i++) {
                        const faceLandmarks = this.arFaceLandmarks[i];
                        this.addMask2d(this.inputFacePlaceHolder.src, faceLandmarks);
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
        this.planeText.hide();
    }
    randomChoiceText() {
        if (this.startGame) return;
        let countdown = 3000;
        let pick = 0;
        let pickAr = [0, 1];
        let interval = setInterval(() => {
            if (countdown <= 0) {
                this.pickedEffect = true;
                clearInterval(interval);
                interval = null;
                return;
            }
            pick = pickAr.sort(() => 0.5 - Math.random())[0];
            this.choiceEffect = this.typeEffect[pick];
            if (this.choiceEffect === "MASK_TIGER") {
                this.planeText.setTextureText(this.inputTextImg1.src);
            }
            if ((this.choiceEffect === "HAT")) {
                this.planeText.setTextureText(this.inputTextImg2.src);
            }
            countdown -= 1000;
        }, 500);
        this.startGame = true;
    }
    modifiedPlaneText(landmarks) {
        if (!this.planeText) return;
        if (!landmarks || !this.singlePlayer || !this.isPlayGame) {
            this.planeText.hide();
            return;
        }
        this.planeText.show();
        this.planeText.scalePlane(landmarks);
        this.planeText.setPosition(landmarks);
        this.planeText.rotationFollow(landmarks);
    }

    addMask2d(texture, landmarks) {
        const mask = new PlaneMask2d(this.mainScene.scene, this.mainScene.size, landmarks);
        mask.setTexture(texture);
        mask.createPlane();
        this.facesPlaneMask2d.push(mask);
    }

    putHatOnTheHead(model, landmarks) {
        const hat = new HatOnTheHead({
            scene: this.mainScene.scene,
            sizeDimension: this.mainScene.size,
            model: model
        });
        hat.add();
        hat.show();
        hat.setPosition(landmarks);
        hat.scaleModel(landmarks);
        hat.rotationFollow(landmarks);
        this.hatsPutted.push(hat);
    }

    removeFacesMask() {
        if (this.choiceEffect !== "MASK_TIGER") return;
        for (let i = 0; i < this.facesPlaneMask2d.length; i++) {
            this.facesPlaneMask2d[i].remove();
        }
        this.facesPlaneMask2d = [];
    }

    removeHats() {
        if (this.choiceEffect !== "HAT") return;
        for (let i = 0; i < this.hatsPutted.length; i++) {
            this.hatsPutted[i].remove();
        }
        this.hatsPutted = [];
    }

    createModel3dCore() {
        const model = new Object3dModel({
            modelSrc: modelHatXMas
        });
        this.objectModels3dRendered.push(model);
    }
}
