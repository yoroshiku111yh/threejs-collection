
import 'regenerator-runtime/runtime';
import { transformLandmarks } from '../helpers/landmarksHelper';
import SceneBase from '../components/sceneBase';
import PlaneMask2d from './../components/planeMask2d';
import PlaneText from '../components/planeText';
import FaceMeshMediapipe from '../components/faceMeshMediapipe';

import modelHatXMas from '../../mediapipe/models/hat/hat-2.glb';
import modelGlass from '../../mediapipe/models/glass/scene.gltf';
import Object3dModel from './../components/obj3d';
import HatOnTheHead from '../components/hatOnTheHead';

const typeInputBg = {
    img: "IMAGE",
    video: "VIDEO",
}

export default class MediaPipeFace {
    constructor() {
        this.inputImage = document.getElementById("mediapipe-image-input");
        this.inputVideo = document.getElementById("mediapipe-vid-input");
        this.inputTextImg1 = document.getElementById("mediapipe-text-1");
        this.inputTextImg2 = document.getElementById("mediapipe-text-2");
        this.outputCanvas = document.getElementById("mediapipe-output");
        this.inputFacePlaceHolder = document.getElementById("mediapipe-face-place-holder");
        this.typeInput = typeInputBg.video;
        this.useWebcam = false;
        this.singlePlayer = false;
        this.facesPlaneMask2d = [];
        this.arFaceLandmarks = [];
        this.objectModels3dRendered = {};
        this.choicedModel = "glasses";
        this.mask2dRendered = [];
        this.pickedEffect = false;
        this.time = 0;
        this.isDetectFace = false;
        this.startRandom = false;
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
        this.pickedChoiceTypeInput = false;
        this.eventChoiceTypeInput();
        //this.init();
    }
    //////////////////
    eventChoiceTypeInput() {
        const btnTypeInputImage = document.getElementById("btn-input-img");
        const btnTypeInputVideo = document.getElementById("btn-input-video");
        const btnTypeInputWebcam = document.getElementById("btn-input-webcam");


        const playground = document.getElementById("playground");

        btnTypeInputImage.addEventListener("click", () => {
            if (this.pickedChoiceTypeInput) return;
            this.pickedChoiceTypeInput = true;
            this.typeInput = typeInputBg.img;
            playground.classList.remove("hidden");
            const value = document.querySelector('input[name="effectShow"]:checked').value;
            if (value === "mini-game") {
                this.singlePlayer = true;
            }
            if (value === "hat") {
                this.choiceEffect = this.typeEffect[1];
                this.choicedModel = "hat";
            }
            if (value === "glasses") {
                this.choiceEffect = this.typeEffect[1];
                this.choicedModel = "glasses";
            }
            if (value === "mask") {
                this.choiceEffect = this.typeEffect[0];
            }
            this.init();
        });

        btnTypeInputVideo.addEventListener("click", () => {
            if (this.pickedChoiceTypeInput) return;
            this.pickedChoiceTypeInput = true;
            this.typeInput = typeInputBg.video;
            playground.classList.remove("hidden");

            const value = document.querySelector('input[name="effectShow"]:checked').value;
            if (value === "mini-game") {
                this.singlePlayer = true;
            }
            if (value === "hat") {
                this.choiceEffect = this.typeEffect[1];
                this.choicedModel = "hat";
            }
            if (value === "glasses") {
                this.choiceEffect = this.typeEffect[1];
                this.choicedModel = "glasses";
            }
            if (value === "mask") {
                this.choiceEffect = this.typeEffect[0];
            }
            this.init();
        });

        btnTypeInputWebcam.addEventListener("click", () => {
            if (this.pickedChoiceTypeInput) return;
            this.pickedChoiceTypeInput = true;
            this.typeInput = typeInputBg.video;
            this.useWebcam = true;
            playground.classList.remove("hidden");

            const value = document.querySelector('input[name="effectShow"]:checked').value;
            if (value === "mini-game") {
                this.singlePlayer = true;
            }
            if (value === "hat") {
                this.choiceEffect = this.typeEffect[1];
                this.choicedModel = "hat";
            }
            if (value === "glasses") {
                this.choiceEffect = this.typeEffect[1];
                this.choicedModel = "glasses";
            }
            if (value === "mask") {
                this.choiceEffect = this.typeEffect[0];
            }
            this.init();
        });

    }
    //////////////////
    accessWebcam() {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            const constraints = {
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                }
            };
            const video = document.createElement("video");
            video.setAttribute('autoplay', '');
            video.setAttribute('muted', '');
            video.setAttribute('playsinline', '');
            navigator.mediaDevices.getUserMedia(constraints).then((stream) => {

                // apply the stream to the video element used in the texture
                video.srcObject = stream;
                video.play();
                video.addEventListener("loadedmetadata", (e) => {

                    this.inputWebcamVideo = {
                        video: video,
                        videoWidth: video.videoWidth,
                        videoHeight: video.videoHeight
                    };
                    this.initScanInWebcam();
                });

            }).catch(function (error) {
                console.error('Unable to access the camera/webcam.', error);
            });

        } else {
            console.error('MediaDevices interface not available.');
        }
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
            case typeInputBg.img:
                this.initScanInImage();
                break;
            case typeInputBg.video:
                if (this.useWebcam) {
                    this.accessWebcam();
                    this.outputCanvas.classList.add("-mirror");
                }
                else {
                    this.initScanInVideo();
                }
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
        if (this.useWebcam) return;
        switch (this.typeInput) {
            case typeInputBg.img:
                this.inputImage.parentNode.classList.add("active");
                break;
            case typeInputBg.video:
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
    initScanInVideo() {
        this.mainScene.setSize(this.inputVideo.videoWidth, this.inputVideo.videoHeight);
        this.mainScene.init();
        this.mainScene.bg.setTexture(this.inputVideo);
        this.eventPlayVideo();
    }
    initScanInWebcam() {
        const { video, videoWidth, videoHeight } = this.inputWebcamVideo;
        this.mainScene.setSize(videoWidth, videoHeight);
        this.mainScene.init();
        this.mainScene.bg.setTexture(video);
        this.getFrameVideo(video);
    }

    async getFrameVideo(video) {
        if (!this.useWebcam) {
            if (video.ended || video.paused) return;
        }
        await this.trackingFaceMesh.faceMesh.send({
            image: video
        });
        await new Promise(requestAnimationFrame);
        this.getFrameVideo(video);
    }
    eventPlayVideo() {
        this.inputVideo.addEventListener("play", () => {
            this.getFrameVideo(this.inputVideo);
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
                        this.putHatOnTheHead(this.objectModels3dRendered[this.choicedModel].cloneModel(), faceLandmarks);
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
        if (this.startRandom) return;
        let countdown = 3000;
        let pick = 0;
        let pickAr = [0, 1];
        let interval = setInterval(() => {
            if (countdown <= 0) {
                this.pickedEffect = true;
                clearInterval(interval);
                interval = null;
                this.choicedModel = "hat";
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
        this.startRandom = true;
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
        const model2 = new Object3dModel({
            modelSrc: modelGlass
        });
        this.objectModels3dRendered["hat"] = model;
        this.objectModels3dRendered["glasses"] = model2;
    }
}
