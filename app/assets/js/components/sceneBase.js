import * as THREE from 'three';
import PlaneBg from './planeBg';

const cameraDistance = (height, fov) => {
    return (height / 2) / Math.tan((fov / 2) * Math.PI / 180);
}

export default class SceneBase {
    constructor(canvasElm, size = {}, useOrtho = true) {
        this.canvasElm = canvasElm;
        this.size = size;
        this.scene = new THREE.Scene();
        this.debug = false;
        this.useOrtho = useOrtho;
        this.fov = 63;
        this.init();
    }
    init() {
        this.initRenderer();
        this.createCamera();
        this.createBg();

        this.animate();
    }
    setSize(width, height) {
        this.size.width = width;
        this.size.height = height;
    }
    initRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            canvas: this.canvasElm
        });
        this.renderer.setSize(this.size.width, this.size.height);
    }
    createBg() {
        this.bg = new PlaneBg(this.scene, this.size);
    }
    createCamera() {
        this.useOrtho ? this.createOrtho() : this.createPerspective();
    }
    createOrtho() {
        this.camera = new THREE.OrthographicCamera(
            -this.size.width / 2,
            this.size.width / 2,
            this.size.height / 2,
            -this.size.height / 2,
            -2000,
            2000
        );
        this.camera.position.z = 1;
    }
    createPerspective() {
        this.camera = new THREE.PerspectiveCamera(
            this.fov,
            this.size.width / this.size.height,
            1.0,
            100000
        );
        this.camera.position.z = cameraDistance(
            this.size.height,
            this.fov
        );
    }
    animate() {
        requestAnimationFrame(this.animate.bind(this));
        this.update();
    }
    update() {
        this.bg.update();
        this.renderer.render(this.scene, this.camera);
    }
}