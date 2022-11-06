
import { LoaderGLTF } from './../utils/object3dLoader/gltf';
import { clone } from './../utils/jsm/SkeletonUtils';

export default class Object3dModel {
    constructor({modelSrc}){
        this.modelSrc = modelSrc;
        this.model;
        this.loadGLTF;
        this.isLoaded = false;
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
    }
    cloneModel(){
        if(!this.isLoaded){
            console.error("File model not loaded yet");
            return;
        }
        return clone(this.model);
    }
}