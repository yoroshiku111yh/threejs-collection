

#pragma glslify:radialRainbow=require('../../helper/radialRainbow');
#pragma glslify:borders=require('../../helper/borders');
uniform vec2 uResolution;
uniform float uTick;
uniform bool isRefract;

const float PI2 = 6.28318530718;

varying vec3 worldNormal;
varying vec3 eyeVector;
varying vec2 vUv;

float Fresnel(vec3 eyeVector, vec3 worldNormal) {
    return pow(1.0 + dot(eyeVector, worldNormal), 3.0);
}

void main() {
    vec2 st = gl_FragCoord.xy / uResolution.xy;
    vec2 posColor = vec2(0.0);
    vec4 borderColor = radialRainbow(st, uTick, posColor);
    float depth = clamp(smoothstep(-1.0, 1.0, 0.15), 0.6, 0.9);
    borderColor *= vec4(borders(vUv, 0.02)) * depth;

    vec3 normal = worldNormal;

    if(isRefract) {
        vec3 refracted = refract(eyeVector, normal, 1.0 / 1.0);
        st += refracted.xy;
    }
    vec4 col = radialRainbow(st, uTick*1.5, posColor);
    float f = Fresnel(eyeVector, normal);
    col.rgb = mix(col.rgb, vec3(0.0), f*0.025);
    gl_FragColor = borderColor + vec4(col.rgb, f*0.025);
}