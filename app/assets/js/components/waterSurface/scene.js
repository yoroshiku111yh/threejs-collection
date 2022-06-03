import * as THREE from 'three';
import SceneBase from './../../ultilities/sceneBase';
import { getResolutionVec3 } from '../../ultilities/resolution';
import ShaderWaterSurface from './../../../shaders/waterSurface/index';
import { imgUrlBrick } from './../../ultilities/srcImgurl';
import { BufferManager, BufferShader } from './../../ultilities/buffer';

import fragmentBuffer from './../../../shaders/waterSurface/buffer.glsl';
import vertex from './../../../shaders/waterSurface/vertexShader.glsl';
import fragmentImage from './../../../shaders/waterSurface/fragmentShader.glsl';

export default class SceneWaterSurface extends SceneBase {
    constructor({ $container, size = {} }) {
        super($container, size.width, size.height);
        this.resolution = getResolutionVec3({ W: this.W, H: this.H });
        this.mouse = new THREE.Vector4();
        this.loader = new THREE.TextureLoader();
        this.bg = this.loader.load(imgUrlBrick);
        this.init();
    }
    init() {
        this.start();
        this.renderer.autoClear = false;
        this.initPerspectiveCamera();
        this.createBufferA();
        this.createBufferPlane();
        this.eventMouse();
        this.update();
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
            iFrame : {
                value : 0
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
                value: this.bg
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
    eventMouse(){
        this.container.addEventListener("mousemove", (e) => {
            this.mouse.setX(e.clientX);
            this.mouse.setY(this.H - e.clientY);
        });
        this.container.addEventListener("mousedown", (e) => {
            this.mouse.setZ(1);
        });
        this.container.addEventListener("mouseup", (e) => {
            this.mouse.setZ(0);
        })
    }
    updateCallback() {

        this.bufferA.uniforms.iTime.value += 0.01;

        this.bufferA.uniforms.iFrame.value += 1;

        this.bufferA.uniforms.iChannel0.value = this.bufferATarget.readBuffer.texture;

        this.bufferImage.uniforms.iChannel0.value = this.bufferATarget.readBuffer.texture;

        this.bufferATarget.render(this.bufferA.scene, this.camera);
        this.bufferImageTarget.render(this.bufferImage.scene, this.camera, true);

        this.renderedInCallBack = true;
    }
}