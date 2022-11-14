
import 'regenerator-runtime/runtime';
import { transformLandmarks } from '../helpers/landmarksHelper';
import FaceMeshMediapipe from './faceMeshMediapipe';
import SceneBase from './sceneBase';
import Texture2d from './texture2d';
import Object3dModel from './obj3d';
import PlaneMask2d from './planeMask2d';


export default class FaceMeshFeaturev1 {
    constructor({ size, inputTracking, updateCallback = () => { }, typeTex = "VIDEO", canvasElm = "", afterLoadedAllEventName = "", limitFaces = 3 }) {
        this.size = size;
        this.limitFaces = limitFaces;
        this.canvasElm = canvasElm;
        this.inputTracking = inputTracking;
        this.arFaceLandmarks = [];
        this.trackingFaceMesh = new FaceMeshMediapipe(this.onResults.bind(this), {
            maxNumFaces: limitFaces
        });
        this.updateCallBack = updateCallback;
        this.loadedMaterials = {};
        this.choiceEffect = {
            name : null,
            ar : []
        };
        this.isLoadedAllMaterial = false;
        this.DoneLoadAll = false;
        this.lengthTextures = 0;
        this.mainScene;
        this.typeTex = typeTex;
        this.afterLoadedAllEventName = afterLoadedAllEventName;
        this.isStop = false;
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
    pickEffect(name){
        this.choiceEffect.name = name;
        this.choiceEffect.ar = [];
    }
    addEffects(){
        if(this.arFaceLandmarks.length === 0) return;
        for(let i = 0; i < this.arFaceLandmarks.length; i++){
            const landmarks = this.arFaceLandmarks[i];
            if(!landmarks) continue;
            const maskUse = this.loadedMaterials[this.choiceEffect.name];
            switch(maskUse.type){
                case "2d" : 
                    const _effect = this.choiceEffect.ar[i];
                    _effect.setLandMarks(landmarks);
                    _effect.setGeometry();
                    _effect.show();
                    break;
                case "3d" :
                    break;
            }
        }
    }
    createEffectLayers(){
        const maskUse = this.loadedMaterials[this.choiceEffect.name];
        for(let i = 0 ; i < this.limitFaces; i++){
            switch(maskUse.type){
                case "2d" :
                     this.createEffectLayer2d();
                    break;
                case "3d":
                    this.createEffectLayer3d();
                    break;
            }
        }
        
    }
    createEffectLayer2d(){
        const { name } = this.choiceEffect;
        const layer = new PlaneMask2d(this.mainScene.scene, this.size);
        layer.setTexture(this.loadedMaterials[name].src);
        layer.createPlane();
        this.choiceEffect.ar.push(layer);
    }
    createEffectLayer3d(){
        const { name } = this.choiceEffect;
        const obj3dLayer = null;
    }
    removeEffects(){
        for(let i = 0; i < this.choiceEffect.ar.length; i++){
            const item = this.choiceEffect.ar[i];
            item.remove();
        }
        this.choiceEffect.ar = [];
    }
    hideEffects(){
        for(let i = 0; i < this.choiceEffect.ar.length; i++){
            const item = this.choiceEffect.ar[i];
            item.hide();
        }
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
        if( ! this.inputTracking) return;
        if(!this.webCamActive){
            if(this.inputTracking.end || this.inputTracking.paused) return;
        }
        await this.trackingFaceMesh.faceMesh.send({
            image : this.inputTracking
        });
        await new Promise(requestAnimationFrame);
        this.sendFrames();
    }
    setInputTracking(inputTracking, typeInput){
        this.inputTracking = inputTracking;
        this.typeTex = typeInput;
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
        this.loadedMaterials[name] = {
            src : src,
            type : "2d"
        }
    }
    load3dTexture({ src, name }) {
        const model = new Object3dModel({
            modelSrc: src,
            callbackLoaded: (obj) => {
                this.loadedMaterials[name] = {
                    obj : model,
                    type : "3d"
                }
            }
        });
    }
    callLoadedAll(){
        if(this.lengthTextures === 0) return;
        if(this.lengthTextures !== Object.size(this.loadedMaterials)) return;
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
}