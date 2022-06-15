

#pragma glslify:radialRainbow=require('../../helper/radialRainbow');
#pragma glslify:gradients=require('../../helper/gradients');
#pragma glslify:borders=require('../../helper/borders');
uniform vec2 uResolution;
uniform float uTick;
uniform bool isRefract;

uniform vec3 uPos;

const float PI2 = 6.28318530718;

varying vec3 worldNormal;
varying vec3 eyeVector;
varying vec2 vUv;

float Fresnel(vec3 eyeVector, vec3 worldNormal) {
    return pow(1.0 + dot(eyeVector, worldNormal), 1.0);
}

void main() {
    vec2 st = gl_FragCoord.xy / uResolution.xy;
    vec3 normal = worldNormal;
    vec2 posColor = vec2(0.5);
    float f = Fresnel(eyeVector, normal);

    //vec4 borderColor = vec4(gradients(1, vUv, uTick*1.15), 1.0);
    vec4 borderColor = radialRainbow(st, uTick, posColor);
    float depth = clamp(smoothstep(-1.0, 1.0, 1.0), 0.6, 0.9);
    borderColor *= vec4(borders(vUv, 0.012)*depth);

    //vec4 col = vec4(gradients(1, vUv, uTick*1.15), 0.045*f + 0.01);
    vec4 col = radialRainbow(st, uTick, posColor);
    col.a = 0.045*f + 0.01;
    col.rgb = mix(col.rgb, vec3(0.75), 0.15);

    gl_FragColor = borderColor + col;
}