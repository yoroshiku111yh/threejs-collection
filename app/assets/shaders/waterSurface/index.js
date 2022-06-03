import { ShaderMaterial } from 'three';
import vertexShader from './vertexShader.glsl';
import fragmentShader from './fragmentShader.glsl';

export default class ShaderWaterSurface extends ShaderMaterial {
    constructor(uniforms) {
        super({
            vertexShader,
            fragmentShader
        });
        this.uniforms = uniforms;
        this.transparent = true;
        this.DoubleSide = true;
        this.getUniforms = () => this.uniforms;
    }
}