import * as THREE from 'three';
import SceneBase from './../../ultilities/sceneBase';
import ShaderMagicMorphingCube from './../../../shaders/magic-morphing-cube/index';

/// FAIL RESEARCH 
export default class SceneMagicMorphCube extends SceneBase {
    constructor({ $container, size, texSrc1, texSrc2 }) {
        super($container, size.width, size.height);
        this.loader = new THREE.TextureLoader();
        this.texSrc1 = texSrc1;
        this.texSrc2 = texSrc2;
        this.init();
    }
    init() {
        this.start();
        this.initOrthographicCamera();
        this.setTextures({
            texSrc1: this.texSrc1,
            texSrc2: this.texSrc2
        });
        this.createPlane();
        this.update();
    }
    createPlane() {
        const geo = new THREE.PlaneGeometry(1, 1, 1, 1);
        const material = new ShaderMagicMorphingCube({
            iTime: {
                value: 0.0
            },
            iChannel1 : {
                value : this.text1
            },
            iChannel0 : {
                value : this.text2
            }

        });
        this.uniforms = material.getUniforms();
        this.plane = new THREE.Mesh(geo, material);
        this.plane.scale.set(this.W, this.H);
        this.plane.position.set(0, 0, 0);
        this.mainScene.add(this.plane);
    }
    setTextures({ texSrc1, texSrc2 }) {
        this.text1 = this.loader.load(texSrc1);
        this.text2 = this.loader.load(texSrc2);
    }
    updateCallback(){
        this.uniforms.iTime.value += 0.01;
    }
}