
import { ShaderMaterial } from 'three';
import vertexShader from './vertexShader.glsl';
import fragmentShaderDefault from './fragmentShader.glsl';
import fragmentShaderWithoutDisplacement from './fragmentShaderWithoutDisplacement.glsl';

export default class DistortionImageMateria extends ShaderMaterial {
    constructor(uniforms, isDisplacement) {
        super({
            vertexShader
        });
        this.fragmentShader = isDisplacement ? fragmentShaderDefault : fragmentShaderWithoutDisplacement;
        this.uniforms = {
            ...{
                dpr: {
                    type: 'f',
                    value: window.devicePixelRatio
                }
            }, ...uniforms
        };
        this.transparent = true;
        this.opacity = 1.0;
        this.getUniform = () => this.uniforms;
    }
}