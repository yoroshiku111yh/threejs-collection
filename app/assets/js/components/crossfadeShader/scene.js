import * as THREE from 'three';
import SceneBase from './../../ultilities/sceneBase';
import ShaderCrossfadeShader from './../../../shaders/crossfadeShader/index';
import { imgUrlDryWall, imgUrlBrick, imgUrlMetal } from './../../ultilities/srcImgurl';
import { getResolutionWithoutImageAspect } from '../../ultilities/resolution';

export default class SceneCrossfadeShader extends SceneBase {
    constructor({$container, size = {}}){
        super($container, size.width, size.height);
        this.loaderTexture = new THREE.TextureLoader();
        this.init();
    }
    init(){
        this.start();
        this.renderer.setClearColor("#686663");
        this.initPerspectiveCamera();
        this.createModel();
        this.update();
    }
    createModel(){
        const geo = new THREE.IcosahedronGeometry(1, 0);
        const mask = this.loaderTexture.load(imgUrlDryWall);
        const envMap = this.loaderTexture.load(imgUrlBrick);
        const envMap2 = this.loaderTexture.load(imgUrlMetal);
        const material = new ShaderCrossfadeShader({
            envMap : {
                value : envMap
            },
            envMap2 : {
                value : envMap2
            },
            maskTex : {
                value : mask
            },
            resolution : {
                value : getResolutionWithoutImageAspect({ W : this.W , H : this.H})
            },
            ior : {
                value : 0.98
            },
            uTime : {
                value : 0.0
            }
        });
        this.uniforms = material.getUniform();
        this.model = new THREE.Mesh(geo, material);
        this.mainScene.add(this.model);
    }
    updateCallback(){
        this.model.rotation.x += 0.005;
        this.model.rotation.y += 0.005;
        this.uniforms.uTime.value += 0.01;
    }
}