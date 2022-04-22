
import * as THREE from 'three';
import SceneBase from './../../ultilities/sceneBase';

export default class SceneDistortion extends SceneBase {
    constructor({ $container, size }) {
        super($container, size.width, size.height);
        console.log('%c Hover effect by Robin Delaporte: https://github.com/robin-dela/hover-effect ', 'color: #391e3a; font-size: 0.8rem');
        console.log('%c Modified advance by Minh Vu ( vuhongminh911@gmail ) ', 'color: #932302; font-size: 0.8rem');
        this.init();
    }
    initCamera() {
        this.camera = new THREE.OrthographicCamera(
            this.W / -2,
            this.W / 2,
            this.H / 2,
            this.H / -2,
            1,
            1000
        );
        this.camera.position.z = 1;
    }
    init(){
        this.start();
        this.initCamera();
        this.renderer.setPixelRatio(2.0);
    }
}