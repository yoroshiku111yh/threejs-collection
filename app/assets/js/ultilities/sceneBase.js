import * as THREE from 'three';
export default class SceneBase{
    constructor($container, sizeWidth = window.innerWidth, sizeHeight = window.innerHeight){
        this.container = $container;
        this.W = sizeWidth;
        this.H = sizeHeight;
        this.perspective = 5;
        this.maxPerspective = 100;
        this.minPerspective = 0.01;
        this.degCameraPerspective = 45;
    }
    start(){
        this.mainScene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({
            canvas : this.container,
            alpha : true,
        });
        this.renderer.setSize(this.W, this.H);
        this.renderer.setPixelRatio(window.devicePixelRatio);
    }
    initCamera() {
        this.camera = new THREE.PerspectiveCamera(this.degCameraPerspective, this.W / this.H, this.minPerspective, this.maxPerspective);
        this.camera.position.set(0, 0, this.perspective);
    }
    update() {
        requestAnimationFrame(this.update.bind(this))
        this.updateCallback();
        if(!this.camera){
            console.error("Camera is undefined.");
        }
        this.renderer.render(this.mainScene, this.camera);
    }
    updateCallback(){
        /// empty for child
    }
}