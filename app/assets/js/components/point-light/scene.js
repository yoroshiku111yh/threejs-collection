import * as THREE from 'three';
import SceneBase from './../../ultilities/sceneBase';

export default class ScenePointLight extends SceneBase{
    constructor({$container, size}){
        super($container, size.width, size.height);

        this.init();
    }
    init(){
        this.start();
        this.initCamera();
    }
    setUpdateCallback(callback){
        if(callback){
            this.updateCallback = callback;
        }
    }
}