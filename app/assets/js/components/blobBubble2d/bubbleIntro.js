import * as THREE from 'three';
import BubbleShader from './bubbleShader';
import { TweenMax, Back } from 'gsap/gsap-core';

export default class BubbleIntro extends BubbleShader {
    constructor({ planeSize, objUniforms, moveTexture, clockDelta }){
        super({ planeSize, objUniforms, moveTexture, clockDelta })
        this.animateIntroDone = false;
        this.init();
    }
    animationIntro({ radius = 0., duration = 0 }){
        if(!this.animateIntroDone){
            TweenMax.to(this.uniforms.uRadius, {
                value : radius,
                ease: Back.easeInOut,
                duration : duration
            });
            this.animateIntroDone = true;
        }
    }
}