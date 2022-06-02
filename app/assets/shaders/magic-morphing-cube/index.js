import { ShaderMaterial } from 'three';
import vertexShader from './vertexShader.glsl';
import fragmentShader from './fragmentShader.glsl';

export default class ShaderMagicMorphingCube extends ShaderMaterial {
    constructor(uniforms) {
        super({
            vertexShader,
            fragmentShader
        });
        this.uniforms = uniforms;
        this.transparent = true;
        this.getUniforms = () => this.uniforms;
    }
}