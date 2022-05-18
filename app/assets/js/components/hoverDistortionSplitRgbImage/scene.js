
import * as THREE from 'three';
import HoverDistortionRgbEffect from '../../../shaders/hoverDistortionRgbSplitImage';
import SceneBase from './../../ultilities/sceneBase';

const testImageSrc = document.getElementById("test-img").src;
function lerp(start, end, t){
    //https://www.geeksforgeeks.org/p5-js-lerp-function/
    return start * ( 1 - t ) + end * t;
}

export default class SceneHoverDistortionImage extends SceneBase{
    constructor({$container, size}){
        super($container, size.width, size.height);
        this.sizePlane = { w : 250, h : 350 };
        this.updateSizePlane = { w : 250, h : 350 };
        this.offset = new THREE.Vector2();
        this.mouse = new THREE.Vector2();
        this.textureTest = new THREE.TextureLoader().load(testImageSrc);
        this.uniforms = {
            uAlpha : {
                value : 0.0
            },
            uOffset : {
                value : new THREE.Vector2()
            },
            uTexture : {
                value : this.textureTest
            },
            uContainSize : {
                value : new THREE.Vector2(250,350)
            },
            uTextureSize : {
                value : new THREE.Vector2(768, 1024)
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
        if(this.isHover){
            this.sizePlane.w = lerp(this.sizePlane.w, this.updateSizePlane.w, 0.1);
            this.sizePlane.h = lerp(this.sizePlane.h, this.updateSizePlane.h, 0.1);
            this.planeMesh.scale.set(this.sizePlane.w, this.sizePlane.h, 1);
            const textureCover = this.updateSizeTexture({
                plane : this.sizePlane,
                img : {
                    w : 768,
                    h : 1024
                },
                texture : this.textureTest
            });
            this.uniforms.uTexture.value = textureCover;
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
    }
    onMouseHover(){
        $('.js-hover').on("mouseover", (e) => {
            const _this = e.currentTarget;
            const sizeMesh = JSON.parse(_this.dataset.size);
            this.updateSizePlane = sizeMesh;
            this.isHover = true;
        })
    }
    onMouseOut(){
        $('.js-hover').on("mouseout", (e) => {
            this.isHover = false;
        })
    }

}   