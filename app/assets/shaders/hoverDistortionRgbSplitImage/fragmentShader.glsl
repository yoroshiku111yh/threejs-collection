uniform sampler2D uTexture;
uniform float uAlpha;
uniform vec2 uOffset;

uniform vec2 uContainSize;
uniform vec2 uTextureSize;

varying vec2 vUv;

void main() {

    vec2 containSize = uContainSize;
    vec2 textureSize = uTextureSize;
    float ratioImage = textureSize.x / textureSize.y;
   

    vec4 _image = texture2D(uTexture, vUv);
    gl_FragColor = _image;
}