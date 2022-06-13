

#pragma glslify:radialRainbow=require('../helper/radialRainbow');
#pragma glslify:borders=require('../helper/borders');
uniform vec2 uResolution;
uniform float uTick;
uniform sampler2D uMask1;
uniform sampler2D uMask2;
uniform bool isRefract;

uniform float lenghtDisplacement;

const float PI2 = 6.28318530718;

varying vec3 worldNormal;
varying vec3 eyeVector;
varying vec2 vUv;
varying float vSides;

float Fresnel(vec3 eyeVector, vec3 worldNormal) {
    return pow(1.0 + dot(eyeVector, worldNormal), 3.0);
}

void main() {
    float a = 0.85;
    vec2 st = gl_FragCoord.xy / uResolution.xy;
    float boxSide = floor(vSides + 0.1);
    vec3 normal = worldNormal;

    // sample backface data from texture
	//vec3 backfaceNormal = texture2D(backFaceMap, st).rgb;

	// combine backface and frontface normal
	//vec3 normal = worldNormal * (1.0 - a) - backfaceNormal * a;

    if(isRefract) {
        vec3 refracted = refract(eyeVector, normal, 1.0 / 1.0);
        st += refracted.xy*lenghtDisplacement; // 0.0 - 1.0
    }
    vec4 mask1 = texture2D(uMask1, st);
    vec4 mask2 = texture2D(uMask2, st);

    vec3 frontFace = vec3(0, 1, 1);
    vec3 rightFace = vec3(0, 0, 1);
    vec3 backFace = vec3(0, 1, 0);
    vec3 leftFace = vec3(0, 1, 1);
    vec3 topFace = vec3(1, 0, 0);
    vec3 bottomFace = vec3(1, 0, 1);



    float f = Fresnel(eyeVector, normal);
    //////////////
    vec2 posColor = vec2(0.0);
    vec4 col = radialRainbow(st, uTick, posColor);
    ////////////
    if(boxSide == 0.){
        col.a = mask1.r;
    }
    if(boxSide == 1.){
        col.a = mask2.r ;
    }
    if(boxSide == 2.){
        col.a = mask2.r;
    }
    if(boxSide == 3.){
        col.a = mask1.r;
    }
    if(boxSide == 4.){
        col.a= mask1.r;
    }
    if(boxSide == 5.) {
        col.a = mask2.r;
    }
    col.rgb = mix(col.rgb, vec3(0.0), f);
    if(f > 1.0){
        discard;
    }
    if(col.a < 0.5){
        discard;
    }
    gl_FragColor = col;
}