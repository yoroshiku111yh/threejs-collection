
import { ShaderMaterial } from 'three';
import vertexShader from './vertexShader.glsl';

export default class Blob2dMaterial extends ShaderMaterial{
    constructor({ uniforms, fragmentShader }){
        super({
            vertexShader,
            fragmentShader
        });
        this.uniforms = uniforms;
        this.getUniforms = () => this.uniforms;
    }
}