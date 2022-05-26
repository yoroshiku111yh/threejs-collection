
import * as THREE from 'three';
import { TweenMax } from 'gsap/gsap-core';
import HoverDistortionRgbEffect from '../../../shaders/hoverDistortionRgbSplitImage';
import SceneBase from './../../ultilities/sceneBase';

const testImageSrc = document.getElementById("test-img").src;
const testImageSrc2 = "https://i.imgur.com/LY4VlUM.jpeg";
function lerp(start, end, t){
    //https://www.geeksforgeeks.org/p5-js-lerp-function/
    return start * ( 1 - t ) + end * t;
    // functional same tweenmax gsap
}

export default class SceneHoverDistortionImage extends SceneBase{
    constructor({$container, size}){
        super($container, size.width, size.height);
        this.loader = new THREE.TextureLoader();
        this.sizePlane = { w : 250, h : 350 };
        this.updateSizePlane = { w : 250, h : 350 };
        this.offset = new THREE.Vector2();
        this.mouse = new THREE.Vector2();
        this.textureHover = this.loader.load(testImageSrc2);
        this.uniforms = {
            uAlpha : {
                value : 0.0
            },
            uOffset : {
                value : new THREE.Vector2()
            },
            uTexture : {
                value : this.textureHover
            },
            uDisFactor : {
                value : 0.0
            },
            uContainSize : {
                value : new THREE.Vector2(this.sizePlane.w, this.sizePlane.h)
            },
            uTextureSize : {
                value : new THREE.Vector2(768, 1024)
            },
            uTextureUrl : {
                value : testImageSrc2
            }
        };
        this.perspective = 1000;
        this.minPerspective = 0.1;
        this.maxPerspective = 1000;
        this.isHover = false;
        this.init();
    }
    init(){
        this.start();
        this.initCamera();
        /////////
        this.createPlaneMesh();
        this.mainScene.add(this.planeMesh);
        /////////
        this.update();
        this.events();
    }
    initCamera(){
        let fov = (180 * (2 * Math.atan(this.H / 2 / this.perspective))) / Math.PI;
        this.camera = new THREE.PerspectiveCamera(fov, this.W/ this.H, this.minPerspective, this.maxPerspective);
        this.camera.position.set(0, 0 , this.perspective);
    }
    createPlaneMesh(){
        const geo = new THREE.PlaneGeometry(1, 1 ,20, 20);
        const mat = new HoverDistortionRgbEffect(this.uniforms);
        //this.uniforms = mat.getUniform();
        this.planeMesh = new THREE.Mesh(geo, mat);
        this.planeMesh.scale.set(this.sizePlane.w, this.sizePlane.h, 1);
        this.planeMesh.position.set(this.offset.x, this.offset.y, 0);
    }
    onMouseMove(){
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        })
    }
    updateCallback(){
        this.offset.x = lerp(this.offset.x, this.mouse.x, 0.1);
        this.offset.y = lerp(this.offset.y, this.mouse.y, 0.1);
        this.planeMesh.position.set(this.offset.x - this.W/2, -this.offset.y + this.H/2, 0);
        this.uniforms.uOffset.value.x = (this.mouse.x - this.offset.x)* 0.0005;
        this.uniforms.uOffset.value.y = (this.mouse.y - this.offset.y)* 0.0005;
        if(this.isHover){
            this.sizePlane.w = lerp(this.sizePlane.w, this.updateSizePlane.w, 0.1);
            this.sizePlane.h = lerp(this.sizePlane.h, this.updateSizePlane.h, 0.1);
            this.planeMesh.scale.set(this.sizePlane.w, this.sizePlane.h, 1);
            this.uniforms.uContainSize.value = new THREE.Vector2(this.sizePlane.w, this.sizePlane.h);
        }
    }
    updateSizeTexture({plane, img, texture}){
        texture.matrixAutoUpdate = false;
        let aspect = plane.w / plane.h;
        let imageAspect = texture.image.width / texture.image.height;
        if(aspect < imageAspect){
            texture.matrix.setUvTransform(0, 0, aspect / imageAspect, 1, 0, 0.5, 0.5);
        }
        else{
            texture.matrix.setUvTransform( 0, 0, 1, imageAspect / aspect, 0, 0.5, 0.5 );
        }
        return texture;
    }
    events(){
        this.onMouseMove();
        this.onMouseHover();
        this.onMouseOut();
    }
    onMouseHover(){
        $('.js-hover').on("mouseover", (e) => {
            const _this = e.currentTarget;
            const sizeMesh = JSON.parse(_this.dataset.size);
            const textureMesh = this.loader.load(_this.dataset.img);

            if(this.uniforms.uTextureUrl.value == _this.dataset.img) return;

            this.uniforms.uTextureUrl.value = _this.dataset.img;
            this.uniforms.uTexture.value = textureMesh;
            this.updateSizePlane = sizeMesh;
            this.isHover = true;
            this.uniforms.uAlpha.value = 0;
            TweenMax.to(this.uniforms.uAlpha, 0.35, {
                value : 1.0
            });
        })
    }
    onMouseOut(){
        $('.js-hover').on("mouseout", (e) => {
            this.isHover = false;
            this.uniforms.uTextureUrl.value = null;
            TweenMax.to(this.uniforms.uAlpha, 0.35, {
                value : 0.0
            });
        })
    }

}   