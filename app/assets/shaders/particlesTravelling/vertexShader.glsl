uniform float uTime ;
varying vec2 vUv;
varying float vOpacity;
attribute float opacity;
void main(){
    vUv = uv;
    vOpacity = opacity;
    vec4 myPosition = modelViewMatrix * vec4(position, 1.);
    gl_PointSize = 0.5 * 200.;
    gl_Position = projectionMatrix * myPosition;
}