
import { LoaderGLTF } from './../utils/object3dLoader/gltf';
import { clone } from './../utils/jsm/SkeletonUtils';

export default class Object3dModel {
    constructor({modelSrc, callbackLoaded = () => {}}){
        this.modelSrc = modelSrc;
        this.model;
        this.loadGLTF;
        this.isLoaded = false;
        this.callbackLoaded = callbackLoaded;
        this.load();
    }
    load(){
        this.loadGLTF = new LoaderGLTF({
            src : this.modelSrc,
            resolve : this.resolve.bind(this)
        })
    }
    resolve(gltf){
        this.model = gltf.scene;
        this.isLoaded = true;
        this.callbackLoaded(gltf);
    }
    cloneModel(){
        if(!this.isLoaded){
            console.error("File model not loaded yet");
            return;
        }
        return clone(this.model);
    }
}