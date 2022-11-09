
import 'regenerator-runtime/runtime';
import { transformLandmarks } from '../helpers/landmarksHelper';
import FaceMeshMediapipe from './faceMeshMediapipe';
import SceneBase from './sceneBase';
import Texture2d from './texture2d';
import Object3dModel from './obj3d';


export default class FaceMeshFeaturev1 {
    constructor({ size, inputTracking, updateCallback = () => { }, typeTex = "VIDEO", canvasElm = "", afterLoadedAllEventName = "" }) {
        this.size = size;
        this.canvasElm = canvasElm;
        this.inputTracking = inputTracking;
        this.arFaceLandmarks = [];
        this.trackingFaceMesh = new FaceMeshMediapipe(this.onResults.bind(this), {
            maxNumFaces: 1
        });
        this.updateCallBack = updateCallback;
        this.object3dLoaded = [];
        this.texture2dLoaded = [];
        this.loadedMaterials = [];
        this.choiceEffect = {
            name : null,
        };
        this.isLoadedAllMaterial = false;
        this.DoneLoadAll = false;
        this.lengthTextures = 0;
        this.mainScene;
        this.typeTex = typeTex;
        this.afterLoadedAllEventName = afterLoadedAllEventName;
        this.init();
    }
    init() {
        if(!this.canvasElm) return;
        this.createCustomEventLoadedAll();
        this.mainScene = new SceneBase({
            typeTex: this.typeTex,
            canvasElm: this.canvasElm,
            callbackAnimate: this.update.bind(this)
        });
        this.mainScene.setSize(this.size.width, this.size.height);
        this.mainScene.init();

    }
    update() {
        this.dispatchAfterLoadedAll();
        this.updateCallBack();
    }
    sendImage() {
        this.trackingFaceMesh.faceMesh.send({
            image: this.inputTracking
        });
    }
    async sendFrames(){
        if(!this.webCamActive){
            if(this.inputTracking.end || this.inputTracking.paused) return;
        }
        await this.trackingFaceMesh.faceMesh.send({
            image : this.inputTracking
        });
        await new Promise(requestAnimationFrame);
        this.sendFrames();
    }
    setBg() {
        if(this.typeTex === "IMAGE")
            return this.mainScene.bg.setTexture(this.inputTracking.src);
        if(this.typeTex === "VIDEO")
            return this.mainScene.bg.setTexture(this.inputTracking);
    }
    onResults(results) {
        if (results.multiFaceLandmarks) {
            this.arFaceLandmarks = [];
            for (const landmarks of results.multiFaceLandmarks) {
                const faceLandmarks = transformLandmarks(landmarks);
                this.arFaceLandmarks.push(faceLandmarks);
                //this.isPlayGame = true;
            }
        }
    }
    loadTextures(textures) {
        this.lengthTextures = textures.length;
        for (let i = 0; i < this.lengthTextures; i++) {
            const mat = textures[i];
            switch (mat.type) {
                case "2d":
                    this.load2dTexture({ src: mat.src, name: mat.name });
                    break;
                case "3d":
                    this.load3dTexture({ src: mat.src, name: mat.name });
                    break;
            }
        }
    }
    load2dTexture({ src, name }) {
        const texture = new Texture2d({
            textureSrc: src,
            callbackLoaded: (tex) => {
                this.loadedMaterials.push({
                    name : name,
                    obj : tex,
                    type : "2d"
                });
            }
        });
        this.texture2dLoaded[name] = texture;
    }
    load3dTexture({ src, name }) {
        const model = new Object3dModel({
            modelSrc: src,
            callbackLoaded: (obj) => {
                this.loadedMaterials.push({
                    name : name,
                    obj : obj,
                    type : "3d"
                });
            }
        });
        this.object3dLoaded[name] = model;
    }
    callLoadedAll(){
        if(this.lengthTextures === 0) return;
        if(this.lengthTextures !== this.loadedMaterials.length) return;
        this.phaseMain();
    }
    createCustomEventLoadedAll(){
        if(!this.afterLoadedAllEventName) return
        this.eventLoadedAll = new CustomEvent(this.afterLoadedAllEventName, {
            bubbles : false
        })
    }
    dispatchAfterLoadedAll(){
        if(this.DoneLoadAll) return;
        this.DoneLoadAll = true;
        if(!this.eventLoadedAll) return;
        setTimeout(() => {
            document.dispatchEvent(this.eventLoadedAll);
        }, 500);
    }
    accessWebcam() {
        ///code again
        return;
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
                video.srcObject = stream;
                video.play();
                video.addEventListener("loadedmetadata", (e) => {

                });

            }).catch(function (error) {
                console.error('Unable to access the camera/webcam.', error);
            });

        } else {
            console.error('MediaDevices interface not available.');
        }
    }
}