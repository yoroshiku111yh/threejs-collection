
import { transformLandmarks } from '../helpers/landmarksHelper';
import FaceMeshMediapipe from './faceMeshMediapipe';
import SceneBase from './sceneBase';
import Texture2d from './texture2d';
import Object3dModel from './obj3d';


export default class FaceMeshWithImage {
    constructor({ size, inputImage, updateCallback = () => { } }) {
        this.size = size;
        this.inputImage = inputImage;
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
        this.isInitPhaseMain = false;
        this.lengthTextures = 0;
        this.mainScene;
        this.init();
    }
    init() {
        this.mainScene = new SceneBase({
            typeTex: "IMAGE",
            canvasElm: document.getElementById("canvas-input-image-1"),
            callbackAnimate: this.update.bind(this)
        });
        this.mainScene.setSize(this.size.width, this.size.height);
        this.mainScene.init();

    }
    update() {
        this.callLoadedAll();
        
        this.updateCallBack();
    }
    sendImage() {
        this.trackingFaceMesh.faceMesh.send({
            image: this.inputImage
        });
    }
    setBg() {
        this.mainScene.bg.setTexture(this.inputImage.src);
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
    phaseMain(){
        if(this.isInitPhaseMain) return;
        this.isInitPhaseMain = true;
    }
}