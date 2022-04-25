
import SceneBase from './../../ultilities/sceneBase';
import * as THREE from 'three';

export default class SceneBlob2d extends SceneBase{
    constructor({$container, size}){
        super($container, size.width, size.height);
        this.init();
    }
    init(){
        this.start();
        this.initCamera();
        this.update();
    }
}