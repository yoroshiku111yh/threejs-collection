

#pragma glslify:radialRainbow=require('../../helper/radialRainbow');
#pragma glslify:gradients=require('../../helper/gradients');
#pragma glslify:borders=require('../../helper/borders');
#pragma glslify:causticAmoebas=require('../../helper/caustic/causticAmoebas');
#pragma glslify:causticCrystal=require('../../helper/caustic/causticCrystal');
#pragma glslify:pointLightPhysic=require('../../helper/light/pointLightPhysic');
#pragma glslify:solubleRainbow=require('../../helper/caustic/solubleRainbow');
#pragma glslify:turboColorMapInit=require('../../helper/caustic/turboColorMap');
#pragma glslify:blobRainbow=require('../../helper/caustic/blobRainbow');
#pragma glslify:tileableWater=require('../../helper/caustic/causticTileableWater');

uniform vec3 uResolution;
uniform float uTick;
uniform bool isUseEnvMap;

uniform vec3 uPos;

const float PI2 = 6.28318530718;

varying vec3 worldNormal;
varying vec3 eyeVector;
varying vec2 vUv;

varying float vSides;

//uniform sampler2D uMapTexture;
uniform vec2 uPositionLight;
uniform float uLightPower;

uniform samplerCube uEnvMap;
uniform float uOpacity;

uniform int uCausticType;

float Fresnel(vec3 eyeVector, vec3 worldNormal) {
    return pow(1.0 + dot(eyeVector, worldNormal), 1.0);
}

void main() {
    vec2 st = gl_FragCoord.xy / uResolution.xy;
    vec2 st2 = st;
    vec3 normal = worldNormal;
    vec2 posColor = vec2(0.5);
    float f = Fresnel(eyeVector, normal);

    vec3 refracted = refract(eyeVector, normal, 1.0 / 1.0);
    st += refracted.xy;

    //vec4 borderColor = vec4(gradients(1, vUv, uTick*1.15), 1.0);
    vec4 borderColor = radialRainbow(st, uTick, posColor);
    float depth = clamp(smoothstep(-1.0, 1.0, 1.0), 0.6, 0.9);
    borderColor *= vec4(borders(vUv, 0.012)*depth);
    float opacityOfFresnel = uOpacity/100.*f + 0.01;
    //
    vec2 thetaphi = ((st * 2.0) - vec2(1.0)) * vec2(3.1415926535897932384626433832795, 1.5707963267948966192313216916398); 
    vec3 rayDirection = vec3(cos(thetaphi.y) * cos(thetaphi.x), sin(thetaphi.y), cos(thetaphi.y) * sin(thetaphi.x));
	vec4 _cubeMap = textureCube(uEnvMap, rayDirection);
    _cubeMap.a = opacityOfFresnel;
    /////
    vec4 col;
    if(uCausticType == 0){
        col = causticCrystal(uResolution, uTick*5., gl_FragCoord.xy);
    }
    if(uCausticType == 1){
        col = causticAmoebas(st2, uTick*5.);
    }
    if(uCausticType == 2){
        col = solubleRainbow(gl_FragCoord.xy, uResolution, uTick*5.);
    }
    if(uCausticType == 3){
        col = turboColorMapInit(st2, uTick*10.);
    }
    if(uCausticType == 4){
        vec3 col1 = blobRainbow(st, uTick*5., vec2(0.25, 0.25), 10.);
        col1 = 0.75 - col1;
        col = vec4(col1, 1.0);
    }
    if(uCausticType == 5){
        float tick = uTick * 5.;
        vec3 bgColor = vec3(sin(0.57 + 7. + tick * .7), sin(0.59 - 15. - tick * .65), sin( 0.6 + tick * .9)) * 0.5;
        vec3 col1 = tileableWater(st2, tick, uResolution.xy, bgColor);
        col = vec4(col1, 1.0);
    }
    col.a = opacityOfFresnel;
    //
    vec2 positionLight = st - uPositionLight;
    vec4 pointLight1 = pointLightPhysic(positionLight, uTick*5., uLightPower/ 100.);
    ///
    if(isUseEnvMap){
        gl_FragColor = borderColor + _cubeMap;
    }
    else{
        gl_FragColor = vec4(pointLight1.rgb, pointLight1.a) + borderColor + col;
    }
}