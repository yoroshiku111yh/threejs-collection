
import SceneBase from './../../ultilities/sceneBase';
import * as THREE from 'three';

export default class SceneCard extends SceneBase{
    constructor({ $container, size, cameraOption }){
        super($container, size.width, size.height);
        this.camereOption = cameraOption;
        this.mouse = new THREE.Vector2();
        this.perspective = 800;
        this.tiles = [];
        this.init();
    }
    init(){
        this.start();
        this.initCamera();
    }
    initCamera() {
        const fov = (180 * (2 * Math.atan(this.H / 2 / this.perspective))) / Math.PI
        this.camera = new THREE.PerspectiveCamera(fov, this.W / this.H, this.cameraoOpt.near, this.cameraoOpt.far)
        this.camera.position.set(0, 0, this.perspective)
    }
    updateCallback(){
        if(this.tiles.length === 0) return;
        this.tiles.forEach((tile) => {
            tile.update();
        });
    }
}