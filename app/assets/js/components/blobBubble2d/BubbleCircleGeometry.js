import * as THREE from 'three';
import SimplexNoise from 'simplex-noise';
import Blob2dMaterial from '../../../shaders/blobBubble2d/index';
import fragmentShader from '../../../shaders/blobBubble2d/fragmentShaderBasic.glsl';

const srcTextureTest = "https://i.imgur.com/crl7JVm.jpeg";

export default class BubbleCircleGeometry {
    constructor({ speed = 5, processing = 1, spikes = 0.5 }) {
        this.speed = speed;
        this.processing = processing;
        this.spikes = spikes * processing;
        this.clock = new THREE.Clock();
        this.time = 0;
        this.multiSize = 1;
        this.simplex = new SimplexNoise();
        this.init();
    }
    init() {
        this.createBubbleMesh()
    }
    createBubbleMesh() {
        const geo = new THREE.CircleGeometry(1, 128, 6, 6.3);
        const material = new Blob2dMaterial({
            uniforms: {
                color1: {
                    value: new THREE.Color("#FE390C")
                },
                color2: {
                    value: new THREE.Color("#FACE40")
                },
                texture1 : {
                    value : new THREE.TextureLoader().load(srcTextureTest)
                }
            },
            fragmentShader : fragmentShader
        });
        this.mesh = new THREE.Mesh(geo, material);
    }
    getMesh() {
        return this.mesh;
    }
    update() {
        this.time += this.clock.getDelta() * 0.05 * this.speed * Math.pow(this.processing, 3);
        const { position } = this.mesh.geometry.attributes;
        for (let i = 0; i < position.count; i++) {
            const pos = new THREE.Vector3(
                position.getX(i),
                position.getY(i),
                position.getZ(i)
            )
            pos.normalize().multiplyScalar(this.multiSize + 0.3 * this.simplex.noise4D(pos.x * this.spikes, pos.y * this.spikes, pos.z * this.spikes + this.time, 3));
            position.setXYZ(i, pos.x, pos.y, pos.z);
        }
        this.mesh.geometry.attributes.position.needsUpdate = true;
    }
}