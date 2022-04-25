import * as THREE from 'three';
import SimplexNoise from 'simplex-noise';
import Blob2dMaterial from '../../../shaders/blobBubble2d/index';

const srcTextureTest = "https://i.imgur.com/crl7JVm.jpeg";

export default class bubbleShader {
    constructor() {
        this.clock = new THREE.Clock();
        this.init();
    }
    init() {
        this.createBubbleMesh()
    }
}