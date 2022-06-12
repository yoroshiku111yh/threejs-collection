
import { ShaderMaterial, FrontSide, BackSide, DoubleSide } from 'three';
import fragmentShader from './fragmentShader.glsl';
import vertexShader from './vertexShader.glsl';
export default class ShaderAppleAvenue extends ShaderMaterial {
    constructor(uniforms) {
        super({
            vertexShader,
            fragmentShader
        });
        this.uniforms = uniforms;
        this.transparent = true;
        this.side = DoubleSide;
        this.getUniform = () => this.uniforms;
    }
}