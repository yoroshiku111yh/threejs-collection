
import SceneBase from './../../ultilities/sceneBase';
import * as THREE from 'three';

export default class SceneBlob2d extends SceneBase{
    constructor({$container, size}){
        super($container, size.width, size.height);
        this.haveRenderTarget = haveRenderTarget;
        this.init();
    }
    init(){
        this.initDefault();
    }
    initDefault(){
        this.start();
        this.initCamera();
        this.update();
    }
}