import * as THREE from 'three';
import SceneBase from './../../ultilities/sceneBase';
import ShaderSoapBubble from './../../../shaders/soapBubble/index';
import { getResolution } from './../../ultilities/resolution';

export default class SceneSoapBubble extends SceneBase {
    constructor({$container, size = {}, bannerTexSrc}){
        super($container, size.width, size.height);
        this.loader = new THREE.TextureLoader();
        this.bannerTex = this.loader.load(bannerTexSrc);
        this.init();
    }
    init(){
        this.start();
        this.mainScene.background = new THREE.Color( '#ff0000' );
        this.initCamera();
        this.createBuffer();
        this.createPlane();
        //this.createBanner();
        this.update();
    }
    initCamera(){
        this.camera = new THREE.OrthographicCamera(this.W / -2, this.W / 2, this.H / 2, this.H / -2, 0, 1000);
        this.mainScene.add(this.camera);
    }
    createBuffer(){
        this.bufferScene = new THREE.Scene();
        this.bufferTexture = new THREE.WebGLRenderTarget(this.W, this.H, {
            minFilter : THREE.LinearFilter, 
            magFilter : THREE.NearestFilter
        });
    }
    createBanner(){
        const geo = new THREE.PlaneGeometry(1, 1, 1, 1);
        console.log(this.bannerTex);
        const material = new THREE.MeshBasicMaterial( {map : this.bannerTex, side: THREE.DoubleSide} );
        this.banner = new THREE.Mesh(geo, material);
        this.banner.scale.set(this.W, this.H);
        this.mainScene.add(this.banner);
    }
    createPlane(){
        const geo = new THREE.PlaneGeometry(1, 1, 1, 1);
        const material = new ShaderSoapBubble({
            iTime : {
                value : 0.0
            },
            iTexture : {
                value : this.bannerTex
            },
            iResolution : {
                value : getResolution({ W : this.W, H : this.H })
            },
            iContainSize : {
                value : new THREE.Vector2(this.W, this.H)
            },
            iTextureSize : {
                value : new THREE.Vector2(1024, 768)
            }
        });
        this.uniforms = material.getUniform();
        this.plane = new THREE.Mesh(geo, material);
        this.plane.scale.set(this.W , this.H);
        this.mainScene.add(this.plane);
    }
    updateCallback(){
        // this.renderer.clear();
        this.uniforms.iTexture.value = this.bannerTex;
        this.uniforms.iTime.value += 0.02;
    }
}