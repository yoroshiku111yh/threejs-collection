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
import whaleModelSrc from './../../../3dmodel/obj/glass-whale.obj';
import { LoaderOBJ } from './../../ultilities/object3dLoader/obj';
import { getTextureCover } from '../../ultilities/textureCover';

//z = -15
export default class SceneWaterSurface extends SceneBase {
    constructor({ $container, size = {} }) {
        super($container, size.width, size.height);
        this.resolution = getResolutionVec3({ W: this.W, H: this.H });
        this.mouse = new THREE.Vector4();
        this.pointer = new THREE.Vector2();
        this.bgSize = new THREE.Vector2(2048, 1024);
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
        window.addEventListener("resize", this.resize.bind(this));
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
        //const geo = new THREE.IcosahedronGeometry(1, 0);
        this.materialModel = new ShaderRefractMultisideCommon({
            envMap: {
                value: this.envFbo.texture
            },
            ior: {
                value: 0.99
            },
            colorReflect: {
                value: new THREE.Color("#FFF")
            },
            colorRefraction: {
                value: new THREE.Color("rgb(255, 245, 245)")
            },
            resolution: {
                value: new THREE.Vector3(this.resolution.x * this.resolution.z, this.resolution.y * this.resolution.z, this.resolution.z)
            },
            zPosition: {
                value: this.getZmodel()
            }
        });
        //this.modelMesh = new THREE.Mesh(geo, this.materialModel);
        new LoaderOBJ({
            src: whaleModelSrc,
            resolve: (obj) => {
                const mesh = obj.children[0];
                this.modelMesh = mesh;
                this.modelMesh.position.z = 1;
                this.mainScene.add(this.modelMesh);
            }
        });
    }
    createBackground() {
        this.bg = getTextureCover(this.bg, { width: this.W, height: this.H }, { width: this.bgSize.x, height: this.bgSize.y });

        this.quad = new THREE.Mesh(
            new THREE.PlaneGeometry(1, 1, 1, 1),
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
        if (!this.modelMesh) return;
        this.renderer.setRenderTarget(this.envFbo);
        this.renderer.render(this.mainScene, this.orthoCamera);

        this.bgWater = this.envFbo.texture;

        this.renderer.setRenderTarget(null);
        this.renderer.render(this.mainScene, this.orthoCamera); // render background

        this.renderer.clearDepth();

        this.modelMesh.material = this.materialModel;

        this.materialModel.uniforms.envMap.value = this.bufferImageTarget.readBuffer.texture;

        //this.modelMesh.rotation.x += 0.005;
        this.modelMesh.rotation.y += 0.005;
    }
    rayCasting() {
        this.rayCaster.setFromCamera(this.pointer, this.camera);
        const intersects = this.rayCaster.intersectObjects(this.mainScene.children);
        if (intersects.length > 0) {
            this.isInteractive = true;
        }
    }
    eventMouse() {
        if ("ontouchmove" in window) {
            window.addEventListener("touchstart", this.eventMouseDown.bind(this));
            window.addEventListener("touchmove", this.eventMouseMove.bind(this));
            window.addEventListener("touchend", this.eventMouseUp.bind(this));
        } else {
            window.addEventListener("mousedown", this.eventMouseDown.bind(this));
            window.addEventListener("mousemove", this.eventMouseMove.bind(this));
            window.addEventListener("mouseup", this.eventMouseUp.bind(this));
        }
    }
    eventMouseDown() {
        if (this.isInteractive) {
            this.mouse.setZ(1);
        }
    }
    eventMouseUp() {
        this.mouse.setZ(0);
        this.isInteractive = false;
    }
    eventMouseMove(e) {
        const _x = e.touches ? e.touches[0].clientX : e.clientX;
        const _y = e.touches ? e.touches[0].clientY : e.clientY;

        const x = (_x / this.W) * 2 - 1;
        const y = - (_y / this.H) * 2 + 1;
        this.pointer.x = x;
        this.pointer.y = y;
        this.mouse.setX(_x);
        this.mouse.setY(this.H - _y);
    }
    resize() {
        this.W = window.innerWidth;
        this.H = window.innerHeight;
        this.bg = getTextureCover(this.bg, { width: this.W, height: this.H }, { width: this.bgSize.x, height: this.bgSize.y });
        this.resolution = getResolutionVec3({ W: this.W, H: this.H });
        this.renderer.setSize(this.W, this.H);

        this.camera.aspect = this.W / this.H;
        this.camera.updateProjectionMatrix();

        this.orthoCamera.left = this.W / -2;
        this.orthoCamera.right = this.W / 2;
        this.orthoCamera.top = this.H / 2;
        this.orthoCamera.bottom = this.H / -2;
        this.orthoCamera.updateProjectionMatrix();

        this.resizeModel();
        this.resizeSurface();

    }
    resizeModel() {
        this.envFbo.setSize(
            this.W * this.resolution.z,
            this.H * this.resolution.z
        );
        this.quad.scale.set(this.W, this.H, 1);

        this.materialModel.uniforms.resolution.value = new THREE.Vector3(this.resolution.x * this.resolution.z, this.resolution.y * this.resolution.z, this.resolution.z);
        this.materialModel.uniforms.zPosition.value = this.getZmodel();
    }
    resizeSurface() {
        this.bufferA.resize({ x: this.resolution.x, y: this.resolution.y });
        this.bufferImage.resize({ x: this.resolution.x, y: this.resolution.y });
    }
    getZmodel() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        let z = 1;
        if (width > height) return z;
        if (width < 900) {
            z = 1.5 * 900 / width;
            if (z < 1.0) {
                z = 1.0;
            }
            if (z > 2.0) {
                z = 2.0;
            }
        }
        return z;
    }
}