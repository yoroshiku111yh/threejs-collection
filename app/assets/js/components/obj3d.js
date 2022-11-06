
import { LoaderGLTF } from './../utils/object3dLoader/gltf';

export default class Object3dModel {
    constructor(scene, sizeDimensions ={}, modelSrc){
        this.scene = scene;
        this.sizeDimensions = sizeDimensions;
        this.modelSrc = modelSrc;
    }
    load(){
        const model1 = new LoaderGLTF({
            src : this.modelSrc,
            resolve : this.resolveModel.bind(this)
        })
    }
    resolveModel(gltf){
        console.log(gltf);
    }
}