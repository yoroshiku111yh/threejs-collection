#pragma glslify:snoise3=require('glsl-noise/simplex/3d')
#pragma glslify:circle=require('../helper/circle');
#pragma glslify:map=require('../helper/map');
#pragma glslify:cover=require('../helper/cover');

uniform vec3 uColor;
uniform vec2 uPlaneSize;
uniform vec2 uImageSize;
uniform float uTextureMoveX;
uniform float uTextureMoveY;
uniform float uMouseRadius;
uniform float uTime;
uniform sampler2D uTexture;
uniform sampler2D uTexture2;
uniform float uSpikes;
uniform float uRadius;
uniform float uAlpha;
uniform float uDisFactor;

uniform bool isMouse;
uniform vec2 uMousePos;

varying vec2 vUv;

vec4 mouseGooey(in vec4 color, in bool isMouse, in vec2 uv, in float uSpikes, in float uTime, in vec2 uMousePos) {
    if(isMouse) { // use in research
        // generate cursor blob noise (slow down uTime)
        float mouseBlobNoise = snoise3(vec3(uv.x * uSpikes, uv.y * uSpikes, uTime * 0.3));

        float mouseRadius = uMouseRadius;
        // increase mouse radius based on distance from center vec2(0.5)
        mouseRadius = mouseRadius * (1.0 + smoothstep(0.15, 0.45, distance(uMousePos, vec2(0.5))));

        // apply noise to mouseRadius
        float cursorRadius = map(mouseBlobNoise, 0.0, 1.0, mouseRadius - (mouseRadius * 0.2), mouseRadius);

        // draw cursor circle blob at mouse pos
        vec3 cursorColor = mix(color.rgb, uColor, circle(uv, cursorRadius, uMousePos));
        color = vec4(cursorColor, 1.0);
    }
    return color;
}

void main() {
    vec2 uv = vUv;
    vec2 coverUv = cover(uv, uPlaneSize, uImageSize);

    // apply image texture
    vec2 posTexture = coverUv + vec2(uTextureMoveX, uTextureMoveY);

    vec4 _texture = texture2D(uTexture, posTexture);
    vec4 _texture2 = texture2D(uTexture2, posTexture);
    vec4 color = mix(_texture, _texture2, uDisFactor);
    //color = mouseGooey(color, isMouse, uv, uSpikes, uTime, uMousePos);
    // use another circle blob as mask on the color's alpha channel (black === alpha of 0)
    float imageBlobNoise = snoise3(vec3(uv.x * uSpikes, uv.y * uSpikes, uTime * 1.0));
    float radius = map(imageBlobNoise, 0.0, 1.0, uRadius * 0.9, uRadius);
    float mask = circle(uv, radius);
    color.a = mask;
    if(color.a < 1.0) {
        discard;
    }

    gl_FragColor = color;
    gl_FragColor.a = uAlpha;
}
