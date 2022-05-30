
import { AddEquation, CustomBlending, OneFactor, OneMinusDstAlphaFactor, ShaderMaterial } from 'three';
import fragmentShader from './fragmentShader.glsl';
import vertexShader from './vertexShader.glsl';
export default class ShaderSoapBubble extends ShaderMaterial {
    constructor(uniforms) {
        super({
            vertexShader,
            fragmentShader
        });
        this.blending = CustomBlending;
        this.blendEquation = AddEquation;
        this.blendSrc = OneFactor;
        this.blendDst = OneMinusDstAlphaFactor;
        this.depthTest = true;
        this.depthWrite = false;
        this.uniforms = uniforms;
        this.transparent = true;
        this.getUniform = () => this.uniforms;
    }
}