#pragma glslify:cover=require('../helper/cover');

uniform sampler2D uTexture;
uniform float uAlpha;
uniform vec2 uOffset;

uniform vec2 uContainSize;
uniform vec2 uTextureSize;

varying vec2 vUv;

float rectShape(vec2 position, vec2 scale){
    scale = vec2(0.5) - scale * 0.5;
    vec2 shaper = vec2(step(scale.x, position.x), step(scale.y, position.y));
    shaper *= vec2(step(scale.x, 1.0 - position.x), step(scale.y, 1.0 - position.y));
    return shaper.x * shaper.y;
}

void main() {
    vec2 coverUv = cover(vUv, uContainSize, uTextureSize);
    vec2 translate2d = vec2(0.0);
    vec2 myUv = coverUv + translate2d; 
    vec4 color = texture2D(uTexture, myUv);

    gl_FragColor = color;
    gl_FragColor.a = uAlpha;
}