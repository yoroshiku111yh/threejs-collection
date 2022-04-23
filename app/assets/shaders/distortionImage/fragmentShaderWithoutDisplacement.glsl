varying vec2 vUv;
uniform float angle1;
uniform float angle2;
uniform float intensity1;
uniform float intensity2;
uniform vec4 res;
uniform sampler2D texture1;
uniform sampler2D texture2;

uniform float dispFactor;


mat2 getRotM(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat2(c, -s, s, c);
}

void main() {

    //vec2 uv = vUv;
    vec4 _currentImage;
    vec4 _nextImage;
    float intensity = 0.3;
    
    vec2 uv = 0.5 * gl_FragCoord.xy / (res.xy);
    vec2 myUV = (uv - vec2(0.5)) * res.zw + vec2(0.5);

    vec4 orig1 = texture2D(texture1, myUV);
    vec4 orig2 = texture2D(texture2, myUV);
    vec2 dispVec1 = vec2(orig1.r, orig1.g); 
    vec2 dispVec2 = vec2(orig2.r, orig2.g);

    vec2 distortedPos1 = myUV + getRotM(angle1)* dispVec1* intensity1* dispFactor;
    vec2 distortedPos2 = myUV + getRotM(angle2)* dispVec2* intensity2* (1.0 - dispFactor);

    _currentImage = texture2D(texture1, distortedPos1);
    _nextImage = texture2D(texture2, distortedPos2);

    vec4 finalTexture = mix(_currentImage, _nextImage, dispFactor);

    gl_FragColor = finalTexture;

}