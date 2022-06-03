
import { ShaderMaterial } from 'three';
import fragmentShader from './fragmentShader.glsl';
import vertexShader from './vertexShader.glsl';
export default class ShaderCrossfadeShader extends ShaderMaterial {
    constructor(uniforms) {
        super({
            vertexShader,
            fragmentShader
        });
        this.uniforms = uniforms;
        this.transparent = true;
        this.getUniform = () => this.uniforms;
    }
}