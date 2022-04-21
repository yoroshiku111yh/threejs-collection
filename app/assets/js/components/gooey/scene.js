
import SceneBase from './../../ultilities/sceneBase';
import * as THREE from 'three';

export default class SceneCard extends SceneBase{
    constructor({ $container, size, cameraOption }){
        super($container, size.width, size.height);
        this.camereOption = cameraOption;
        this.perspective = 800;
        this.init();
    }
    init(){
        this.start();
        this.initCamera();
    }
    initCamera() {
        const fov = (180 * (2 * Math.atan(this.H / 2 / this.perspective))) / Math.PI
        this.camera = new THREE.PerspectiveCamera(fov, this.W / this.H, this.camereOption.near, this.camereOption.far)
        this.camera.position.set(0, 0, this.perspective)
    }
    setUpdateCallback(callback){
        this.updateCallback = callback;
    }
}