

#pragma glslify:radialRainbow=require('../helper/radialRainbow');
#pragma glslify:gradients=require('../helper/gradients');
#pragma glslify:borders=require('../helper/borders');
uniform vec2 uResolution;
uniform float uTick;
uniform sampler2D uMask1;
uniform sampler2D uMask2;
uniform bool isRefract;

uniform float lenghtDisplacement;
uniform float lengthMaximum;
uniform vec3 uPos;

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
    vec2 posColor = vec2(0.0);

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
    //////////////
    vec4 col1 = vec4(gradients(3, vUv, uTick), 1.0);
    vec4 col2 = vec4(gradients(1, vUv, uTick), 1.0);
    vec4 col;
    //////////////

    vec4 mask1 = texture2D(uMask1, newUv);
    vec4 mask2 = texture2D(uMask2, newUv);

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
        col = col2;
        col.a = mask2.r;
    }
    if(boxSide == 3.) {
        col = col1;
        col.a = mask1.r;
    }
    if(boxSide == 4.) {
        col = col1;
        col.a = mask1.r;
    }
    if(boxSide == 5.) {
        col = col2;
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