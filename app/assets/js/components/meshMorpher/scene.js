import * as THREE from 'three';
import SceneBase from './../../ultilities/sceneBase';

export default class SceneMeshMorpher extends SceneBase {
    constructor({$container, size = {}, models}){
        super($container, size.width, size.height);
        this.geometries = [];
        this.vertexOffset = [];
        this.models = models;
        this.init();
    }
    init(){
        this.start();
        this.initPerspectiveCamera();
        this.addFiles();
        this.update();
    }
    updateCallback(){
        
    }
    addFiles(){
        for(let i = 0 ; i < this.models.length; i++){
            const model = this.models[i];
            model.material = new THREE.MeshPhysicalMaterial({
                color : 0x00ada7
            });
            model.material.shading = THREE.FlatShading;
            
        }
    }
}