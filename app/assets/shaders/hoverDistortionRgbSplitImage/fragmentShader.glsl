#pragma glslify:cover=require('../helper/cover');

uniform sampler2D uTexture;
uniform float uAlpha;
uniform vec2 uOffset;

uniform vec2 uContainSize;
uniform vec2 uTextureSize;
uniform float uDisFactor;

varying vec2 vUv;

vec3 rgbShift(sampler2D textureImage, vec2 uv, vec2 offset){
    float r = texture2D(textureImage, uv + offset).r;
    vec2 gb = texture2D(textureImage, uv).gb;
    return vec3(r, gb);
}

void main() {
    vec2 coverUv = cover(vUv, uContainSize, uTextureSize);
    vec2 translate2d = vec2(0.0);
    vec2 myUv = coverUv + translate2d; 
    vec3 color = rgbShift(uTexture, myUv, uOffset);
    gl_FragColor = vec4(color, uAlpha);
}
