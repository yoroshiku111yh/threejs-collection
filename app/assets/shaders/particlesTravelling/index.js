import { AdditiveBlending, ShaderMaterial } from 'three';
import vertexShader from './vertexShader.glsl';
import fragmentShader from './fragmentShader.glsl';

export default class ShaderParticlesTravelling extends ShaderMaterial {
    constructor(uniforms) {
        super({
            vertexShader,
            fragmentShader
        });
        this.uniforms = uniforms;
        this.transparent = true;
        this.DoubleSide = true;
        this.depthWrite = true;
        this.blending = AdditiveBlending;
        this.getUniforms = () => this.uniforms;
    }
}