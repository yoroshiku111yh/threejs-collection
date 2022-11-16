
import 'regenerator-runtime/runtime';
import { transformLandmarks } from '../helpers/landmarksHelper';
import FaceMeshMediapipe from './faceMeshMediapipe';
import SceneBase from './sceneBase';
import Texture2d from './texture2d';
import Object3dModel from './obj3d';
import PlaneMask2d from './planeMask2d';
import PlaneMask3d from './planeMask3d';


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
            name: null,
            ar: []
        };
        this.isLoadedAllMaterial = false;
        this.doneLoadAll = false;
        this.lengthTextures = 0;
        this.mainScene;
        this.typeTex = typeTex;
        this.afterLoadedAllEventName = afterLoadedAllEventName;
        this.isStop = false;
        this.init();
    }
    init() {
        if (!this.canvasElm) return;
        this.createCustomEventLoadedAll();
        this.mainScene = new SceneBase({
            typeTex: this.typeTex,
            canvasElm: this.canvasElm,
            callbackAnimate: this.update.bind(this)
        });
        this.mainScene.setSize(this.size.width, this.size.height);
        this.mainScene.init();

    }
    pickEffect(name) {
        this.choiceEffect.name = name;
        this.choiceEffect.ar = [];
    }
    addEffects() {
        if (this.arFaceLandmarks.length === 0) return;
        for (let i = 0; i < this.arFaceLandmarks.length; i++) {
            const landmarks = this.arFaceLandmarks[i];
            if (!landmarks) continue;
            const maskUse = this.loadedMaterials[this.choiceEffect.name];
            switch (maskUse.type) {
                case "2d":
                    const _effect = this.choiceEffect.ar[i];
                    _effect.setLandMarks(landmarks);
                    _effect.setGeometry();
                    _effect.show();
                    break;
                case "3d":
                    const _effect3d = this.choiceEffect.ar[i];
                    _effect3d.setLandMarks(landmarks);
                    _effect3d.setPosition();
                    _effect3d.scaleModel();
                    _effect3d.rotateFollow();
                    _effect3d.show();
                    break;
            }
        }
    }
    createEffectLayers() {
        console.log(this.loadedMaterials);
        const maskUse = this.loadedMaterials[this.choiceEffect.name];
        for (let i = 0; i < this.limitFaces; i++) {
            switch (maskUse.type) {
                case "2d":
                    this.createEffectLayer2d();
                    break;
                case "3d":
                    this.createEffectLayer3d();
                    break;
            }
        }

    }
    createEffectLayer2d() {
        const { name } = this.choiceEffect;
        const layer = new PlaneMask2d({ scene: this.mainScene.scene, sizeDimension: this.size });
        layer.setTexture(this.loadedMaterials[name].src);
        layer.createPlane();
        this.choiceEffect.ar.push(layer);
    }
    createEffectLayer3d() {
        const { name } = this.choiceEffect;
        const { obj, modified } = this.loadedMaterials[name];
        const obj3dLayer = new PlaneMask3d({ scene: this.mainScene.scene, sizeDimension: this.size, spacingMulti: modified.spacingMulti, scaleMulti: modified.scaleMulti });
        obj3dLayer.setModel(obj.cloneModel());
        obj3dLayer.setPointInFace(modified.pointInFace);
        obj3dLayer.add();
        this.choiceEffect.ar.push(obj3dLayer);
    }
    removeEffects() {
        for (let i = 0; i < this.choiceEffect.ar.length; i++) {
            const item = this.choiceEffect.ar[i];
            item.remove();
        }
        this.choiceEffect.ar = [];
    }
    hideEffects() {
        for (let i = 0; i < this.choiceEffect.ar.length; i++) {
            const item = this.choiceEffect.ar[i];
            item.hide();
        }
    }
    update() {
        this.updateCallBack();
    }
    sendImage() {
        this.trackingFaceMesh.faceMesh.send({
            image: this.inputTracking
        });
    }
    async sendFrames() {
        if (!this.inputTracking) return;
        if (!this.webCamActive) {
            if (this.inputTracking.end || this.inputTracking.paused) return;
        }
        await this.trackingFaceMesh.faceMesh.send({
            image: this.inputTracking
        }).catch((e) => {});
        await new Promise(requestAnimationFrame).catch((e) => {});
        this.sendFrames();
    }
    setInputTracking(inputTracking, typeInput) {
        this.inputTracking = inputTracking;
        this.typeTex = typeInput;
    }
    setBg() {
        if (this.typeTex === "IMAGE")
            return this.mainScene.bg.setTexture(this.inputTracking.src);
        if (this.typeTex === "VIDEO")
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
        /////
        this.removeTexLoaded();
        ////
        this.lengthTextures = textures.length;
        for (let i = 0; i < this.lengthTextures; i++) {
            const mat = textures[i];
            switch (mat.type) {
                case "2d":
                    this.load2dTexture(mat);
                    break;
                case "3d":
                    this.load3dTexture(mat);
                    break;
            }
        }
    }
    removeTexLoaded() {
        this.loadedMaterials = [];
        for (let i = 0; i < this.choiceEffect.ar.length; i++) {
            const item = this.choiceEffect.ar[i];
            item.remove();
        }
        this.choiceEffect.ar = [];
        this.doneLoadAll = false;
    }
    load2dTexture({ src, name }) {
        this.loadedMaterials[name] = {
            src: src,
            type: "2d"
        }
        this.callLoadedAll();
    }
    load3dTexture({ src, name, modified }) {
        const model = new Object3dModel({
            modelSrc: src,
            callbackLoaded: (obj) => {
                this.loadedMaterials[name] = {
                    obj: model,
                    type: "3d",
                    modified: modified
                };
                this.callLoadedAll();
            }
        });
    }
    callLoadedAll() {
        if (this.lengthTextures === 0) return;
        if (this.lengthTextures !== Object.keys(this.loadedMaterials).length) return;
        this.dispatchAfterLoadedAll();
    }
    createCustomEventLoadedAll() {
        if (!this.afterLoadedAllEventName) return
        this.eventLoadedAll = new Event(this.afterLoadedAllEventName, {
            bubbles: true
        })
    }
    dispatchAfterLoadedAll() {
        if (this.doneLoadAll) return;
        this.doneLoadAll = true;
        if (!this.eventLoadedAll) return;
        document.dispatchEvent(this.eventLoadedAll);
    }
}