

#pragma glslify:radialRainbow=require('../helper/radialRainbow');
#pragma glslify:gradients=require('../helper/gradients');
#pragma glslify:gradientMix2Colors=require('../helper/gradientMix2Colors');
#pragma glslify:borders=require('../helper/borders');
uniform vec3 uResolution;
uniform float uTick;
uniform sampler2D uMask1;
uniform sampler2D uMask2;
uniform bool isRefract;

uniform float lenghtDisplacement;
uniform float lengthMaximum;
uniform vec3 uPos;
uniform float uBounce;

uniform vec3 colorSide1[2];
uniform vec3 colorSide2[2];
uniform vec3 colorSide3[2];
uniform vec3 colorSide4[2];
uniform vec3 colorSide5[2];
uniform vec3 colorSide6[2];

const float PI2 = 6.28318530718;

varying vec3 worldNormal;
varying vec3 eyeVector;
varying vec2 vUv;
varying float vSides;
varying vec4 v_worldPostion;

float Fresnel(vec3 eyeVector, vec3 worldNormal) {
    return pow(1.0 + dot(eyeVector, worldNormal), 3.0);
}

void main() {
    float a = 0.85;
    vec2 st = gl_FragCoord.xy / uResolution.xy;
    float boxSide = floor(vSides + 0.1);
    vec3 normal = worldNormal;

    if(isRefract) {
        vec3 refracted = refract(eyeVector, normal, 1.0 / 1.0);
        st += refracted.xy;
    }

    vec3 frontFace = vec3(0, 1, 1);
    vec3 rightFace = vec3(0, 0, 1);
    vec3 backFace = vec3(0, 1, 0);
    vec3 leftFace = vec3(0, 1, 1);
    vec3 topFace = vec3(1, 0, 0);
    vec3 bottomFace = vec3(1, 0, 1);

    float f = Fresnel(eyeVector, normal);
    //////////////
    vec2 posLogoColor = vec2(0.25);
    ///////////////

    vec2 toCenter = vUv ;
    float angle = (atan(toCenter.y, toCenter.x) / PI2) + 0.5;
    float u_displacementLength = lenghtDisplacement / 100.;
    float displacement = borders(vUv, u_displacementLength) + borders(vUv, u_displacementLength * 2.143) * 0.3;
    vec4 displace = vec4(angle, displacement, 0.0, 1.0);
    float maximum = lengthMaximum / 1000.;
    float displace_k = displace.g * maximum;
    vec2 newUv = st; /// st - uPos*0.4
    newUv += displace_k;
    newUv += displace_k;
    /////
    float speed = 4.;
    vec4 col1 = vec4(gradientMix2Colors(vUv, uTick*speed, colorSide1[0], colorSide1[1], posLogoColor), 1.0);
    vec4 col2 = vec4(gradientMix2Colors(vUv, uTick*speed, colorSide2[0], colorSide2[1], posLogoColor), 1.0);
    vec4 col3 = vec4(gradientMix2Colors(vUv, uTick*speed, colorSide3[0], colorSide3[1], posLogoColor), 1.0);
    vec4 col4 = vec4(gradientMix2Colors(vUv, uTick*speed, colorSide4[0], colorSide4[1], posLogoColor), 1.0);
    vec4 col5 = vec4(gradientMix2Colors(vUv, uTick*speed, colorSide5[0], colorSide5[1], posLogoColor), 1.0);
    vec4 col6 = vec4(gradientMix2Colors(vUv, uTick*speed, colorSide6[0], colorSide6[1], posLogoColor), 1.0);
    vec4 col;
    //////////////

    vec4 mask1 = texture2D(uMask1, newUv + vec2(0.0, uBounce));
    vec4 mask2 = texture2D(uMask2, newUv + + vec2(0.0, uBounce));

    // ////////////
    if(boxSide == 0.) {
        col = col1;
        col.a = mask1.r;
    }
    if(boxSide == 1.) {
        col = col2;
        col.a = mask2.r;
    }
    if(boxSide == 2.) {
        col = col3;
        col.a = mask2.r;
    }
    if(boxSide == 3.) {
        col = col4;
        col.a = mask1.r;
    }
    if(boxSide == 4.) {
        col = col5;
        col.a = mask1.r;
    }
    if(boxSide == 5.) {
        col = col6;
        col.a = mask2.r;
    }
    col.rgb = mix(col.rgb, vec3(0.0), f);
    if(f > 1.0) {
        discard;
    }
    if(col.a < 0.5) {
        discard;
    }
    gl_FragColor = col;
}