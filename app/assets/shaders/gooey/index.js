import { ShaderMaterial } from "three";
import vertexShader from './vertexShader.glsl';

export default class GooeyEffect extends ShaderMaterial {
    constructor(fragmentShader, options){
        super({
            vertexShader,
            fragmentShader
        });
        this.uniforms = options
    }
}