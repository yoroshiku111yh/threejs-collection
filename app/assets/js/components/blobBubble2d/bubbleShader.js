import * as THREE from 'three';
import Blob2dMaterial from '../../../shaders/blobBubble2d/index';
import fragmentShader from '../../../shaders/blobBubble2d/fragmentShaderBlob2d.glsl';

const srcTextureTest = "https://i.imgur.com/crl7JVm.jpeg";

export default class BubbleShader {
    constructor() {
        this.clock = new THREE.Clock();
        this.init();
    }
    init() {
        this.createPlane();
    }
    createPlane() {
        const geo = new THREE.PlaneGeometry(2, 2, 1, 1);
        const material = new Blob2dMaterial({
            uniforms: {
                uPlaneSize: {
                    value: new THREE.Vector2(2, 2)
                },
                uImageSize: {
                    value: new THREE.Vector2(1920, 843)
                },
                uTime: {
                    value: 0.0
                },
                uRadius: {
                    value: 0.5
                },
                uSpikes: {
                    value: 1.5
                },
                uTexture: {
                    value: new THREE.TextureLoader().load(srcTextureTest),
                },
                isMouse : {
                    value : false
                }
            },
            fragmentShader: fragmentShader
        });
        this.uniforms = material.getUniforms();
        this.mesh = new THREE.Mesh(geo, material);
    }
    getMesh() {
        return this.mesh;
    }
    update(){
        this.uniforms.uTime.value += this.clock.getDelta();
    }
}