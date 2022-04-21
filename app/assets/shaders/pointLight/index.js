import { ShaderMaterial } from 'three';
import vertexShader from './vertexShader.glsl';
import fragmentShader from './fragmentShader.glsl';

export default class PointLightMaterial extends ShaderMaterial{
    constructor(uniforms){
        super({
            vertexShader,
            fragmentShader
        });
        this.uniforms = uniforms;
        this.lights = true;
        this.getUniforms = () => this.uniforms;
    }
}