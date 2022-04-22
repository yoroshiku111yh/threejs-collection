
import * as THREE from 'three';
import DistortionImageMateria from './../../../shaders/distortionImage/index';
import { TweenMax } from 'gsap/gsap-core';

export default class MeshComponent {
    constructor(data) {
        this.data = data;
        this.loader = new THREE.TextureLoader();
        this.init();
    }
    init() {
        const { texture1, texture2 } = this.loadImageTexture();
        this.texture1 = texture1;
        this.texture2 = texture2;

        this.disp = this.loadDisplaceImage();

        const { a1, a2 } = this.getAspect();
        this.aspect1 = a1;
        this.aspect2 = a2;
    }
    loadVideoTexture() {
        // will update later
    }
    loadImageTexture() {
        const { image1, image2 } = this.data
        const tex1 = this.loader.load(image1);
        const tex2 = this.loader.load(image2);

        tex1.magFilter = tex2.magFilter = THREE.LinearFilter;
        tex1.minFilter = tex2.minFilter = THREE.LinearFilter;

        return {
            texture1: tex1,
            texture2: tex2
        }
    }
    loadDisplaceImage() {
        const { displacementImage } = this.data;
        const disp = this.loader.load(displacementImage);
        disp.magFilter = disp.minFilter = THREE.LinearFilter;
        return disp;
    }
    getAspect() {
        let a1, a2;
        const { parent, imagesRatio } = this.data;
        if (parent.offsetHeight / parent.offsetWidth < imagesRatio) {
            a1 = 1;
            a2 = parent.offsetHeight / parent.offsetWidth / imagesRatio;
        }
        else {
            a1 = (parent.offsetWidth / parent.offsetHeight) * imagesRatio;
            a2 = 1;
        }
        return {
            a1: a1,
            a2: a2
        }
    }
    getMaterial() {
        const { intensity1, intensity2, intensity, angle1, angle2, parent } = this.data;
        const material = new DistortionImageMateria({
            intensity1: {
                type: 'f',
                value: intensity1 || intensity
            },
            intensity2: {
                type: 'f',
                value: intensity2 || intensity
            },
            dispFactor: {
                type: 'f',
                value: 0.0
            },
            angle1: {
                type: 'f',
                value: angle1
            },
            angle2: {
                type: 'f',
                value: angle2
            },
            texture1: {
                type: 't',
                value: this.texture1
            },
            texture2: {
                type: 't',
                value: this.texture2
            },
            disp: {
                type: 't',
                value: this.disp
            },
            res: {
                type: 'vec4',
                value: new THREE.Vector4(parent.offsetWidth, parent.offsetHeight, this.aspect1, this.aspect2)
            },
            dpr: {
                type: 'f',
                value: window.devicePixelRatio
            }
        })
        return material;
    }
    createMesh() {
        const { parent } = this.data;
        const geo = new THREE.PlaneBufferGeometry(parent.offsetWidth, parent.offsetHeight, 1);
        this.material = this.getMaterial();
        this.uniforms = this.material.getUniform();
        return new THREE.Mesh(geo, this.material);
    }
    transitionIn() {
        const { speedIn, easing } = this.data;
        TweenMax.to(this.uniforms.dispFactor, speedIn, {
            value: 1,
            ease: easing,
        });
    }
}