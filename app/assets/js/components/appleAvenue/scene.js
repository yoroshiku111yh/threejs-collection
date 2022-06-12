
import SceneBase from './../../ultilities/sceneBase';
import * as THREE from 'three';
import { clearColorBlack, clearColorDark } from './../../ultilities/variable';
import ShaderAppleAvenue from './../../../shaders/appleAvenue/index';
import { getResolutionVec3 } from './../../ultilities/resolution';
import ShaderAppleAvenueBorder from './../../../shaders/appleAvenue/border/index';


export default class SceneAppleAvenue extends SceneBase {
    constructor({ $container, size = {} }) {
        super($container, size.width, size.height);
        this.resolution = getResolutionVec3({ W: this.W, H: this.H });
        this.maskLogoSrc = document.getElementById("maskLogo").dataset.src;
        this.maskLogoTextSrc = document.getElementById("maskLogoText").dataset.src;
        this.loader = new THREE.TextureLoader();
        this.init();
    }
    init() {
        this.start();
        this.renderer.autoClear = false;
        //this.renderer.setClearColor(clearColorDark);
        this.initPerspectiveCamera();
        this.initOrthographicCamera();
        this.camera.position.z = 5;
        this.orthoCamera.position.z = 5;
        this.createFbo();
        this.createLogoPlane();
        this.createLogoTextPlane();
        this.createCubeBorder();
        this.createCube();
        this.update();
    }
    initOrthographicCamera() {
        this.orthoCamera = new THREE.OrthographicCamera(
            this.W / -2,
            this.W / 2,
            this.H / 2,
            this.H / -2,
            1,
            1000
        );
        this.orthoCamera.layers.set(1);
        this.mainScene.add(this.orthoCamera);
    }
    createFbo() {
        this.envFbo = new THREE.WebGLRenderTarget(
            this.W * this.resolution.z,
            this.H * this.resolution.z
        )
        this.sceneTarget = new THREE.Scene();
        this.envFbo2 = new THREE.WebGLRenderTarget(
            this.W * this.resolution.z,
            this.H * this.resolution.z
        )
        this.sceneTarget2 = new THREE.Scene();
    }
    createLogoPlane() {
        const geo = new THREE.PlaneGeometry(1, 1, 1, 1);
        const mat = new THREE.MeshBasicMaterial({
            map: this.loader.load(this.maskLogoSrc)
        });
        this.planeLogo = new THREE.Mesh(geo, mat);
        this.planeLogo.layers.set(1);
        this.planeLogo.scale.set(357 / 1, 610 / 1);
        this.sceneTarget.add(this.planeLogo);
    }
    createLogoTextPlane() {
        const geo = new THREE.PlaneGeometry(1, 1, 1, 1);
        const mat = new THREE.MeshBasicMaterial({
            map: this.loader.load(this.maskLogoTextSrc)
        });
        this.planeLogoText = new THREE.Mesh(geo, mat);
        this.planeLogoText.layers.set(1);
        this.planeLogoText.scale.set(1894 / 2, 610 / 2);
        this.sceneTarget2.add(this.planeLogoText);
    }
    updateCallback() {
        this.cubeMesh.rotation.x += 0.01;
        this.cubeMesh.rotation.y += 0.01;

        this.cubeBorderMesh.rotation.x += 0.01;
        this.cubeBorderMesh.rotation.y += 0.01;

        this.cubeMesh.material.uniforms.uTick.value += 0.001;
        this.cubeBorderMesh.material.uniforms.uTick.value += 0.001;

        this.renderer.clear();

        this.renderer.setRenderTarget(this.envFbo);
        this.renderer.render(this.sceneTarget, this.orthoCamera);

        this.renderer.setRenderTarget(null);

        this.renderer.setRenderTarget(this.envFbo2);
        this.renderer.render(this.sceneTarget2, this.orthoCamera);
        
        this.renderer.setRenderTarget(null);


        this.renderer.clearDepth();

    }
    createCube() {
        const geo = new THREE.BoxGeometry(1, 1, 1, 1);

        const side1 = [0, 0, 0, 0];
        const side2 = [1, 1, 1, 1];
        const side3 = [2, 2, 2, 2];
        const side4 = [3, 3, 3, 3];
        const side5 = [4, 4, 4, 4];
        const side6 = [5, 5, 5, 5];

        let boxSides = [...side1, ...side2, ...side3, ...side4, ...side5, ...side6];

        geo.setAttribute('sides', new THREE.Float32BufferAttribute(boxSides, 1));

        this.mat = new ShaderAppleAvenue({
            uResolution: {
                value: this.resolution
            },
            uTick: {
                value: 0.0
            },
            uMask1: {
                value: this.envFbo.texture
            },
            uMask2: {
                value: this.envFbo2.texture
            },
            isRefract: {
                value: true
            }
        });

        this.cubeMesh = new THREE.Mesh(geo, this.mat);
        this.cubeMesh.position.z = 2.5;
        this.mainScene.add(this.cubeMesh);
    }
    createCubeBorder(){
        const geo = new THREE.BoxGeometry(1, 1, 1, 1);
        this.mat = new ShaderAppleAvenueBorder({
            uResolution: {
                value: this.resolution
            },
            uTick: {
                value: 0.0
            },
            isRefract: {
                value: true
            },
        });
        this.cubeBorderMesh = new THREE.Mesh(geo, this.mat);
        this.cubeBorderMesh.position.z = 2.5;
        this.mainScene.add(this.cubeBorderMesh);
    }
}