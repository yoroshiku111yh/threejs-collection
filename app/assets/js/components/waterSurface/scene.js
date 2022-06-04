import * as THREE from 'three';
import SceneBase from './../../ultilities/sceneBase';
import { getResolutionVec3 } from '../../ultilities/resolution';
import { imgUrlWater } from './../../ultilities/srcImgurl';
import { BufferManager, BufferShader } from './../../ultilities/buffer';

import fragmentBuffer from './../../../shaders/waterSurface/buffer.glsl';
import vertex from './../../../shaders/waterSurface/vertexShader.glsl';
import fragmentImage from './../../../shaders/waterSurface/fragmentShader.glsl';
import ShaderRefractMultisideCommon from './../../../shaders/refractMultisideCommon/index';
import { clearColorDark } from './../../ultilities/variable';

export default class SceneWaterSurface extends SceneBase {
    constructor({ $container, size = {} }) {
        super($container, size.width, size.height);
        this.resolution = getResolutionVec3({ W: this.W, H: this.H });
        this.mouse = new THREE.Vector4();
        this.pointer = new THREE.Vector2();
        this.loader = new THREE.TextureLoader();
        this.rayCaster = new THREE.Raycaster();
        this.bg = this.loader.load(imgUrlWater);
        this.bgWater = null;
        this.init();
    }
    init() {
        this.start();
        this.renderer.autoClear = false;
        this.renderer.setClearColor(new THREE.Color(clearColorDark));
        this.initPerspectiveCamera();
        this.initCamera2();
        this.createFbo();
        this.createBackground();
        this.createBufferA();
        this.createBufferPlane();
        this.createModel();
        this.eventMouse();
        this.update();
    }
    initCamera2() {
        this.orthoCamera = new THREE.OrthographicCamera(
            this.W / -2,
            this.W / 2,
            this.H / 2,
            this.H / -2,
            1,
            1000
        );
        this.orthoCamera.layers.set(1);
        this.camera.position.z = 5;
        this.orthoCamera.position.z = 5;
    }
    createFbo() {
        this.envFbo = new THREE.WebGLRenderTarget(
            this.W * this.resolution.z,
            this.H * this.resolution.z
        );
    }
    createBufferA() {
        this.bufferATarget = new BufferManager(this.renderer, { width: this.W, height: this.H });
        this.bufferA = new BufferShader(fragmentBuffer, vertex, {
            iResolution: {
                value: this.resolution
            },
            iChannel0: {
                value: null
            },
            iChannel1: {
                value: null
            },
            iMouse: {
                value: this.mouse
            },
            iTime: {
                value: 0.
            },
            iFrame: {
                value: 0
            }
        },
            {
                x: this.W,
                y: this.H
            }
        );
    }
    createBufferPlane() {

        this.bufferImageTarget = new BufferManager(this.renderer, { width: this.W, height: this.H });
        this.bufferImage = new BufferShader(fragmentImage, vertex, {
            iChannel0: {
                value: null
            },
            iChannel1: {
                value: this.bgWater
            },
            iResolution: {
                value: this.resolution
            }
        },
            {
                x: this.W,
                y: this.H
            });
    }
    createModel() {
        const geo = new THREE.IcosahedronGeometry(1, 0);
        this.materialModel = new ShaderRefractMultisideCommon({
            envMap: {
                value: this.envFbo.texture
            },
            ior: {
                value: 0.99
            },
            resolution: {
                value: this.resolution
            }
        });
        this.modelMesh = new THREE.Mesh(geo, this.materialModel);
        this.mainScene.add(this.modelMesh);
    }
    createBackground() {
        this.quad = new THREE.Mesh(
            new THREE.PlaneGeometry(1,1,1,1),
            new THREE.MeshBasicMaterial({ map: this.bg })
        );
        this.quad.layers.set(1);
        this.quad.scale.set(this.W, this.H, 1);
        this.mainScene.add(this.quad);
    }
    updateCallback() {
        this.renderer.clear();
        this.renderModel();
        this.renderWaterSurface();
        this.rayCasting();
    }
    renderWaterSurface() {
        this.bufferA.uniforms.iTime.value += 0.01;

        this.bufferA.uniforms.iFrame.value += 1;

        this.bufferA.uniforms.iChannel0.value = this.bufferATarget.readBuffer.texture;

        this.bufferImage.uniforms.iChannel0.value = this.bufferATarget.readBuffer.texture;
        this.bufferImage.uniforms.iChannel1.value = this.bgWater;


        this.bufferATarget.render(this.bufferA.scene, this.camera);
        this.bufferImageTarget.render(this.bufferImage.scene, this.camera);
    }
    renderModel() {

        this.renderer.setRenderTarget(this.envFbo);
        this.renderer.render(this.mainScene, this.orthoCamera);

        this.bgWater = this.envFbo.texture;

        this.renderer.setRenderTarget(null);
        this.renderer.render(this.mainScene, this.orthoCamera); // render background

        this.renderer.clearDepth();

        this.modelMesh.material = this.materialModel;

        this.materialModel.uniforms.envMap.value = this.bufferImageTarget.readBuffer.texture;

        this.modelMesh.rotation.x += 0.005;
        this.modelMesh.rotation.y += 0.005;
    }
    rayCasting(){
        this.rayCaster.setFromCamera(this.pointer, this.camera);
        const intersects = this.rayCaster.intersectObjects(this.mainScene.children);
        if(intersects.length > 0){
            this.isInteractive = true;
        }
    }
    eventMouse() {
        this.container.addEventListener("mousemove", (e) => {
            const x = ( e.clientX / this.W ) * 2 - 1;
            const y = - ( e.clientY / window.innerHeight ) * 2 + 1;
            this.pointer.x = x;
            this.pointer.y = y;
            this.mouse.setX(e.clientX);
            this.mouse.setY(this.H - e.clientY);
        });
        this.container.addEventListener("mousedown", (e) => {
            if(this.isInteractive){ 
                this.mouse.setZ(1);
            }
        });
        this.container.addEventListener("mouseup", (e) => {
            this.mouse.setZ(0);
            this.isInteractive = false;
        })
    }
}