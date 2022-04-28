import * as THREE from 'three';
import Blob2dMaterial from '../../../shaders/blobBubble2d/index';
import fragmentShader from '../../../shaders/blobBubble2d/fragmentShaderBlob2d.glsl';
import { TweenMax, Sine } from 'gsap/gsap-core';
import { srcTextureBlank } from '../../ultilities/initialize';

export default class BubbleShader {
    constructor({ planeSize, objUniforms, moveTexture, clockDelta }) {
        this.clock = new THREE.Clock();
        this.clockDelta = clockDelta;
        this.textureMovingX = false;
        this.textureMovingY = false;
        this.directionX = 1;
        this.directionY = 1;
        this.planeSize = planeSize;
        this.objUniforms = objUniforms;
        this.moveTexture = moveTexture;
        this.introDone = false;
        this.init();
    }
    init() {
        this.createPlane();
    }
    setUniformMaterial(){
        this.uniforms = {
            uPlaneSize: {
                value: new THREE.Vector2(this.planeSize.width, this.planeSize.height)
            },
            uImageSize: {
                value: new THREE.Vector2(
                    this.objUniforms?.textureWidth || 1000, 
                    this.objUniforms?.textureWidth || 896)
            },
            uTime: {
                value: 0.0
            },
            uAlpha : {
                value : this.objUniforms.alpha
            },
            uRadius: {
                value: this.objUniforms.radius //0.5
            },
            uSpikes: {
                value: this.objUniforms.spikes //1.5
            },
            uTexture: {
                value: this.objUniforms.texture || new THREE.TextureLoader().load(srcTextureBlank),
            },
            uTexture2 : {
                value : null
            },
            isMouse : {
                value : false
            },
            uTextureMoveX : {
                value : 0.0
            },
            uTextureMoveY : {
                value : 0.0
            },
            uDisFactor : {
                value : 0.0
            }
        }
    }
    createPlane() {
        const geo = new THREE.PlaneGeometry(this.planeSize.width, this.planeSize.height, 1, 1);
        this.setUniformMaterial();
        const material = new Blob2dMaterial({
            uniforms: this.uniforms,
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
        this.animateMoveTexture();
    }
    setDirection(x, y){
        if(!this.moveTexture.direction) return;
        this.moveTexture.direction.x = x;
        this.moveTexture.direction.y = y;
    }
    animateMoveTexture(){
        if(!this.textureMovingX){
            this.textureMovingX = true;
            TweenMax.to(this.uniforms.uTextureMoveX, {
                value : this.moveTexture.randomXFn(this.moveTexture.direction.x),
                duration : 3,
                ease: Sine.easeInOut,
                onComplete: () => {
                    this.textureMovingX = false;
                }
            })
        }
        if(!this.textureMovingY){
            this.textureMovingY = true;
            TweenMax.to(this.uniforms.uTextureMoveY, {
                value : this.moveTexture.randomYFn(this.moveTexture.direction.y),
                duration : 3,
                ease: Sine.easeInOut,
                onComplete: () => {
                    this.textureMovingY = false;
                }
            })
        }
    }
    updateTexture(textPrev, textNext){
        if(textPrev){
            this.uniforms.uTexture.value = textPrev;
        }
        if(textNext){
            this.uniforms.uTexture2.value = textNext;
        }
    }
    setDisFactor(isOut = false){
        let disFactor = 0;
        if(isOut){
            disFactor = 1;
        }
        this.uniforms.uDisFactor.value = disFactor;
    }
    transitionIn(callback){
        TweenMax.to(this.uniforms.uDisFactor,{
            value : 1.0,
            duration : 0.25,
            ease : Sine.easeInOut,
            onComplete : () => {
                callback && callback();
            }
        })
    }
}