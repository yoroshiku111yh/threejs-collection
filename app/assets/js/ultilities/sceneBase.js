import * as THREE from 'three';
export default class SceneBase{
    constructor($container, sizeWidth = window.innerWidth, sizeHeight = window.innerHeight, antialias = false){
        this.container = $container;
        this.W = sizeWidth;
        this.H = sizeHeight;
        this.antialias = antialias;
        this.perspective = 5;
        this.maxPerspective = 100;
        this.minPerspective = 0.01;
        this.degCameraPerspective = 45;
        this.renderedInCallBack = false;
    }
    start(){
        this.mainScene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({
            canvas : this.container,
            alpha : true,
            antialias : this.antialias
        });
        this.renderer.setSize(this.W, this.H);
        this.renderer.setPixelRatio(window.devicePixelRatio);
    }
    initCamera() {
        this.camera = new THREE.PerspectiveCamera(this.degCameraPerspective, this.W / this.H, this.minPerspective, this.maxPerspective);
        this.camera.position.set(0, 0, this.perspective);
        this.mainScene.add(this.camera);
    }
    initPerspectiveCamera(){
        this.camera = new THREE.PerspectiveCamera(this.degCameraPerspective, this.W / this.H, this.minPerspective, this.maxPerspective);
        this.camera.position.set(0, 0, this.perspective);
        this.mainScene.add(this.camera);
    }
    initOrthographicCamera(){
        this.camera = new THREE.OrthographicCamera(
            this.W / -2, 
            this.W / 2, 
            this.H / 2, 
            this.H / -2, 
            0, 
            1000
        );
        this.camera.position.set(0, 0, 0);
        this.mainScene.add(this.camera);
    }
    update() {
        requestAnimationFrame(this.update.bind(this))
        this.updateCallback();
        if(!this.camera){
            console.error("Camera is undefined.");
        }
        if(!this.renderedInCallBack){
            this.renderer.render(this.mainScene, this.camera);
        }
    }
    updateCallback(){
        /// empty for child
    }
}