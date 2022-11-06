
import { LoaderGLTF } from './../utils/object3dLoader/gltf';

export default class Object3dModel {
    constructor({scene, sizeDimensions ={}, modelSrc, resolve = () => {}}){
        this.scene = scene;
        this.sizeDimensions = sizeDimensions;
        this.modelSrc = modelSrc;
        this.resolve = resolve;
        this.load();
    }
    load(){
        const model1 = new LoaderGLTF({
            src : this.modelSrc,
            resolve : this.resolve
        })
    }
}