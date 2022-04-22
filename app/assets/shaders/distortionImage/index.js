
import { ShaderMaterial } from 'three';
import vertexShader from './vertexShader.glsl';
import fragmentShader from './fragmentShader.glsl';

export default class DistortionImageMateria extends ShaderMaterial {
    constructor(uniforms) {
        super({
            vertexShader,
            fragmentShader
        });
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