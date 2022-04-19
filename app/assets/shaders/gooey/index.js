import { Clock, ShaderMaterial } from "three";
import vertexShader from './vertexShader.glsl';

export default class GooeyEffect extends ShaderMaterial {
    constructor(fragmentShader, uniforms) {
        super({
            vertexShader,
            fragmentShader
        });
        this.uniforms = {...uniforms,...{
            u_progressHover : { value : 0.0},
            u_progressClick: { value: 0.0 },
            u_alpha : { value : 1.0 },
            u_time : { value : new Clock().getElapsedTime() },
        }};
        this.transparent = true;
        this.defines = {
            PI: Math.PI,
            PR: window.devicePixelRatio.toFixed(1)
        }
        this.getUniform = () => this.uniforms;
    }
}