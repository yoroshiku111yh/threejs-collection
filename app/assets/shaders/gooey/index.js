import { ShaderMaterial } from "three";
import vertexShader from './vertexShader.glsl';

export default class GooeyEffect extends ShaderMaterial {
    constructor(fragmentShader, uniforms) {
        super({
            vertexShader,
            fragmentShader
        });
        this.uniforms = uniforms;
        this.transparent = true;
        this.defines = {
            PI: Math.PI,
            PR: window.devicePixelRatio.toFixed(1)
        }
    }
}